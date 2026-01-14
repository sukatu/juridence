from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.gazette import Gazette, GazetteType, GazetteStatus, GazettePriority
from models.people import People
from services.auto_analytics_generator import AutoAnalyticsGenerator
import pandas as pd
from datetime import datetime
import re
import logging
from typing import Optional
import tempfile
import os

router = APIRouter()
logging.basicConfig(level=logging.INFO)

def parse_gazette_date(date_str: str) -> Optional[datetime]:
    """Parse various date formats from Excel data"""
    if pd.isna(date_str) or not date_str:
        return None
    
    formats = [
        "%d %B, %Y",  # 23rd February, 2017
        "%d %B %Y",   # 18 November 2019
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y"
    ]
    
    # Clean the date string
    clean_date = str(date_str).replace('st', '').replace('nd', '').replace('rd', '').replace('th', '').strip()
    
    for fmt in formats:
        try:
            return datetime.strptime(clean_date, fmt)
        except ValueError:
            continue
    
    logging.warning(f"Could not parse date: {date_str}")
    return None

def find_or_create_person(db: Session, full_name: str, **kwargs) -> People:
    """Find existing person or create new one"""
    person = db.query(People).filter(People.full_name.ilike(full_name)).first()
    
    if not person:
        logging.info(f"Creating new person: {full_name}")
        first_name = full_name.split(' ')[0] if full_name else None
        last_name = ' '.join(full_name.split(' ')[1:]) if full_name and len(full_name.split(' ')) > 1 else None
        
        person = People(
            full_name=full_name,
            first_name=first_name,
            last_name=last_name,
            created_by=None  # Set to None to avoid integer conversion error
        )
        
        # Add additional fields from kwargs
        for key, value in kwargs.items():
            if hasattr(person, key) and value:
                setattr(person, key, value)
        
        db.add(person)
        db.commit()
        db.refresh(person)

        # Generate analytics for new person
        try:
            generator = AutoAnalyticsGenerator(db)
            generator.generate_analytics_for_person(person.id)
            logging.info(f"Analytics generated for new person {person.id}")
        except Exception as analytics_error:
            logging.warning(f"Failed to generate analytics for new person {person.id}: {analytics_error}")
    
    return person

def sync_gazette_to_people(db: Session, gazette_entry: Gazette, person: People):
    """Sync gazette data to people table"""
    updated = False
    
    if gazette_entry.gazette_type == GazetteType.CHANGE_OF_NAME:
        if gazette_entry.alias_names and (not person.previous_names or person.previous_names != gazette_entry.alias_names):
            person.previous_names = gazette_entry.alias_names
            updated = True
        if gazette_entry.effective_date_of_change and (not person.effective_date_of_change or person.effective_date_of_change != gazette_entry.effective_date_of_change):
            person.effective_date_of_change = gazette_entry.effective_date_of_change
            updated = True
    
    elif gazette_entry.gazette_type == GazetteType.CHANGE_OF_DATE_OF_BIRTH:
        if gazette_entry.new_date_of_birth and (not person.date_of_birth or person.date_of_birth != gazette_entry.new_date_of_birth):
            person.date_of_birth = gazette_entry.new_date_of_birth
            updated = True
        if gazette_entry.effective_date_of_change and (not person.effective_date_of_change or person.effective_date_of_change != gazette_entry.effective_date_of_change):
            person.effective_date_of_change = gazette_entry.effective_date_of_change
            updated = True
    
    elif gazette_entry.gazette_type == GazetteType.CHANGE_OF_PLACE_OF_BIRTH:
        if gazette_entry.new_place_of_birth and (not person.place_of_birth or person.place_of_birth != gazette_entry.new_place_of_birth):
            person.place_of_birth = gazette_entry.new_place_of_birth
            updated = True
        if gazette_entry.effective_date_of_change and (not person.effective_date_of_change or person.effective_date_of_change != gazette_entry.effective_date_of_change):
            person.effective_date_of_change = gazette_entry.effective_date_of_change
            updated = True
    
    elif gazette_entry.gazette_type == GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS:
        if gazette_entry.officer_title and (not person.job_title or person.job_title != gazette_entry.officer_title):
            person.job_title = gazette_entry.officer_title
            updated = True
        if gazette_entry.appointment_authority and (not person.employer or person.employer != gazette_entry.appointment_authority):
            person.employer = gazette_entry.appointment_authority
            updated = True
        if gazette_entry.jurisdiction_area and (not person.address or person.address != gazette_entry.jurisdiction_area):
            person.address = gazette_entry.jurisdiction_area
            updated = True
    
    # Common fields
    if gazette_entry.source and (not person.gazette_source or person.gazette_source != gazette_entry.source):
        person.gazette_source = gazette_entry.source
        updated = True
    if gazette_entry.gazette_number and (not person.gazette_reference or person.gazette_reference != gazette_entry.gazette_number):
        person.gazette_reference = gazette_entry.gazette_number
        updated = True
    
    if updated:
        db.commit()
        db.refresh(person)
        logging.info(f"Updated person {person.id} with gazette data.")

