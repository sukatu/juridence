from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
import math
from datetime import date, datetime

from database import get_db
from models.cause_list import CauseList
from schemas.cause_list import CauseListCreate, CauseListUpdate, CauseListResponse
from auth import get_current_user
from models.user import User

router = APIRouter()

@router.get("/admin/cause-lists", response_model=dict)
async def get_cause_lists(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[str] = Query(None, description="Filter by status"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    judge_id: Optional[int] = Query(None, description="Filter by judge ID"),
    registry_id: Optional[int] = Query(None, description="Filter by registry ID"),
    court_id: Optional[int] = Query(None, description="Filter by court ID"),
    hearing_date_from: Optional[date] = Query(None, description="Filter by hearing date from"),
    hearing_date_to: Optional[date] = Query(None, description="Filter by hearing date to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of cause lists with filtering and pagination"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query
    query = db.query(CauseList).filter(CauseList.is_active == True)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CauseList.case_title.ilike(search_term),
                CauseList.suit_no.ilike(search_term),
                CauseList.first_party_name.ilike(search_term),
                CauseList.second_party_name.ilike(search_term),
                CauseList.judge_name.ilike(search_term)
            )
        )
    
    if status:
        query = query.filter(CauseList.status == status)
    
    if case_type:
        query = query.filter(CauseList.case_type == case_type)
    
    if judge_id:
        query = query.filter(CauseList.judge_id == judge_id)
    
    if registry_id:
        query = query.filter(CauseList.registry_id == registry_id)
    
    if court_id:
        query = query.filter(CauseList.court_id == court_id)
    
    if hearing_date_from:
        query = query.filter(CauseList.hearing_date >= hearing_date_from)
    
    if hearing_date_to:
        query = query.filter(CauseList.hearing_date <= hearing_date_to)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    cause_lists = query.order_by(CauseList.hearing_date.desc(), CauseList.hearing_time).offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return {
        "cause_lists": cause_lists,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/admin/cause-lists/{cause_list_id}", response_model=CauseListResponse)
async def get_cause_list(
    cause_list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific cause list by ID"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cause_list = db.query(CauseList).filter(CauseList.id == cause_list_id).first()
    if not cause_list:
        raise HTTPException(status_code=404, detail="Cause list not found")
    
    return cause_list

@router.post("/admin/cause-lists", response_model=CauseListResponse)
async def create_cause_list(
    cause_list_data: CauseListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new cause list entry"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create new cause list
    db_cause_list = CauseList(
        **cause_list_data.dict(),
        created_by=current_user.email or current_user.username,
        updated_by=current_user.email or current_user.username
    )
    
    db.add(db_cause_list)
    db.commit()
    db.refresh(db_cause_list)
    
    return db_cause_list

@router.put("/admin/cause-lists/{cause_list_id}", response_model=CauseListResponse)
async def update_cause_list(
    cause_list_id: int,
    cause_list_data: CauseListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a cause list entry"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cause_list = db.query(CauseList).filter(CauseList.id == cause_list_id).first()
    if not cause_list:
        raise HTTPException(status_code=404, detail="Cause list not found")
    
    # Update fields - schema validator will handle time parsing from string
    update_data = cause_list_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(cause_list, field, value)
    
    cause_list.updated_by = current_user.email or current_user.username
    
    db.commit()
    db.refresh(cause_list)
    
    return cause_list

@router.delete("/admin/cause-lists/{cause_list_id}")
async def delete_cause_list(
    cause_list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a cause list entry (soft delete)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cause_list = db.query(CauseList).filter(CauseList.id == cause_list_id).first()
    if not cause_list:
        raise HTTPException(status_code=404, detail="Cause list not found")
    
    # Soft delete
    cause_list.is_active = False
    cause_list.updated_by = current_user.email or current_user.username
    
    db.commit()
    
    return {"message": "Cause list deleted successfully"}

@router.get("/admin/cause-lists/calendar/events", response_model=List[dict])
async def get_calendar_events(
    start_date: date = Query(..., description="Start date for calendar view"),
    end_date: date = Query(..., description="End date for calendar view"),
    judge_id: Optional[int] = Query(None, description="Filter by judge ID"),
    registry_id: Optional[int] = Query(None, description="Filter by registry ID"),
    court_id: Optional[int] = Query(None, description="Filter by court ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cause list events for calendar view"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(CauseList).filter(
        and_(
            CauseList.is_active == True,
            CauseList.hearing_date >= start_date,
            CauseList.hearing_date <= end_date
        )
    )
    
    if judge_id:
        query = query.filter(CauseList.judge_id == judge_id)
    
    if registry_id:
        query = query.filter(CauseList.registry_id == registry_id)
    
    if court_id:
        query = query.filter(CauseList.court_id == court_id)
    
    cause_lists = query.order_by(CauseList.hearing_date, CauseList.hearing_time).all()
    
    # Format for calendar
    events = []
    for cl in cause_lists:
        events.append({
            "id": cl.id,
            "title": cl.case_title or cl.suit_no or "Untitled Case",
            "date": cl.hearing_date.isoformat(),
            "time": cl.hearing_time.strftime("%H:%M") if cl.hearing_time else None,
            "suit_no": cl.suit_no,
            "judge_name": cl.judge_name,
            "first_party": cl.first_party_name,
            "second_party": cl.second_party_name,
            "status": cl.status
        })
    
    return events

