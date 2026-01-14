from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.person_relationship import PersonRelationship
from models.people import People
from auth import get_current_user
from models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/people", tags=["person_relationships"])

class PersonRelationshipCreate(BaseModel):
    person_id: int
    related_person_id: Optional[int] = None
    related_person_name: str
    relationship_type: str
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class PersonRelationshipResponse(BaseModel):
    id: int
    person_id: int
    related_person_id: Optional[int] = None
    related_person_name: str
    relationship_type: str
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    related_person: Optional[dict] = None  # Full person data if related_person_id exists

    class Config:
        from_attributes = True

@router.post("/{person_id}/relationships", response_model=PersonRelationshipResponse)
async def create_person_relationship(
    person_id: int,
    relationship_data: PersonRelationshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a relationship for a person"""
    # Verify person exists
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    relationship = PersonRelationship(
        person_id=person_id,
        **relationship_data.dict(exclude={'person_id'})
    )
    db.add(relationship)
    db.commit()
    db.refresh(relationship)
    
    # Build response dictionary matching PersonRelationshipResponse schema
    rel_dict = {
        "id": relationship.id,
        "person_id": relationship.person_id,
        "related_person_id": relationship.related_person_id,
        "related_person_name": relationship.related_person_name,
        "relationship_type": relationship.relationship_type,
        "phone": relationship.phone,
        "email": relationship.email,
        "notes": relationship.notes,
        "created_at": relationship.created_at,
        "updated_at": relationship.updated_at
    }
    
    # If related_person_id exists, fetch and include full person data
    if relationship.related_person_id:
        related_person = db.query(People).filter(People.id == relationship.related_person_id).first()
        if related_person:
            rel_dict["related_person"] = {
                "id": related_person.id,
                "full_name": related_person.full_name,
                "first_name": related_person.first_name,
                "last_name": related_person.last_name,
                "date_of_birth": related_person.date_of_birth,
                "place_of_birth": related_person.place_of_birth,
                "phone_number": related_person.phone_number,
                "email": related_person.email,
                "city": related_person.city,
                "region": related_person.region,
                "employer": related_person.employer,
                "organization": related_person.organization,
                "job_title": related_person.job_title,
                "occupation": related_person.occupation,
                "case_count": related_person.case_count,
                "risk_score": related_person.risk_score,
                "risk_level": related_person.risk_level
            }
    
    return rel_dict

@router.get("/{person_id}/relationships", response_model=List[PersonRelationshipResponse])
async def get_person_relationships(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Get relationships for a person"""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    relationships = db.query(PersonRelationship).filter(PersonRelationship.person_id == person_id).all()
    
    # Include related person details if related_person_id exists
    result = []
    for rel in relationships:
        rel_dict = {
            "id": rel.id,
            "person_id": rel.person_id,
            "related_person_id": rel.related_person_id,
            "related_person_name": rel.related_person_name,
            "relationship_type": rel.relationship_type,
            "phone": rel.phone,
            "email": rel.email,
            "notes": rel.notes,
            "created_at": rel.created_at,
            "updated_at": rel.updated_at
        }
        
        # If related_person_id exists, fetch and include full person data
        if rel.related_person_id:
            related_person = db.query(People).filter(People.id == rel.related_person_id).first()
            if related_person:
                rel_dict["related_person"] = {
                    "id": related_person.id,
                    "full_name": related_person.full_name,
                    "first_name": related_person.first_name,
                    "last_name": related_person.last_name,
                    "date_of_birth": related_person.date_of_birth,
                    "place_of_birth": related_person.place_of_birth,
                    "phone_number": related_person.phone_number,
                    "email": related_person.email,
                    "city": related_person.city,
                    "region": related_person.region,
                    "employer": related_person.employer,
                    "organization": related_person.organization,
                    "job_title": related_person.job_title,
                    "occupation": related_person.occupation,
                    "case_count": related_person.case_count,
                    "risk_score": related_person.risk_score,
                    "risk_level": related_person.risk_level
                }
        
        result.append(rel_dict)
    
    return result

@router.delete("/{person_id}/relationships/{relationship_id}")
async def delete_person_relationship(
    person_id: int,
    relationship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a relationship for a person"""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    relationship = db.query(PersonRelationship).filter(
        PersonRelationship.id == relationship_id,
        PersonRelationship.person_id == person_id
    ).first()
    
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found"
        )
    
    db.delete(relationship)
    db.commit()
    
    return {"message": "Relationship deleted successfully"}