@router.post("/import-excel")
async def import_gazette_excel(
    file: UploadFile = File(...),
    gazette_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Import gazette data from Excel file"""
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    # Validate gazette type
    try:
        gazette_type_enum = GazetteType(gazette_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid gazette type: {gazette_type}")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Read Excel file
        df = pd.read_excel(tmp_file_path, header=0)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Excel file is empty")
        
        # Log available columns for debugging
        logging.info(f"Available columns: {list(df.columns)}")
        logging.info(f"First row data: {df.iloc[0].to_dict()}")
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Process based on gazette type
                if gazette_type_enum == GazetteType.CHANGE_OF_NAME:
                    gazette_entry, person = process_change_of_name(db, row, index)
                elif gazette_type_enum == GazetteType.CHANGE_OF_DATE_OF_BIRTH:
                    gazette_entry, person = process_change_of_date_of_birth(db, row, index)
                elif gazette_type_enum == GazetteType.CHANGE_OF_PLACE_OF_BIRTH:
                    gazette_entry, person = process_change_of_place_of_birth(db, row, index)
                elif gazette_type_enum == GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS:
                    gazette_entry, person = process_marriage_officers(db, row, index)
                else:
                    raise HTTPException(status_code=400, detail=f"Unsupported gazette type: {gazette_type}")
                
                if gazette_entry and person:
                    # Sync gazette data to people table
                    sync_gazette_to_people(db, gazette_entry, person)
                    imported_count += 1
                    logging.info(f"Imported gazette entry: {gazette_entry.title}")
                
            except Exception as e:
                db.rollback()
                skipped_count += 1
                error_msg = f"Row {index + 1}: {str(e)}"
                errors.append(error_msg)
                logging.error(f"Error processing row {index + 1}: {e}", exc_info=True)
        
        return {
            "success": True,
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "total_rows": len(df),
            "errors": errors[:10],  # Limit to first 10 errors
            "gazette_type": gazette_type
        }
        
    except Exception as e:
        logging.error(f"Error during import: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

def process_change_of_name(db: Session, row, index: int):
    """Process Change of Name data"""
    try:
        # Extract data from row (flexible column name matching)
        old_name = ''
        new_name = ''
        alias_str = ''
        
        # Try different possible column names
        for col in row.index:
            col_lower = col.lower().strip()
            if 'old' in col_lower and 'name' in col_lower:
                old_name = str(row[col]).strip() if pd.notna(row[col]) else ''
            elif 'new' in col_lower and 'name' in col_lower:
                new_name = str(row[col]).strip() if pd.notna(row[col]) else ''
            elif 'alias' in col_lower:
                alias_str = str(row[col]).strip() if pd.notna(row[col]) else ''
        
        logging.info(f"Row {index + 1}: old_name='{old_name}', new_name='{new_name}', alias_str='{alias_str}'")
        
        if not old_name and not new_name:
            logging.warning(f"Row {index + 1}: No valid names found, skipping")
            return None, None
        
        # Use new_name as primary name, fallback to old_name
        primary_name = new_name if new_name else old_name
        
        # Find or create person
        logging.info(f"Creating/finding person: {primary_name}")
        person = find_or_create_person(db, primary_name)
        logging.info(f"Person found/created: {person.id} - {person.full_name}")
        
        # Parse alias names
        alias_names = [alias.strip() for alias in alias_str.split(',') if alias.strip()] if alias_str else []
        if old_name and old_name != new_name:
            alias_names.append(old_name)
        
        # Create gazette entry
        gazette_date = parse_gazette_date(row.get('Gazette Date'))
        effective_date = parse_gazette_date(row.get('Effective Date'))
        
        gazette = Gazette(
            title=f"Change of Name - {primary_name}",
            content=f"Name change from {old_name} to {new_name}",
            gazette_type=GazetteType.CHANGE_OF_NAME,
            status=GazetteStatus.PUBLISHED,
            priority=GazettePriority.MEDIUM,
            publication_date=gazette_date or effective_date or datetime.now(),
            effective_date=effective_date,
            old_name=old_name,
            new_name=new_name,
            alias_names=alias_names,
            effective_date_of_change=effective_date,
            gazette_date=gazette_date,
            source=str(row.get('Source', '')).strip() if pd.notna(row.get('Source')) else '',
            gazette_number=str(row.get('Gazette Number', '')).strip() if pd.notna(row.get('Gazette Number')) else '',
            page_number=int(row.get('Page Number', 0)) if pd.notna(row.get('Page Number')) else None,
            jurisdiction="Ghana",
            person_id=person.id,
            is_public=True,
            created_by=None
        )
        
        db.add(gazette)
        db.commit()
        db.refresh(gazette)
        
        return gazette, person
        
    except Exception as e:
        logging.error(f"Error processing change of name row {index + 1}: {e}")
        return None, None

def process_change_of_date_of_birth(db: Session, row, index: int):
    """Process Change of Date of Birth data"""
    try:
        name = str(row.get('Name', '')).strip() if pd.notna(row.get('Name')) else ''
        old_dob = parse_gazette_date(row.get('Old Date of Birth'))
        new_dob = parse_gazette_date(row.get('New Date of Birth'))
        
        if not name:
            return None, None
        
        # Find or create person
        person = find_or_create_person(db, name)
        
        # Create gazette entry
        gazette_date = parse_gazette_date(row.get('Gazette Date'))
        effective_date = parse_gazette_date(row.get('Effective Date'))
        
        gazette = Gazette(
            title=f"Change of Date of Birth - {name}",
            content=f"Date of birth change from {old_dob} to {new_dob}",
            gazette_type=GazetteType.CHANGE_OF_DATE_OF_BIRTH,
            status=GazetteStatus.PUBLISHED,
            priority=GazettePriority.MEDIUM,
            publication_date=gazette_date or effective_date or datetime.now(),
            effective_date=effective_date,
            old_date_of_birth=old_dob,
            new_date_of_birth=new_dob,
            effective_date_of_change=effective_date,
            gazette_date=gazette_date,
            source=str(row.get('Source', '')).strip() if pd.notna(row.get('Source')) else '',
            gazette_number=str(row.get('Gazette Number', '')).strip() if pd.notna(row.get('Gazette Number')) else '',
            page_number=int(row.get('Page Number', 0)) if pd.notna(row.get('Page Number')) else None,
            jurisdiction="Ghana",
            person_id=person.id,
            is_public=True,
            created_by=None
        )
        
        db.add(gazette)
        db.commit()
        db.refresh(gazette)
        
        return gazette, person
        
    except Exception as e:
        logging.error(f"Error processing change of date of birth row {index + 1}: {e}")
        return None, None

def process_change_of_place_of_birth(db: Session, row, index: int):
    """Process Change of Place of Birth data"""
    try:
        name = str(row.get('Name', '')).strip() if pd.notna(row.get('Name')) else ''
        old_pob = str(row.get('Old Place of Birth', '')).strip() if pd.notna(row.get('Old Place of Birth')) else ''
        new_pob = str(row.get('New Place of Birth', '')).strip() if pd.notna(row.get('New Place of Birth')) else ''
        
        if not name:
            return None, None
        
        # Find or create person
        person = find_or_create_person(db, name)
        
        # Create gazette entry
        gazette_date = parse_gazette_date(row.get('Gazette Date'))
        effective_date = parse_gazette_date(row.get('Effective Date'))
        
        gazette = Gazette(
            title=f"Change of Place of Birth - {name}",
            content=f"Place of birth change from {old_pob} to {new_pob}",
            gazette_type=GazetteType.CHANGE_OF_PLACE_OF_BIRTH,
            status=GazetteStatus.PUBLISHED,
            priority=GazettePriority.MEDIUM,
            publication_date=gazette_date or effective_date or datetime.now(),
            effective_date=effective_date,
            old_place_of_birth=old_pob,
            new_place_of_birth=new_pob,
            effective_date_of_change=effective_date,
            gazette_date=gazette_date,
            source=str(row.get('Source', '')).strip() if pd.notna(row.get('Source')) else '',
            gazette_number=str(row.get('Gazette Number', '')).strip() if pd.notna(row.get('Gazette Number')) else '',
            page_number=int(row.get('Page Number', 0)) if pd.notna(row.get('Page Number')) else None,
            jurisdiction="Ghana",
            person_id=person.id,
            is_public=True,
            created_by=None
        )
        
        db.add(gazette)
        db.commit()
        db.refresh(gazette)
        
        return gazette, person
        
    except Exception as e:
        logging.error(f"Error processing change of place of birth row {index + 1}: {e}")
        return None, None

def process_marriage_officers(db: Session, row, index: int):
    """Process Appointment of Marriage Officers data"""
    try:
        officer_name = str(row.get('Name of the Appointed Marriage Officer', '')).strip() if pd.notna(row.get('Name of the Appointed Marriage Officer')) else ''
        church = str(row.get('Church of the Marriage Officer', '')).strip() if pd.notna(row.get('Church of the Marriage Officer')) else ''
        location = str(row.get('Location of the Church', '')).strip() if pd.notna(row.get('Location of the Church')) else ''
        appointing_authority = str(row.get('Appointing Authority', '')).strip() if pd.notna(row.get('Appointing Authority')) else ''
        
        if not officer_name:
            return None, None
        
        # Find or create person
        person = find_or_create_person(
            db, 
            officer_name,
            occupation=f"Marriage Officer",
            organization=church,
            address=location
        )
        
        # Create gazette entry
        gazette_date = parse_gazette_date(row.get('Gazette Date'))
        effective_date = parse_gazette_date(row.get('Appointment Date'))
        
        gazette = Gazette(
            title=f"Appointment of Marriage Officer - {officer_name}",
            content=f"Appointment of Marriage Officer - {officer_name}\n\nOfficer Details:\n- Name: {officer_name}\n- Church: {church}\n- Location: {location}\n- Appointing Authority: {appointing_authority}",
            gazette_type=GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS,
            status=GazetteStatus.PUBLISHED,
            priority=GazettePriority.MEDIUM,
            publication_date=gazette_date or effective_date or datetime.now(),
            effective_date=effective_date,
            officer_name=officer_name,
            officer_title="Marriage Officer",
            appointment_authority=appointing_authority,
            jurisdiction_area=location,
            effective_date_of_change=effective_date,
            gazette_date=gazette_date,
            source=str(row.get('Source (Gazette No., Date, Page)', '')).strip() if pd.notna(row.get('Source (Gazette No., Date, Page)')) else '',
            gazette_number=str(row.get('Gazette Number', '')).strip() if pd.notna(row.get('Gazette Number')) else '',
            page_number=int(row.get('Page Number', 0)) if pd.notna(row.get('Page Number')) else None,
            jurisdiction="Ghana",
            person_id=person.id,
            is_public=True,
            created_by=None
        )
        
        db.add(gazette)
        db.commit()
        db.refresh(gazette)
        
        return gazette, person
        
    except Exception as e:
        logging.error(f"Error processing marriage officers row {index + 1}: {e}")
        return None, None
