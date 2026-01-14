from sqlalchemy.orm import Session
from models.people import People
from models.employee import Employee
from datetime import datetime
from typing import Optional

def sync_employee_to_people(employee: Employee, db: Session) -> Optional[People]:
    """
    Sync employee data to the people table
    Creates a new people record or updates existing one
    """
    try:
        # Check if a people record already exists for this employee
        existing_person = db.query(People).filter(
            People.first_name == employee.first_name,
            People.last_name == employee.last_name,
            People.email == employee.email
        ).first()
        
        if existing_person:
            # Update existing person record with employee data
            existing_person.phone_number = employee.phone_number or existing_person.phone_number
            existing_person.email = employee.email or existing_person.email
            existing_person.address = employee.address or existing_person.address
            existing_person.city = employee.city or existing_person.city
            existing_person.region = employee.region or existing_person.region
            existing_person.country = employee.country or existing_person.country
            existing_person.postal_code = employee.postal_code or existing_person.postal_code
            existing_person.occupation = employee.job_title or existing_person.occupation
            existing_person.employer = employee.current_employer_name or existing_person.employer
            existing_person.organization = employee.current_employer_name or existing_person.organization
            existing_person.job_title = employee.job_title or existing_person.job_title
            existing_person.marital_status = employee.marital_status or existing_person.marital_status
            existing_person.nationality = employee.nationality or existing_person.nationality
            existing_person.gender = employee.gender or existing_person.gender
            # Convert employee languages format to people format
            if employee.languages:
                existing_person.languages = [lang.get('language', str(lang)) if isinstance(lang, dict) else str(lang) for lang in employee.languages]
            elif not existing_person.languages:
                existing_person.languages = None
            existing_person.updated_at = datetime.utcnow()
            existing_person.updated_by = employee.created_by
            
            # Update full name
            existing_person.full_name = f"{employee.first_name} {employee.last_name}"
            
            db.commit()
            db.refresh(existing_person)
            return existing_person
        else:
            # Create new people record
            person = People(
                first_name=employee.first_name,
                last_name=employee.last_name,
                full_name=f"{employee.first_name} {employee.last_name}",
                date_of_birth=employee.date_of_birth,
                phone_number=employee.phone_number,
                email=employee.email,
                address=employee.address,
                city=employee.city,
                region=employee.region,
                country=employee.country or "Ghana",
                postal_code=employee.postal_code,
                occupation=employee.job_title,
                employer=employee.current_employer_name,
                organization=employee.current_employer_name,
                job_title=employee.job_title,
                marital_status=employee.marital_status,
                nationality=employee.nationality or "Ghanaian",
                gender=employee.gender,
                languages=[lang.get('language', str(lang)) if isinstance(lang, dict) else str(lang) for lang in employee.languages] if employee.languages else None,
                is_verified=employee.is_verified,
                status="active",
                created_at=employee.created_at,
                updated_at=employee.updated_at,
                created_by=employee.created_by,
                updated_by=employee.updated_by
            )
            
            db.add(person)
            db.commit()
            db.refresh(person)
            return person
            
    except Exception as e:
        print(f"Error syncing employee to people: {e}")
        db.rollback()
        return None

def update_people_from_employee(employee: Employee, db: Session) -> Optional[People]:
    """
    Update existing people record when employee is updated
    """
    try:
        # Find the people record for this employee
        person = db.query(People).filter(
            People.first_name == employee.first_name,
            People.last_name == employee.last_name,
            People.email == employee.email
        ).first()
        
        if person:
            # Update the people record with latest employee data
            person.phone_number = employee.phone_number or person.phone_number
            person.email = employee.email or person.email
            person.address = employee.address or person.address
            person.city = employee.city or person.city
            person.region = employee.region or person.region
            person.country = employee.country or person.country
            person.postal_code = employee.postal_code or person.postal_code
            person.occupation = employee.job_title or person.occupation
            person.employer = employee.current_employer_name or person.employer
            person.organization = employee.current_employer_name or person.organization
            person.job_title = employee.job_title or person.job_title
            person.marital_status = employee.marital_status or person.marital_status
            person.nationality = employee.nationality or person.nationality
            person.gender = employee.gender or person.gender
            # Convert employee languages format to people format
            if employee.languages:
                person.languages = [lang.get('language', str(lang)) if isinstance(lang, dict) else str(lang) for lang in employee.languages]
            elif not person.languages:
                person.languages = None
            person.is_verified = employee.is_verified
            person.updated_at = datetime.utcnow()
            person.updated_by = employee.updated_by
            
            # Update full name
            person.full_name = f"{employee.first_name} {employee.last_name}"
            
            db.commit()
            db.refresh(person)
            return person
            
    except Exception as e:
        print(f"Error updating people from employee: {e}")
        db.rollback()
        return None

def delete_people_when_employee_deleted(employee: Employee, db: Session) -> bool:
    """
    Delete or deactivate people record when employee is deleted
    """
    try:
        # Find the people record for this employee
        person = db.query(People).filter(
            People.first_name == employee.first_name,
            People.last_name == employee.last_name,
            People.email == employee.email
        ).first()
        
        if person:
            # Instead of deleting, mark as inactive
            person.status = "inactive"
            person.updated_at = datetime.utcnow()
            person.updated_by = employee.updated_by
            
            db.commit()
            return True
            
    except Exception as e:
        print(f"Error updating people when employee deleted: {e}")
        db.rollback()
        return False
