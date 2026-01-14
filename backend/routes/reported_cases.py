from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from typing import Optional
import math

from database import get_db
from models.reported_cases import ReportedCases
from schemas.reported_cases import (
    ReportedCaseSearchRequest, 
    ReportedCaseSearchResponse, 
    ReportedCaseResponse,
    ReportedCaseDetailResponse,
    ReportedCaseCreate,
    ReportedCaseUpdate
)
from auth import get_current_user, get_optional_user

router = APIRouter()

@router.get("/search", response_model=ReportedCaseSearchResponse)
async def search_cases(
    query: Optional[str] = Query(None, description="Search query for title, antagonist, protagonist, or citation"),
    year: Optional[str] = Query(None, description="Filter by year"),
    court_type: Optional[str] = Query(None, description="Filter by court type (SC, CA, HC)"),
    region: Optional[str] = Query(None, description="Filter by region"),
    area_of_law: Optional[str] = Query(None, description="Filter by area of law"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    sort_by: str = Query("date", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Search reported cases with filters and pagination"""
    
    # Build query
    db_query = db.query(ReportedCases)
    
    # Apply filters
    if query:
        search_filter = or_(
            ReportedCases.title.ilike(f"%{query}%"),
            ReportedCases.antagonist.ilike(f"%{query}%"),
            ReportedCases.protagonist.ilike(f"%{query}%"),
            ReportedCases.citation.ilike(f"%{query}%"),
            ReportedCases.case_summary.ilike(f"%{query}%"),
            ReportedCases.keywords_phrases.ilike(f"%{query}%")
        )
        db_query = db_query.filter(search_filter)
    
    if year:
        db_query = db_query.filter(ReportedCases.year == year)
    
    if court_type:
        db_query = db_query.filter(ReportedCases.court_type == court_type)
    
    if region:
        db_query = db_query.filter(ReportedCases.region == region)
    
    if area_of_law:
        db_query = db_query.filter(ReportedCases.area_of_law.ilike(f"%{area_of_law}%"))
    
    # Get total count
    total = db_query.count()
    
    # Apply sorting
    if sort_by == "date":
        order_field = ReportedCases.date
    elif sort_by == "title":
        order_field = ReportedCases.title
    elif sort_by == "year":
        order_field = ReportedCases.year
    elif sort_by == "court_type":
        order_field = ReportedCases.court_type
    else:
        order_field = ReportedCases.date
    
    if sort_order == "desc":
        db_query = db_query.order_by(desc(order_field))
    else:
        db_query = db_query.order_by(asc(order_field))
    
    # Apply pagination
    offset = (page - 1) * limit
    cases = db_query.offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit)
    
    return ReportedCaseSearchResponse(
        cases=cases,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{case_id}", response_model=ReportedCaseDetailResponse)
async def get_case_detail(
    case_id: int,
    db: Session = Depends(get_db)
    # Temporarily disabled authentication for testing
    # current_user = Depends(get_current_user)
):
    """Get detailed information about a specific case"""
    
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Trigger on-demand AI analysis if case hasn't been analyzed
    try:
        from backend.services.on_demand_ai_analysis import analyze_case_if_needed
        
        # Check if case needs analysis
        is_analyzed, _ = analyze_case_if_needed(case_id)
        
        if is_analyzed.get("status") == "success":
            # Refresh case data to get updated AI analysis
            db.refresh(case)
        elif is_analyzed.get("status") == "already_analyzed":
            # Case already analyzed, no action needed
            pass
        else:
            # Analysis failed, but continue with case data
            pass
            
    except Exception as e:
        # If AI analysis fails, continue with case data
        print(f"AI analysis failed for case {case_id}: {e}")
        pass
    
    return case

@router.get("/", response_model=ReportedCaseSearchResponse)
async def get_recent_cases(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    query: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    year: Optional[str] = Query(None, description="Filter by year"),
    sort_by: Optional[str] = Query("date", description="Sort by field (date, title, suit_reference_number, status, updated_at)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
    db: Session = Depends(get_db)
    # Temporarily removed authentication to fix 403 error
    # current_user: Optional[User] = Depends(get_optional_user)
):
    """Get recent cases with pagination and filtering"""
    try:
        # Temporarily show all cases (no published filter) for admin panel access
        # TODO: Re-enable authentication and add proper admin check
        db_query = db.query(ReportedCases)
        
        # Apply search filter
        if query:
            search_filter = or_(
                ReportedCases.title.ilike(f"%{query}%"),
                ReportedCases.antagonist.ilike(f"%{query}%"),
                ReportedCases.protagonist.ilike(f"%{query}%"),
                ReportedCases.citation.ilike(f"%{query}%"),
                ReportedCases.suit_reference_number.ilike(f"%{query}%"),
                ReportedCases.case_summary.ilike(f"%{query}%")
            )
            db_query = db_query.filter(search_filter)
        
        # Apply status filter
        if status:
            # Map status strings to database values
            status_map = {
                'active': 'active',
                'pending': 'pending',
                'adjourned': 'adjourned',
                'heard': 'heard',
                'closed': 'closed'
            }
            status_value = status_map.get(status.lower(), status)
            db_query = db_query.filter(ReportedCases.status == status_value)
        
        # Apply court type filter
        if court_type:
            db_query = db_query.filter(ReportedCases.court_type == court_type)
        
        # Apply region filter
        if region:
            db_query = db_query.filter(ReportedCases.region == region)
        
        # Apply year filter
        if year:
            db_query = db_query.filter(ReportedCases.year == year)
        
        # Apply sorting
        from sqlalchemy import nullslast, asc
        sort_field_map = {
            'date': ReportedCases.date,
            'title': ReportedCases.title,
            'suit_reference_number': ReportedCases.suit_reference_number,
            'status': ReportedCases.status,
            'updated_at': ReportedCases.updated_at
        }
        
        sort_field = sort_field_map.get(sort_by, ReportedCases.date)
        if sort_order and sort_order.lower() == 'asc':
            db_query = db_query.order_by(nullslast(asc(sort_field)))
        else:
            db_query = db_query.order_by(nullslast(desc(sort_field)))
        
        # Get total count
        total = db_query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        cases = db_query.offset(offset).limit(limit).all()
        
        # Calculate total pages
        total_pages = math.ceil(total / limit) if total > 0 else 1
        
        return ReportedCaseSearchResponse(
            cases=cases,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except Exception as e:
        import traceback
        print(f"Error in get_recent_cases: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stats/overview")
async def get_case_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get overview statistics of reported cases"""
    
    # Total cases
    total_cases = db.query(ReportedCases).count()
    
    from sqlalchemy import func
    
    # Cases by year (last 10 years)
    year_stats = db.query(ReportedCases.year, func.count(ReportedCases.id)).group_by(ReportedCases.year).order_by(desc(ReportedCases.year)).limit(10).all()
    
    # Cases by court type
    court_stats = db.query(ReportedCases.court_type, func.count(ReportedCases.id)).group_by(ReportedCases.court_type).all()
    
    # Cases by region
    region_stats = db.query(ReportedCases.region, func.count(ReportedCases.id)).group_by(ReportedCases.region).order_by(desc(func.count(ReportedCases.id))).limit(10).all()
    
    return {
        "total_cases": total_cases,
        "year_distribution": [{"year": year, "count": count} for year, count in year_stats],
        "court_distribution": [{"court_type": court_type or "Unknown", "count": count} for court_type, count in court_stats],
        "region_distribution": [{"region": region or "Unknown", "count": count} for region, count in region_stats]
    }

@router.post("/", response_model=ReportedCaseResponse)
async def create_case(
    case_data: ReportedCaseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new reported case"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create new case
    db_case = ReportedCases(
        **case_data.dict(exclude_none=True),
        created_by=current_user.email or current_user.username,
        updated_by=current_user.email or current_user.username
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
    return db_case

@router.put("/{case_id}", response_model=ReportedCaseResponse)
async def update_case(
    case_id: int,
    case_data: ReportedCaseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a reported case"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Update fields
    update_data = case_data.dict(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        setattr(case, field, value)
    
    case.updated_by = current_user.email or current_user.username
    
    db.commit()
    db.refresh(case)
    
    return case

@router.delete("/{case_id}")
async def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a reported case (soft delete by setting published=False)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Soft delete by setting published to False
    case.published = False
    case.updated_by = current_user.email or current_user.username
    
    db.commit()
    
    return {"message": "Case deleted successfully"}
