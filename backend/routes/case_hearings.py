from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.case_hearings import CaseHearing
from models.reported_cases import ReportedCases
from schemas.case_hearings import CaseHearing as CaseHearingSchema, CaseHearingCreate, CaseHearingUpdate
from auth import get_current_user
from models.user import User

router = APIRouter()

@router.get("/cases/{case_id}/hearings", response_model=List[CaseHearingSchema])
async def get_case_hearings(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all hearings for a specific case"""
    # Verify case exists
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    hearings = db.query(CaseHearing).filter(CaseHearing.case_id == case_id).order_by(CaseHearing.hearing_date).all()
    return hearings

@router.post("/cases/{case_id}/hearings", response_model=CaseHearingSchema)
async def create_case_hearing(
    case_id: int,
    hearing: CaseHearingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new hearing for a case"""
    # Verify case exists
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Create hearing
    db_hearing = CaseHearing(
        case_id=case_id,
        **hearing.dict()
    )
    db.add(db_hearing)
    db.commit()
    db.refresh(db_hearing)
    return db_hearing

@router.put("/hearings/{hearing_id}", response_model=CaseHearingSchema)
async def update_case_hearing(
    hearing_id: int,
    hearing: CaseHearingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a case hearing"""
    db_hearing = db.query(CaseHearing).filter(CaseHearing.id == hearing_id).first()
    if not db_hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    update_data = hearing.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_hearing, field, value)
    
    db.commit()
    db.refresh(db_hearing)
    return db_hearing

@router.delete("/hearings/{hearing_id}")
async def delete_case_hearing(
    hearing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a case hearing"""
    db_hearing = db.query(CaseHearing).filter(CaseHearing.id == hearing_id).first()
    if not db_hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    db.delete(db_hearing)
    db.commit()
    return {"message": "Hearing deleted successfully"}
