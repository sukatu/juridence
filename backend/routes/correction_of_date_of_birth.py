from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional
from datetime import datetime, date
import math
import logging

from database import get_db
from models.correction_of_date_of_birth import CorrectionOfDateOfBirth
from schemas.correction_of_date_of_birth import (
    CorrectionOfDateOfBirthCreate,
    CorrectionOfDateOfBirthUpdate,
    CorrectionOfDateOfBirthResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/correction-of-date-of-birth", tags=["correction-of-date-of-birth"])

# List Correction of Date of Birth Entries with Search and Filtering
@router.get("/")
def search_correction_of_date_of_birth(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by person_name column only"),
    gazette_number: Optional[str] = Query(None),
    gazette_date_from: Optional[date] = Query(None),
    gazette_date_to: Optional[date] = Query(None),
    effective_date_from: Optional[date] = Query(None),
    effective_date_to: Optional[date] = Query(None),
    sort_by: str = Query("gazette_date", regex="^(gazette_date|effective_date|person_name|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Search correction of date of birth entries - searches ONLY person_name column"""
    try:
        query = db.query(CorrectionOfDateOfBirth)
        
        # Apply search filter - ONLY search person_name column
        if search:
            # Clean and prepare search term - trim whitespace
            search_cleaned = search.strip()
            if search_cleaned:
                # Simple case-insensitive search on person_name column only
                # Use ilike for case-insensitive partial matching
                search_term = f"%{search_cleaned}%"
                
                # Debug logging - show exactly what we're searching for
                print(f"[DEBUG] =========================================")
                print(f"[DEBUG] Search request received for correction_of_date_of_birth")
                print(f"[DEBUG] Raw search parameter: '{search}'")
                print(f"[DEBUG] Cleaned search term: '{search_cleaned}'")
                print(f"[DEBUG] Search pattern: '{search_term}'")
                print(f"[DEBUG] =========================================")
                logger.info(f"Searching correction_of_date_of_birth.person_name with term: '{search_cleaned}' (pattern: '{search_term}')")
                
                # Search ONLY in person_name column using ilike
                query = query.filter(CorrectionOfDateOfBirth.person_name.ilike(search_term))
                
                # Check how many results before other filters
                try:
                    count_after_search = query.count()
                    print(f"[DEBUG] Results after search filter: {count_after_search}")
                    logger.info(f"Results after search filter: {count_after_search}")
                except Exception as count_err:
                    print(f"[DEBUG ERROR] Error counting after search: {count_err}")
                    logger.error(f"Error counting after search: {count_err}")
        
        # Apply gazette number filter
        if gazette_number:
            query = query.filter(CorrectionOfDateOfBirth.gazette_number.ilike(f"%{gazette_number}%"))
        
        # Apply gazette date filters
        if gazette_date_from:
            query = query.filter(CorrectionOfDateOfBirth.gazette_date >= gazette_date_from)
        if gazette_date_to:
            query = query.filter(CorrectionOfDateOfBirth.gazette_date <= gazette_date_to)
        
        # Apply effective date filters
        if effective_date_from:
            query = query.filter(CorrectionOfDateOfBirth.effective_date >= effective_date_from)
        if effective_date_to:
            query = query.filter(CorrectionOfDateOfBirth.effective_date <= effective_date_to)
        
        # Apply sorting
        sort_column = getattr(CorrectionOfDateOfBirth, sort_by, CorrectionOfDateOfBirth.gazette_date)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Get total count
        try:
            total = query.count()
            print(f"[DEBUG] Total results after all filters: {total}, page: {page}, limit: {limit}")
            logger.info(f"Total results after all filters: {total}, page: {page}, limit: {limit}")
        except Exception as e:
            print(f"[DEBUG ERROR] Error getting total count: {e}")
            logger.error(f"Error getting total count: {e}")
            total = 0
        
        # Apply pagination
        try:
            offset = (page - 1) * limit
            entries = query.offset(offset).limit(limit).all()
            print(f"[DEBUG] Returning {len(entries)} entries for page {page}")
            logger.info(f"Returning {len(entries)} entries for page {page}")
        except Exception as e:
            print(f"[DEBUG ERROR] Error fetching entries: {e}")
            logger.error(f"Error fetching entries: {e}")
            entries = []
        
        # Format results
        results = []
        for entry in entries:
            results.append({
                "id": entry.id,
                "person_name": entry.person_name,
                "alias": entry.alias,
                "profession": entry.profession,
                "address": entry.address,
                "gender": entry.gender,
                "old_date_of_birth": entry.old_date_of_birth.isoformat() if entry.old_date_of_birth else None,
                "new_date_of_birth": entry.new_date_of_birth.isoformat() if entry.new_date_of_birth else None,
                "effective_date": entry.effective_date.isoformat() if entry.effective_date else None,
                "remarks": entry.remarks,
                "gazette_number": entry.gazette_number,
                "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                "page": entry.page,
                "document_filename": entry.document_filename,
                "source_details": entry.source_details,
                "person_id": entry.person_id,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,
            })
        
        print(f"[DEBUG] Formatted {len(results)} results for response")
        logger.info(f"Formatted {len(results)} results for response")
        
        return {
            "results": results,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if limit > 0 else 0
        }
    except Exception as e:
        print(f"[DEBUG ERROR] Error in search_correction_of_date_of_birth: {e}")
        logger.error(f"Error in search_correction_of_date_of_birth: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching correction of date of birth: {str(e)}")

# Get Correction of Date of Birth Entry by ID
@router.get("/{entry_id}", response_model=CorrectionOfDateOfBirthResponse)
def get_correction_of_date_of_birth(entry_id: int, db: Session = Depends(get_db)):
    """Get a specific correction of date of birth entry by ID"""
    entry = db.query(CorrectionOfDateOfBirth).filter(CorrectionOfDateOfBirth.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Correction of date of birth entry not found")
    return entry

# Create Correction of Date of Birth Entry
@router.post("/", response_model=CorrectionOfDateOfBirthResponse, status_code=status.HTTP_201_CREATED)
def create_correction_of_date_of_birth(
    entry: CorrectionOfDateOfBirthCreate,
    db: Session = Depends(get_db)
):
    """Create a new correction of date of birth entry"""
    try:
        db_entry = CorrectionOfDateOfBirth(**entry.dict())
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating correction of date of birth entry: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating entry: {str(e)}")

# Update Correction of Date of Birth Entry
@router.put("/{entry_id}", response_model=CorrectionOfDateOfBirthResponse)
def update_correction_of_date_of_birth(
    entry_id: int,
    entry_update: CorrectionOfDateOfBirthUpdate,
    db: Session = Depends(get_db)
):
    """Update a correction of date of birth entry"""
    try:
        db_entry = db.query(CorrectionOfDateOfBirth).filter(CorrectionOfDateOfBirth.id == entry_id).first()
        if not db_entry:
            raise HTTPException(status_code=404, detail="Correction of date of birth entry not found")
        
        update_data = entry_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_entry, field, value)
        
        db_entry.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating correction of date of birth entry: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating entry: {str(e)}")

# Delete Correction of Date of Birth Entry
@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_correction_of_date_of_birth(entry_id: int, db: Session = Depends(get_db)):
    """Delete a correction of date of birth entry"""
    try:
        db_entry = db.query(CorrectionOfDateOfBirth).filter(CorrectionOfDateOfBirth.id == entry_id).first()
        if not db_entry:
            raise HTTPException(status_code=404, detail="Correction of date of birth entry not found")
        
        db.delete(db_entry)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting correction of date of birth entry: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting entry: {str(e)}")
