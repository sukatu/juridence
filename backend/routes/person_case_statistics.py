"""
API routes for person case statistics.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.person_case_statistics import PersonCaseStatistics
from models.people import People
from schemas.person_case_statistics import (
    PersonCaseStatisticsResponse,
    PersonCaseStatisticsCreate,
    PersonCaseStatisticsUpdate,
    PersonCaseStatisticsSummary
)
from sqlalchemy import and_, or_

router = APIRouter(prefix="/api/person-case-statistics", tags=["person-case-statistics"])

@router.get("/", response_model=List[PersonCaseStatisticsResponse])
async def get_all_person_case_statistics(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get all person case statistics with pagination."""
    try:
        stats = db.query(PersonCaseStatistics).offset(skip).limit(limit).all()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching person case statistics: {str(e)}")

@router.get("/person/{person_id}", response_model=PersonCaseStatisticsResponse)
async def get_person_case_statistics(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Get case statistics for a specific person."""
    try:
        stats = db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first()
        if not stats:
            raise HTTPException(status_code=404, detail="Person case statistics not found")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching person case statistics: {str(e)}")

@router.get("/summary/{person_id}", response_model=PersonCaseStatisticsSummary)
async def get_person_case_statistics_summary(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Get case statistics summary for a specific person."""
    try:
        stats = db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first()
        if not stats:
            raise HTTPException(status_code=404, detail="Person case statistics not found")
        
        return PersonCaseStatisticsSummary.from_statistics(stats)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching person case statistics summary: {str(e)}")

@router.post("/", response_model=PersonCaseStatisticsResponse)
async def create_person_case_statistics(
    stats_data: PersonCaseStatisticsCreate,
    db: Session = Depends(get_db)
):
    """Create new person case statistics."""
    try:
        # Check if person exists
        person = db.query(People).filter(People.id == stats_data.person_id).first()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        
        # Check if statistics already exist
        existing_stats = db.query(PersonCaseStatistics).filter(
            PersonCaseStatistics.person_id == stats_data.person_id
        ).first()
        if existing_stats:
            raise HTTPException(status_code=400, detail="Person case statistics already exist")
        
        # Create new statistics
        stats = PersonCaseStatistics(**stats_data.dict())
        db.add(stats)
        db.commit()
        db.refresh(stats)
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating person case statistics: {str(e)}")

@router.put("/person/{person_id}", response_model=PersonCaseStatisticsResponse)
async def update_person_case_statistics(
    person_id: int,
    stats_data: PersonCaseStatisticsUpdate,
    db: Session = Depends(get_db)
):
    """Update person case statistics."""
    try:
        stats = db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first()
        if not stats:
            raise HTTPException(status_code=404, detail="Person case statistics not found")
        
        # Update only provided fields
        update_data = stats_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(stats, field, value)
        
        db.commit()
        db.refresh(stats)
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating person case statistics: {str(e)}")

@router.delete("/person/{person_id}")
async def delete_person_case_statistics(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Delete person case statistics."""
    try:
        stats = db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first()
        if not stats:
            raise HTTPException(status_code=404, detail="Person case statistics not found")
        
        db.delete(stats)
        db.commit()
        
        return {"message": "Person case statistics deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting person case statistics: {str(e)}")

@router.get("/top-cases", response_model=List[PersonCaseStatisticsSummary])
async def get_top_cases_people(
    limit: int = Query(10, ge=1, le=100, description="Number of top people to return"),
    db: Session = Depends(get_db)
):
    """Get people with the most cases."""
    try:
        stats = db.query(PersonCaseStatistics).order_by(
            PersonCaseStatistics.total_cases.desc()
        ).limit(limit).all()
        
        return [PersonCaseStatisticsSummary.from_statistics(stat) for stat in stats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top cases people: {str(e)}")

@router.get("/high-risk", response_model=List[PersonCaseStatisticsSummary])
async def get_high_risk_people(
    unresolved_threshold: int = Query(5, ge=0, description="Minimum unresolved cases to be considered high risk"),
    limit: int = Query(20, ge=1, le=100, description="Number of people to return"),
    db: Session = Depends(get_db)
):
    """Get people with high unresolved cases (potential high risk)."""
    try:
        stats = db.query(PersonCaseStatistics).filter(
            PersonCaseStatistics.unresolved_cases >= unresolved_threshold
        ).order_by(
            PersonCaseStatistics.unresolved_cases.desc()
        ).limit(limit).all()
        
        return [PersonCaseStatisticsSummary.from_statistics(stat) for stat in stats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching high risk people: {str(e)}")
