from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.person_case_link import PersonCaseLink
from models.people import People
from models.reported_cases import ReportedCases
from auth import get_current_user
from models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/people", tags=["person_case_links"])

class PersonCaseLinkCreate(BaseModel):
    person_id: int
    case_id: Optional[int] = None
    case_number: Optional[str] = None
    case_title: Optional[str] = None
    role_in_case: str
    notes: Optional[str] = None

class PersonCaseLinkResponse(BaseModel):
    id: int
    person_id: int
    case_id: Optional[int] = None
    case_number: Optional[str] = None
    case_title: Optional[str] = None
    role_in_case: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    person_full_name: Optional[str] = None  # Add person full name to response

    class Config:
        from_attributes = True

@router.post("/{person_id}/case-links", response_model=PersonCaseLinkResponse)
async def create_person_case_link(
    person_id: int,
    case_link_data: PersonCaseLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Link a person to a case"""
    # Verify person exists
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    # If case_id is provided, verify case exists
    if case_link_data.case_id:
        case = db.query(ReportedCases).filter(ReportedCases.id == case_link_data.case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
    
    case_link = PersonCaseLink(
        person_id=person_id,
        **case_link_data.dict(exclude={'person_id'})
    )
    db.add(case_link)
    db.commit()
    db.refresh(case_link)
    
    return case_link

@router.get("/{person_id}/case-links", response_model=List[PersonCaseLinkResponse])
async def get_person_case_links(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Get case links for a person"""
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    return db.query(PersonCaseLink).filter(PersonCaseLink.person_id == person_id).all()

@router.get("/case/{case_id}/person-links", response_model=List[PersonCaseLinkResponse])
async def get_case_person_links(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get person links for a specific case"""
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Fetch person links and join with People to get full_name
    person_links = db.query(PersonCaseLink, People.full_name.label("person_full_name")) \
        .join(People, PersonCaseLink.person_id == People.id) \
        .filter(PersonCaseLink.case_id == case_id) \
        .all()
    
    # Manually construct response to include person_full_name
    result = []
    for link, person_full_name in person_links:
        result.append({
            "id": link.id,
            "person_id": link.person_id,
            "case_id": link.case_id,
            "case_number": link.case_number,
            "case_title": link.case_title,
            "role_in_case": link.role_in_case,
            "notes": link.notes,
            "created_at": link.created_at,
            "updated_at": link.updated_at,
            "person_full_name": person_full_name  # Add full name to response
        })
    
    return result
