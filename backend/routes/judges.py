from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import math

from database import get_db
from models.judges import Judges, JudgeStatus
from schemas.judges import JudgeCreate, JudgeUpdate, JudgeResponse, JudgeListResponse
from auth import get_current_user
from models.user import User

router = APIRouter()


@router.get("/judges", response_model=JudgeListResponse)
async def get_judges_public(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name, title, or court type"),
    status: Optional[JudgeStatus] = Query(None, description="Filter by status"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    db: Session = Depends(get_db)
):
    """Public judge list with filtering and pagination"""
    # Build query
    query = db.query(Judges)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Judges.name.ilike(search_term),
                Judges.title.ilike(search_term),
                Judges.court_type.ilike(search_term),
                Judges.court_division.ilike(search_term)
            )
        )

    if status:
        query = query.filter(Judges.status == status)

    if court_type:
        query = query.filter(Judges.court_type.ilike(f"%{court_type}%"))

    if region:
        query = query.filter(Judges.region.ilike(f"%{region}%"))

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * limit
    judges = query.offset(offset).limit(limit).all()

    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return JudgeListResponse(
        judges=judges,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/admin/judges", response_model=JudgeListResponse)
async def get_judges(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name, title, or court type"),
    status: Optional[JudgeStatus] = Query(None, description="Filter by status"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of judges with filtering and pagination"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query
    query = db.query(Judges)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Judges.name.ilike(search_term),
                Judges.title.ilike(search_term),
                Judges.court_type.ilike(search_term),
                Judges.court_division.ilike(search_term)
            )
        )
    
    if status:
        query = query.filter(Judges.status == status)
    
    if court_type:
        query = query.filter(Judges.court_type.ilike(f"%{court_type}%"))
    
    if region:
        query = query.filter(Judges.region.ilike(f"%{region}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    judges = query.offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return JudgeListResponse(
        judges=judges,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/admin/judges/{judge_id}", response_model=JudgeResponse)
async def get_judge(
    judge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific judge by ID"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    judge = db.query(Judges).filter(Judges.id == judge_id).first()
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    
    return judge

@router.post("/admin/judges", response_model=JudgeResponse)
async def create_judge(
    judge_data: JudgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new judge"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if judge with same name already exists
    existing_judge = db.query(Judges).filter(
        and_(
            Judges.name == judge_data.name,
            Judges.court_type == judge_data.court_type,
            Judges.is_active == True
        )
    ).first()
    
    if existing_judge:
        raise HTTPException(status_code=400, detail="Judge with this name and court type already exists")
    
    # Create new judge
    db_judge = Judges(
        **judge_data.dict(),
        created_by=current_user.username,
        updated_by=current_user.username
    )
    
    db.add(db_judge)
    db.commit()
    db.refresh(db_judge)
    
    return db_judge

@router.put("/admin/judges/{judge_id}", response_model=JudgeResponse)
async def update_judge(
    judge_id: int,
    judge_data: JudgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a judge"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    judge = db.query(Judges).filter(Judges.id == judge_id).first()
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    
    # Update fields
    update_data = judge_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(judge, field, value)
    
    judge.updated_by = current_user.username
    
    db.commit()
    db.refresh(judge)
    
    return judge

@router.delete("/admin/judges/{judge_id}")
async def delete_judge(
    judge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a judge (soft delete)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    judge = db.query(Judges).filter(Judges.id == judge_id).first()
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    
    # Soft delete
    judge.is_active = False
    judge.updated_by = current_user.username
    
    db.commit()
    
    return {"message": "Judge deleted successfully"}

@router.get("/admin/judges/search/active", response_model=List[JudgeResponse])
async def search_active_judges(
    query: str = Query("", description="Search query"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search active judges for dropdowns"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    judges_query = db.query(Judges).filter(
        and_(
            Judges.is_active == True,
            Judges.status == JudgeStatus.active
        )
    )
    
    if query:
        search_term = f"%{query}%"
        judges_query = judges_query.filter(
            or_(
                Judges.name.ilike(search_term),
                Judges.title.ilike(search_term)
            )
        )
    
    judges = judges_query.limit(limit).all()
    
    return judges

@router.get("/judges", response_model=JudgeListResponse)
async def get_public_judges(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(100, ge=1, le=1000, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    """Get list of judges alphabetically for public access"""
    query = db.query(Judges).filter(Judges.is_active == True).order_by(Judges.name.asc())
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Judges.name.ilike(search_term),
                Judges.title.ilike(search_term),
                Judges.court_type.ilike(search_term),
                Judges.court_division.ilike(search_term),
                Judges.region.ilike(search_term)
            )
        )
    
    total = query.count()
    offset = (page - 1) * limit
    judges = query.offset(offset).limit(limit).all()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return JudgeListResponse(
        judges=judges,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/judges/{judge_id}", response_model=JudgeResponse)
async def get_public_judge(
    judge_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific judge by ID with full details"""
    judge = db.query(Judges).filter(
        and_(
            Judges.id == judge_id,
            Judges.is_active == True
        )
    ).first()
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    
    return judge
