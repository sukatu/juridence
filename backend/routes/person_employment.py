from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.person_employment import PersonEmployment
from models.people import People
from auth import get_current_user
from models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/people", tags=["person_employment"])

class PersonEmploymentCreate(BaseModel):
    person_id: int
    company_name: str
    position: str
    department: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    reason_for_leaving: Optional[str] = None
    source: Optional[str] = None
    address: Optional[str] = None

class PersonEmploymentResponse(BaseModel):
    id: int
    person_id: int
    company_name: str
    position: str
    department: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool
    reason_for_leaving: Optional[str] = None
    source: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.post("/{person_id}/employment", response_model=PersonEmploymentResponse)
async def create_person_employment(
    person_id: int,
    employment_data: PersonEmploymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add employment history for a person"""
    # Verify person exists
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    employment = PersonEmployment(
        person_id=person_id,
        **employment_data.dict(exclude={'person_id'})
    )
    db.add(employment)
    db.commit()
    db.refresh(employment)
    
    return employment

@router.get("/{person_id}/employment", response_model=List[PersonEmploymentResponse])
async def get_person_employment(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Get employment history for a person"""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    return db.query(PersonEmployment).filter(PersonEmployment.person_id == person_id).all()

@router.put("/{person_id}/employment/{employment_id}", response_model=PersonEmploymentResponse)
async def update_person_employment(
    person_id: int,
    employment_id: int,
    employment_data: PersonEmploymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an employment record for a person"""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    employment = db.query(PersonEmployment).filter(
        PersonEmployment.id == employment_id,
        PersonEmployment.person_id == person_id
    ).first()
    
    if not employment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employment record not found"
        )
    
    # Update fields
    update_data = employment_data.dict(exclude={'person_id'}, exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(employment, field):
            setattr(employment, field, value)
    
    db.commit()
    db.refresh(employment)
    
    return employment

@router.delete("/{person_id}/employment/{employment_id}")
async def delete_person_employment(
    person_id: int,
    employment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an employment record for a person"""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    employment = db.query(PersonEmployment).filter(
        PersonEmployment.id == employment_id,
        PersonEmployment.person_id == person_id
    ).first()
    
    if not employment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employment record not found"
        )
    
    db.delete(employment)
    db.commit()
    
    return {"message": "Employment record deleted successfully"}
