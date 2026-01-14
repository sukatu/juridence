from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from services.auto_analytics_generator import AutoAnalyticsGenerator
from models.people import People
from models.gazette import Gazette
import logging

router = APIRouter(prefix="/analytics-generator", tags=["analytics-generator"])

@router.post("/generate/{person_id}")
async def generate_person_analytics(
    person_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate analytics for a specific person"""
    try:
        # Check if person exists
        person = db.query(People).filter(People.id == person_id).first()
        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Person not found"
            )
        
        # Generate analytics
        generator = AutoAnalyticsGenerator(db)
        analytics_data = generator.generate_analytics_for_person(person_id)
        
        return {
            "message": f"Analytics generated successfully for person {person_id}",
            "person_id": person_id,
            "analytics": analytics_data
        }
        
    except Exception as e:
        logging.error(f"Error generating analytics for person {person_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics: {str(e)}"
        )

@router.post("/generate-gazette/{gazette_id}")
async def generate_gazette_person_analytics(
    gazette_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate analytics for a person created from gazette entry"""
    try:
        # Check if gazette exists and is linked to a person
        gazette = db.query(Gazette).filter(Gazette.id == gazette_id).first()
        if not gazette:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gazette entry not found"
            )
        
        if not gazette.person_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gazette entry is not linked to a person"
            )
        
        # Generate analytics
        generator = AutoAnalyticsGenerator(db)
        analytics_data = generator.generate_analytics_for_gazette_person(gazette_id)
        
        return {
            "message": f"Analytics generated successfully for gazette person {gazette_id}",
            "gazette_id": gazette_id,
            "person_id": gazette.person_id,
            "analytics": analytics_data
        }
        
    except Exception as e:
        logging.error(f"Error generating analytics for gazette person {gazette_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics: {str(e)}"
        )

@router.post("/regenerate-all")
async def regenerate_all_analytics(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Regenerate analytics for all people in the database"""
    try:
        generator = AutoAnalyticsGenerator(db)
        
        # Run in background to avoid timeout
        background_tasks.add_task(generator.regenerate_all_analytics)
        
        return {
            "message": "Analytics regeneration started for all people",
            "status": "processing"
        }
        
    except Exception as e:
        logging.error(f"Error starting analytics regeneration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start analytics regeneration: {str(e)}"
        )

@router.post("/regenerate-missing")
async def regenerate_missing_analytics(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Regenerate analytics only for people who don't have analytics yet"""
    try:
        from models.person_analytics import PersonAnalytics
        
        # Find people without analytics
        people_with_analytics = db.query(PersonAnalytics.person_id).subquery()
        people_without_analytics = db.query(People).filter(
            ~People.id.in_(people_with_analytics)
        ).all()
        
        generator = AutoAnalyticsGenerator(db)
        results = {
            'total_people_without_analytics': len(people_without_analytics),
            'successful': 0,
            'failed': 0,
            'errors': []
        }
        
        for person in people_without_analytics:
            try:
                generator.generate_analytics_for_person(person.id)
                results['successful'] += 1
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Person {person.id}: {str(e)}")
        
        return {
            "message": f"Generated analytics for {results['successful']} people",
            "results": results
        }
        
    except Exception as e:
        logging.error(f"Error regenerating missing analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate missing analytics: {str(e)}"
        )

@router.get("/status/{person_id}")
async def get_analytics_status(
    person_id: int,
    db: Session = Depends(get_db)
):
    """Check if a person has analytics generated"""
    try:
        from models.person_analytics import PersonAnalytics
        from models.person_case_statistics import PersonCaseStatistics
        
        # Check if person exists
        person = db.query(People).filter(People.id == person_id).first()
        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Person not found"
            )
        
        # Check analytics status
        has_analytics = db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first() is not None
        has_case_stats = db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first() is not None
        
        return {
            "person_id": person_id,
            "has_analytics": has_analytics,
            "has_case_statistics": has_case_stats,
            "total_cases": person.total_cases or 0,
            "last_updated": person.updated_at
        }
        
    except Exception as e:
        logging.error(f"Error checking analytics status for person {person_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check analytics status: {str(e)}"
        )

@router.get("/stats")
async def get_analytics_stats(db: Session = Depends(get_db)):
    """Get overall analytics generation statistics"""
    try:
        from models.person_analytics import PersonAnalytics
        from models.person_case_statistics import PersonCaseStatistics
        
        total_people = db.query(People).count()
        people_with_analytics = db.query(PersonAnalytics).count()
        people_with_case_stats = db.query(PersonCaseStatistics).count()
        
        return {
            "total_people": total_people,
            "people_with_analytics": people_with_analytics,
            "people_with_case_statistics": people_with_case_stats,
            "analytics_coverage": round((people_with_analytics / total_people * 100), 2) if total_people > 0 else 0,
            "case_stats_coverage": round((people_with_case_stats / total_people * 100), 2) if total_people > 0 else 0
        }
        
    except Exception as e:
        logging.error(f"Error getting analytics stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics stats: {str(e)}"
        )
