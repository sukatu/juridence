from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.people import People
from models.person_analytics import PersonAnalytics
from models.person_case_statistics import PersonCaseStatistics
from schemas.admin import AdminStatsResponse
from typing import List, Optional
import math

router = APIRouter()

@router.get("/stats")
async def get_people_stats(db: Session = Depends(get_db)):
    """Get comprehensive people statistics for admin dashboard"""
    try:
        # Basic counts
        total_people = db.query(People).count()
        
        # Risk analysis
        high_risk_count = db.query(People).filter(People.risk_level.in_(['high', 'very high'])).count()
        verified_count = db.query(People).filter(People.is_verified == True).count()
        
        # Average risk score
        avg_risk_score = db.query(People.risk_score).filter(People.risk_score.isnot(None)).all()
        avg_risk_score = sum([score[0] for score in avg_risk_score]) / len(avg_risk_score) if avg_risk_score else 0
        
        # Recent activity (last 24 hours)
        from datetime import datetime, timedelta
        recent_people = db.query(People).filter(
            People.created_at >= datetime.now() - timedelta(days=1)
        ).count()
        
        return {
            "total_people": total_people,
            "high_risk_count": high_risk_count,
            "verified_count": verified_count,
            "avg_risk_score": avg_risk_score,
            "recent_people": recent_people,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching people stats: {str(e)}")

@router.get("/")
async def get_people(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of people with optional filtering"""
    try:
        query = db.query(People)
        
        # Apply search filter
        if search:
            query = query.filter(
                People.full_name.ilike(f"%{search}%") |
                People.first_name.ilike(f"%{search}%") |
                People.last_name.ilike(f"%{search}%") |
                People.email.ilike(f"%{search}%")
            )
        
        # Apply risk level filter
        if risk_level:
            query = query.filter(People.risk_level == risk_level)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        people = query.offset(offset).limit(limit).all()
        
        # Convert JSON arrays to strings for API response
        formatted_people = []
        for person in people:
            person_dict = person.__dict__.copy()
            
            # Convert JSON arrays to comma-separated strings
            if person_dict.get('previous_names') and isinstance(person_dict['previous_names'], list):
                person_dict['previous_names'] = ', '.join(person_dict['previous_names']) if person_dict['previous_names'] else ''
            elif person_dict.get('previous_names') is None or person_dict.get('previous_names') == []:
                person_dict['previous_names'] = ''
                
            if person_dict.get('case_types') and isinstance(person_dict['case_types'], list):
                person_dict['case_types'] = ', '.join(person_dict['case_types'])
            elif person_dict.get('case_types') is None:
                person_dict['case_types'] = ''
                
            if person_dict.get('languages') and isinstance(person_dict['languages'], list):
                # Handle both string and dict formats for languages
                language_strings = []
                for lang in person_dict['languages']:
                    if isinstance(lang, dict):
                        # Extract language name from dict format
                        language_strings.append(lang.get('language', str(lang)))
                    else:
                        # Already a string
                        language_strings.append(str(lang))
                person_dict['languages'] = ', '.join(language_strings)
            elif person_dict.get('languages') is None:
                person_dict['languages'] = ''
            
            # Remove SQLAlchemy internal attributes
            person_dict.pop('_sa_instance_state', None)
            formatted_people.append(person_dict)
        
        # Calculate total pages
        total_pages = math.ceil(total / limit)
        
        return {
            "people": formatted_people,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching people: {str(e)}")

@router.get("/{person_id}")
async def get_person(person_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific person"""
    try:
        person = db.query(People).filter(People.id == person_id).first()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        
        # Get analytics if available
        analytics = db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first()
        case_stats = db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first()
        
        # Convert person data for API response
        person_dict = person.__dict__.copy()
        
        # Convert JSON arrays to comma-separated strings
        if person_dict.get('previous_names') and isinstance(person_dict['previous_names'], list):
            person_dict['previous_names'] = ', '.join(person_dict['previous_names']) if person_dict['previous_names'] else ''
        elif person_dict.get('previous_names') is None or person_dict.get('previous_names') == []:
            person_dict['previous_names'] = ''
            
        if person_dict.get('case_types') and isinstance(person_dict['case_types'], list):
            person_dict['case_types'] = ', '.join(person_dict['case_types'])
        elif person_dict.get('case_types') is None:
            person_dict['case_types'] = ''
            
        if person_dict.get('languages') and isinstance(person_dict['languages'], list):
            person_dict['languages'] = ', '.join(person_dict['languages'])
        elif person_dict.get('languages') is None:
            person_dict['languages'] = ''
        
        # Remove SQLAlchemy internal attributes
        person_dict.pop('_sa_instance_state', None)
        
        return {
            "person": person_dict,
            "analytics": analytics,
            "case_statistics": case_stats
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching person: {str(e)}")

@router.post("/")
async def create_person(person_data: dict, db: Session = Depends(get_db)):
    """Create a new person record"""
    try:
        # Generate full_name if not provided
        if not person_data.get('full_name') and person_data.get('first_name') and person_data.get('last_name'):
            person_data['full_name'] = f"{person_data['first_name']} {person_data['last_name']}"
        
        # Set default values
        person_data.setdefault('country', 'Ghana')
        person_data.setdefault('nationality', 'Ghanaian')
        person_data.setdefault('status', 'active')
        person_data.setdefault('case_count', 0)
        person_data.setdefault('children_count', 0)
        person_data.setdefault('search_count', 0)
        person_data.setdefault('is_verified', False)
        
        # Create new person
        new_person = People(**person_data)
        db.add(new_person)
        db.commit()
        db.refresh(new_person)
        
        return new_person
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating person: {str(e)}")

@router.put("/{person_id}")
async def update_person(person_id: int, person_data: dict, db: Session = Depends(get_db)):
    """Update an existing person record"""
    try:
        person = db.query(People).filter(People.id == person_id).first()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        
        # Update only provided fields
        for key, value in person_data.items():
            if hasattr(person, key) and value is not None:
                setattr(person, key, value)
        
        db.commit()
        db.refresh(person)
        
        return person
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating person: {str(e)}")

@router.delete("/{person_id}")
async def delete_person(person_id: int, db: Session = Depends(get_db)):
    """Delete a person and all associated data"""
    try:
        person = db.query(People).filter(People.id == person_id).first()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        
        # Delete associated analytics and statistics
        db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).delete()
        db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).delete()
        
        # Delete the person
        db.delete(person)
        db.commit()
        
        return {"message": "Person deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting person: {str(e)}")
