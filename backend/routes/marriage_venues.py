from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional
from datetime import datetime, date
import math
import logging

from database import get_db
from models.marriage_venue import MarriageVenue

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marriage-venues", tags=["marriage-venues"])

@router.get("/search")
def search_marriage_venues(
    query: Optional[str] = Query(None, description="General search query"),
    name: Optional[str] = Query(None, description="Venue name filter"),
    denomination: Optional[str] = Query(None, description="Denomination filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    gazette_number: Optional[str] = Query(None, description="Gazette number filter"),
    sort_by: str = Query("name_of_licensed_place", description="Sort by field"),
    sort_order: str = Query("asc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Search marriage venues with various filters"""
    
    # Build query
    db_query = db.query(MarriageVenue)
    
    # Apply filters
    if query:
        search_term = f"%{query.lower()}%"
        db_query = db_query.filter(
            or_(
                func.lower(MarriageVenue.name_of_licensed_place).like(search_term),
                func.lower(MarriageVenue.denomination).like(search_term),
                func.lower(MarriageVenue.branch_location_address_region).like(search_term),
                func.lower(MarriageVenue.name_of_license_officer).like(search_term),
                func.lower(MarriageVenue.gazette_number).like(search_term)
            )
        )
    
    if name:
        db_query = db_query.filter(func.lower(MarriageVenue.name_of_licensed_place).like(f"%{name.lower()}%"))
    
    if denomination:
        db_query = db_query.filter(func.lower(MarriageVenue.denomination).like(f"%{denomination.lower()}%"))
    
    if region:
        db_query = db_query.filter(func.lower(MarriageVenue.branch_location_address_region).like(f"%{region.lower()}%"))
    
    if gazette_number:
        db_query = db_query.filter(MarriageVenue.gazette_number == gazette_number)
    
    # Get total count
    total = db_query.count()
    
    # Apply sorting
    if sort_order.lower() == "desc":
        if sort_by == "name_of_licensed_place":
            db_query = db_query.order_by(desc(MarriageVenue.name_of_licensed_place))
        elif sort_by == "denomination":
            db_query = db_query.order_by(desc(MarriageVenue.denomination))
        elif sort_by == "date_of_license":
            db_query = db_query.order_by(desc(MarriageVenue.date_of_license))
        elif sort_by == "date_of_gazette":
            db_query = db_query.order_by(desc(MarriageVenue.date_of_gazette))
        else:
            db_query = db_query.order_by(desc(MarriageVenue.name_of_licensed_place))
    else:
        if sort_by == "name_of_licensed_place":
            db_query = db_query.order_by(asc(MarriageVenue.name_of_licensed_place))
        elif sort_by == "denomination":
            db_query = db_query.order_by(asc(MarriageVenue.denomination))
        elif sort_by == "date_of_license":
            db_query = db_query.order_by(asc(MarriageVenue.date_of_license))
        elif sort_by == "date_of_gazette":
            db_query = db_query.order_by(asc(MarriageVenue.date_of_gazette))
        else:
            db_query = db_query.order_by(asc(MarriageVenue.name_of_licensed_place))
    
    # Apply pagination
    offset = (page - 1) * limit
    venues = db_query.offset(offset).limit(limit).all()
    
    # Calculate pagination info
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    has_next = page < total_pages
    has_prev = page > 1
    
    return {
        "venues": venues,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev
    }

@router.get("/{venue_id}")
def get_marriage_venue(
    venue_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific marriage venue by ID"""
    venue = db.query(MarriageVenue).filter(MarriageVenue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Marriage venue not found")
    return venue
