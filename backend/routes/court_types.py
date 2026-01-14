from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import math

from database import get_db
from models.court_types import CourtTypes, CourtLevel
from schemas.court_types import CourtTypeCreate, CourtTypeUpdate, CourtTypeResponse, CourtTypeListResponse
from auth import get_current_user
from models.user import User

router = APIRouter()

@router.get("/admin/court-types", response_model=CourtTypeListResponse)
async def get_court_types(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name or code"),
    level: Optional[CourtLevel] = Query(None, description="Filter by court level"),
    region: Optional[str] = Query(None, description="Filter by region"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of court types with filtering and pagination"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query - only show active court types
    query = db.query(CourtTypes).filter(CourtTypes.is_active == True)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CourtTypes.name.ilike(search_term),
                CourtTypes.code.ilike(search_term),
                CourtTypes.description.ilike(search_term)
            )
        )
    
    if level:
        query = query.filter(CourtTypes.level == level)
    
    if region:
        query = query.filter(CourtTypes.region.ilike(f"%{region}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    court_types = query.offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return CourtTypeListResponse(
        court_types=court_types,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/admin/court-types/{court_type_id}", response_model=CourtTypeResponse)
async def get_court_type(
    court_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific court type by ID"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    court_type = db.query(CourtTypes).filter(CourtTypes.id == court_type_id).first()
    if not court_type:
        raise HTTPException(status_code=404, detail="Court type not found")
    
    return court_type

@router.post("/admin/court-types", response_model=CourtTypeResponse)
async def create_court_type(
    court_type_data: CourtTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new court type"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if court type with same name or code already exists
    existing_court_type = db.query(CourtTypes).filter(
        or_(
            CourtTypes.name == court_type_data.name,
            CourtTypes.code == court_type_data.code
        )
    ).first()
    
    if existing_court_type:
        raise HTTPException(status_code=400, detail="Court type with this name or code already exists")
    
    # Create new court type
    db_court_type = CourtTypes(
        **court_type_data.dict(),
        created_by=current_user.username,
        updated_by=current_user.username
    )
    
    db.add(db_court_type)
    db.commit()
    db.refresh(db_court_type)
    
    return db_court_type

@router.put("/admin/court-types/{court_type_id}", response_model=CourtTypeResponse)
async def update_court_type(
    court_type_id: int,
    court_type_data: CourtTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a court type"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    court_type = db.query(CourtTypes).filter(CourtTypes.id == court_type_id).first()
    if not court_type:
        raise HTTPException(status_code=404, detail="Court type not found")
    
    # Check for duplicate name or code if being updated
    if court_type_data.name or court_type_data.code:
        name = court_type_data.name or court_type.name
        code = court_type_data.code or court_type.code
        
        existing_court_type = db.query(CourtTypes).filter(
            and_(
                CourtTypes.id != court_type_id,
                or_(
                    CourtTypes.name == name,
                    CourtTypes.code == code
                )
            )
        ).first()
        
        if existing_court_type:
            raise HTTPException(status_code=400, detail="Court type with this name or code already exists")
    
    # Update fields
    update_data = court_type_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(court_type, field, value)
    
    court_type.updated_by = current_user.username
    
    db.commit()
    db.refresh(court_type)
    
    return court_type

@router.delete("/admin/court-types/{court_type_id}")
async def delete_court_type(
    court_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a court type (soft delete)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    court_type = db.query(CourtTypes).filter(CourtTypes.id == court_type_id).first()
    if not court_type:
        raise HTTPException(status_code=404, detail="Court type not found")
    
    # Soft delete
    court_type.is_active = False
    court_type.updated_by = current_user.username
    
    db.commit()
    
    return {"message": "Court type deleted successfully"}

@router.get("/admin/court-types/search/active", response_model=List[CourtTypeResponse])
async def search_active_court_types(
    query: str = Query("", description="Search query"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search active court types for dropdowns"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    court_types_query = db.query(CourtTypes).filter(
        CourtTypes.is_active == True
    )
    
    if query:
        search_term = f"%{query}%"
        court_types_query = court_types_query.filter(
            or_(
                CourtTypes.name.ilike(search_term),
                CourtTypes.code.ilike(search_term)
            )
        )
    
    court_types = court_types_query.limit(limit).all()
    
    return court_types
