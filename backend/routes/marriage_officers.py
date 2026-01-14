from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional
from datetime import datetime, date
import math
import logging

from database import get_db
from models.marriage_officer import MarriageOfficer
from schemas.marriage_officers import (
    MarriageOfficerCreate,
    MarriageOfficerUpdate,
    MarriageOfficerResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marriage-officers", tags=["marriage-officers"])

# List Marriage Officers with Search and Filtering
@router.get("/")
def search_marriage_officers(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by officer_name column only"),
    gazette_number: Optional[str] = Query(None),
    gazette_date_from: Optional[date] = Query(None),
    gazette_date_to: Optional[date] = Query(None),
    appointment_date_from: Optional[date] = Query(None),
    appointment_date_to: Optional[date] = Query(None),
    location: Optional[str] = Query(None, description="Search by location"),
    church: Optional[str] = Query(None, description="Search by church"),
    sort_by: str = Query("gazette_date", regex="^(gazette_date|appointment_date|officer_name|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Search marriage officers entries - searches ONLY officer_name column"""
    try:
        query = db.query(MarriageOfficer)
        
        # Apply search filter - ONLY search officer_name column
        if search:
            search_cleaned = search.strip()
            if search_cleaned:
                search_term = f"%{search_cleaned}%"
                
                print(f"[DEBUG] Searching marriage_officers.officer_name with term: '{search_cleaned}' (pattern: '{search_term}')")
                logger.info(f"Searching marriage_officers.officer_name with term: '{search_cleaned}'")
                
                query = query.filter(MarriageOfficer.officer_name.ilike(search_term))
        
        # Apply location filter
        if location:
            location_cleaned = location.strip()
            if location_cleaned:
                location_term = f"%{location_cleaned}%"
                query = query.filter(MarriageOfficer.location.ilike(location_term))
        
        # Apply church filter
        if church:
            church_cleaned = church.strip()
            if church_cleaned:
                church_term = f"%{church_cleaned}%"
                query = query.filter(MarriageOfficer.church.ilike(church_term))
        
        # Apply gazette number filter
        if gazette_number:
            query = query.filter(MarriageOfficer.gazette_number.ilike(f"%{gazette_number}%"))
        
        # Apply gazette date filters
        if gazette_date_from:
            query = query.filter(MarriageOfficer.gazette_date >= gazette_date_from)
        if gazette_date_to:
            query = query.filter(MarriageOfficer.gazette_date <= gazette_date_to)
        
        # Apply appointment date filters
        if appointment_date_from:
            query = query.filter(MarriageOfficer.appointment_date >= appointment_date_from)
        if appointment_date_to:
            query = query.filter(MarriageOfficer.appointment_date <= appointment_date_to)
        
        # Apply sorting
        sort_column = getattr(MarriageOfficer, sort_by, MarriageOfficer.gazette_date)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Get total count
        try:
            total = query.count()
            print(f"[DEBUG] Total results after all filters: {total}, page: {page}, limit: {limit}")
            logger.info(f"Total results after all filters: {total}, page: {page}, limit: {limit}")
        except Exception as e:
            print(f"[DEBUG ERROR] Error getting total count: {e}")
            logger.error(f"Error getting total count: {e}")
            total = 0
        
        # Apply pagination
        try:
            offset = (page - 1) * limit
            entries = query.offset(offset).limit(limit).all()
            print(f"[DEBUG] Returning {len(entries)} entries for page {page}")
            logger.info(f"Returning {len(entries)} entries for page {page}")
        except Exception as e:
            print(f"[DEBUG ERROR] Error fetching entries: {e}")
            logger.error(f"Error fetching entries: {e}")
            entries = []
        
        # Format results
        results = []
        for entry in entries:
            results.append({
                "id": entry.id,
                "officer_name": entry.officer_name,
                "church": entry.church,
                "location": entry.location,
                "appointing_authority": entry.appointing_authority,
                "appointment_date": entry.appointment_date.isoformat() if entry.appointment_date else None,
                "gazette_number": entry.gazette_number,
                "gazette_date": entry.gazette_date.isoformat() if entry.gazette_date else None,
                "page_number": entry.page_number,
                "source_details": entry.source_details,
                "document_filename": entry.document_filename,
                "person_id": entry.person_id,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,
            })
        
        print(f"[DEBUG] Formatted {len(results)} results for response")
        logger.info(f"Formatted {len(results)} results for response")
        
        return {
            "results": results,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if limit > 0 else 0
        }
    except Exception as e:
        print(f"[DEBUG ERROR] Error in search_marriage_officers: {e}")
        logger.error(f"Error in search_marriage_officers: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching marriage officers: {str(e)}")

# Get Marriage Officer Entry by ID
@router.get("/{officer_id}", response_model=MarriageOfficerResponse)
def get_marriage_officer(officer_id: int, db: Session = Depends(get_db)):
    """Get a specific marriage officer entry by ID"""
    officer = db.query(MarriageOfficer).filter(MarriageOfficer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Marriage officer entry not found")
    return officer

# Create Marriage Officer Entry
@router.post("/", response_model=MarriageOfficerResponse, status_code=status.HTTP_201_CREATED)
def create_marriage_officer(
    officer: MarriageOfficerCreate,
    db: Session = Depends(get_db)
):
    """Create a new marriage officer entry"""
    try:
        db_officer = MarriageOfficer(**officer.dict())
        db.add(db_officer)
        db.commit()
        db.refresh(db_officer)
        return db_officer
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating marriage officer entry: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating entry: {str(e)}")

# Update Marriage Officer Entry
@router.put("/{officer_id}", response_model=MarriageOfficerResponse)
def update_marriage_officer(
    officer_id: int,
    officer_update: MarriageOfficerUpdate,
    db: Session = Depends(get_db)
):
    """Update a marriage officer entry"""
    try:
        db_officer = db.query(MarriageOfficer).filter(MarriageOfficer.id == officer_id).first()
        if not db_officer:
            raise HTTPException(status_code=404, detail="Marriage officer entry not found")
        
        update_data = officer_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_officer, field, value)
        
        db_officer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_officer)
        return db_officer
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating marriage officer entry: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating entry: {str(e)}")

# Delete Marriage Officer Entry
@router.delete("/{officer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_marriage_officer(officer_id: int, db: Session = Depends(get_db)):
    """Delete a marriage officer entry"""
    try:
        db_officer = db.query(MarriageOfficer).filter(MarriageOfficer.id == officer_id).first()
        if not db_officer:
            raise HTTPException(status_code=404, detail="Marriage officer entry not found")
        
        db.delete(db_officer)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting marriage officer entry: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting entry: {str(e)}")
