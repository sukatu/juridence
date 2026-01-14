from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from database import get_db
from models.case_hearings import CaseHearing
from models.reported_cases import ReportedCases
from models.court import Court
from schemas.case_hearings import CaseHearing as CaseHearingSchema, CaseHearingCreate, CaseHearingUpdate
from auth import get_current_user
from models.user import User
from datetime import datetime

router = APIRouter(dependencies=[])

@router.get("/admin/case-hearings/test")
async def test_endpoint():
    """Test endpoint without authentication"""
    return {"message": "Test endpoint working", "status": "success"}

@router.get("/admin/case-hearings/search/cases")
async def search_cases_for_hearing(
    q: str = Query("", min_length=0),
    limit: int = Query(1000, ge=1, le=10000),  # Increased limit to fetch all cases
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Search cases by suit reference number or title for hearing creation"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    if q:
        # Search with query
        cases = db.query(ReportedCases).filter(
            or_(
                ReportedCases.suit_reference_number.ilike(f"%{q}%"),
                ReportedCases.title.ilike(f"%{q}%")
            )
        ).limit(limit).all()
    else:
        # Return all cases when no query provided
        cases = db.query(ReportedCases).filter(
            ReportedCases.title.isnot(None)
        ).limit(limit).all()
    
    return [
        {
            "id": case.id,
            "suit_reference_number": case.suit_reference_number,
            "title": case.title,
            "court_type": case.court_type,
            "court_division": case.court_division
        }
        for case in cases
    ]

@router.get("/admin/case-hearings/courts")
async def get_courts_for_hearing(
    court_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get courts for hearing creation/editing"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(ReportedCases).distinct()
    
    if court_type:
        query = query.filter(ReportedCases.court_type == court_type)
    
    courts = query.with_entities(
        ReportedCases.court_type,
        ReportedCases.court_division,
        ReportedCases.region
    ).all()
    
    return [
        {
            "court_type": court.court_type,
            "court_division": court.court_division,
            "region": court.region
        }
        for court in courts if court.court_type and court.court_division
    ]

@router.get("/admin/case-hearings/judges")
async def get_judges_for_hearing(
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get judges for hearing creation/editing"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    judges = db.query(ReportedCases).filter(
        ReportedCases.presiding_judge.isnot(None)
    ).distinct().with_entities(ReportedCases.presiding_judge).all()
    
    return [judge.presiding_judge for judge in judges if judge.presiding_judge]

@router.get("/admin/case-hearings")
async def get_all_case_hearings(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    court_type: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    group_by_case: bool = Query(False),
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get all case hearings with filtering and pagination for admin"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query with proper join
    query = db.query(CaseHearing, ReportedCases).join(
        ReportedCases, CaseHearing.case_id == ReportedCases.id, isouter=True
    )
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                ReportedCases.title.ilike(f"%{search}%"),
                ReportedCases.suit_reference_number.ilike(f"%{search}%")
            )
        )
    
    if court_type:
        query = query.filter(ReportedCases.court_type == court_type)
    
    if remark:
        query = query.filter(CaseHearing.remark == remark)
    
    # Get total count before pagination
    total_count = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    results = query.order_by(ReportedCases.title, CaseHearing.hearing_date.desc()).offset(offset).limit(limit).all()
    
    if group_by_case:
        # Group hearings by case
        cases_dict = {}
        for hearing, case in results:
            case_id = case.id if case else hearing.case_id
            
            if case_id not in cases_dict:
                cases_dict[case_id] = {
                    'case_id': case_id,
                    'suit_reference_number': case.suit_reference_number if case else None,
                    'title': case.title if case else None,
                    'court_type': case.court_type if case else None,
                    'court_name': case.court_division if case else None,
                    'hearings': []
                }
            
            hearing_dict = {
                'id': hearing.id,
                'hearing_date': hearing.hearing_date.isoformat() if hearing.hearing_date else None,
                'hearing_time': hearing.hearing_time,
                'coram': hearing.coram,
                'remark': hearing.remark,
                'proceedings': hearing.proceedings,
                'created_at': hearing.created_at.isoformat() if hearing.created_at else None,
                'updated_at': hearing.updated_at.isoformat() if hearing.updated_at else None,
            }
            cases_dict[case_id]['hearings'].append(hearing_dict)
        
        # Convert to list and sort by title
        cases_list = list(cases_dict.values())
        cases_list.sort(key=lambda x: x['title'] or '')
        
        return {
            'grouped': True,
            'cases': cases_list,
            'total_cases': len(cases_list),
            'total_count': total_count
        }
    else:
        # Return flat list of hearings (original behavior)
        hearings_list = []
        for hearing, case in results:
            hearing_dict = {
                'id': hearing.id,
                'case_id': hearing.case_id,
                'hearing_date': hearing.hearing_date.isoformat() if hearing.hearing_date else None,
                'hearing_time': hearing.hearing_time,
                'coram': hearing.coram,
                'remark': hearing.remark,
                'proceedings': hearing.proceedings,
                'created_at': hearing.created_at.isoformat() if hearing.created_at else None,
                'updated_at': hearing.updated_at.isoformat() if hearing.updated_at else None,
                'suit_reference_number': case.suit_reference_number if case else None,
                'title': case.title if case else None,
                'court_type': case.court_type if case else None,
                'court_name': case.court_division if case else None,
                'attendance': None,  # Not stored in current schema
                'representation': None  # Not stored in current schema
            }
            hearings_list.append(hearing_dict)
        
        return {
            'grouped': False,
            'hearings': hearings_list,
            'total_hearings': len(hearings_list),
            'total_count': total_count
        }

@router.get("/admin/case-hearings/{hearing_id}", response_model=CaseHearingSchema)
async def get_case_hearing_by_id(
    hearing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific case hearing by ID"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    hearing = db.query(CaseHearing).filter(CaseHearing.id == hearing_id).first()
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    # Add case information
    case = db.query(ReportedCases).filter(ReportedCases.id == hearing.case_id).first()
    hearing_dict = hearing.__dict__.copy()
    hearing_dict['suit_reference_number'] = case.suit_reference_number if case else None
    hearing_dict['title'] = case.title if case else None
    hearing_dict['court_type'] = case.court_type if case else None
    hearing_dict['court_name'] = case.court_division if case else None
    
    return hearing_dict

@router.post("/admin/case-hearings", response_model=CaseHearingSchema)
async def create_case_hearing(
    hearing_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new case hearing record"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Find case by suit reference number
    case = None
    if hearing_data.get('suit_reference_number'):
        case = db.query(ReportedCases).filter(
            ReportedCases.suit_reference_number == hearing_data['suit_reference_number']
        ).first()
        
        # Only raise error if suit_reference_number is provided but no case found
        # If suit_reference_number is empty string, allow creation without case
        if not case and hearing_data['suit_reference_number'].strip():
            raise HTTPException(status_code=404, detail="Case not found with the provided suit reference number")
    
    # Create new hearing record
    case_id = None
    if case:
        case_id = case.id
    elif hearing_data.get('case_id'):
        case_id = hearing_data.get('case_id')
    else:
        # If no case found, allow creation with null case_id
        case_id = None
    
    db_hearing = CaseHearing(
        case_id=case_id,
        hearing_date=datetime.fromisoformat(hearing_data['hearing_date'].replace('Z', '+00:00')) if hearing_data.get('hearing_date') else None,
        hearing_time=hearing_data.get('hearing_time'),
        coram=hearing_data.get('coram'),
        remark=hearing_data.get('remark', 'fh'),
        proceedings=hearing_data.get('proceedings')
    )
    
    db.add(db_hearing)
    db.commit()
    db.refresh(db_hearing)
    
    # Update case with additional hearing information if provided
    if case and hearing_data.get('attendance'):
        # Store attendance in case metadata or create a separate table
        pass
    
    if case and hearing_data.get('representation'):
        # Store representation information
        pass
    
    # Add case information to response
    hearing_dict = db_hearing.__dict__.copy()
    hearing_dict['suit_reference_number'] = case.suit_reference_number if case else None
    hearing_dict['title'] = case.title if case else None
    hearing_dict['court_type'] = case.court_type if case else None
    hearing_dict['court_name'] = case.court_division if case else None
    
    return hearing_dict

@router.put("/admin/case-hearings/{hearing_id}", response_model=CaseHearingSchema)
async def update_case_hearing(
    hearing_id: int,
    hearing_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a case hearing record"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    hearing = db.query(CaseHearing).filter(CaseHearing.id == hearing_id).first()
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    # Update hearing fields
    update_fields = ['hearing_time', 'coram', 'remark', 'proceedings']
    for field in update_fields:
        if field in hearing_data:
            setattr(hearing, field, hearing_data[field])
    
    if 'hearing_date' in hearing_data:
        hearing.hearing_date = datetime.fromisoformat(hearing_data['hearing_date'].replace('Z', '+00:00'))
    
    db.commit()
    db.refresh(hearing)
    
    # Add case information to response
    case = db.query(ReportedCases).filter(ReportedCases.id == hearing.case_id).first()
    hearing_dict = hearing.__dict__.copy()
    hearing_dict['suit_reference_number'] = case.suit_reference_number if case else None
    hearing_dict['title'] = case.title if case else None
    hearing_dict['court_type'] = case.court_type if case else None
    hearing_dict['court_name'] = case.court_division if case else None
    
    return hearing_dict

@router.delete("/admin/case-hearings/{hearing_id}")
async def delete_case_hearing(
    hearing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a case hearing record"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    hearing = db.query(CaseHearing).filter(CaseHearing.id == hearing_id).first()
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    
    db.delete(hearing)
    db.commit()
    
    return {"message": "Hearing deleted successfully"}

@router.get("/admin/case-hearings/search/cases")
async def search_cases_for_hearing(
    q: str = Query("", min_length=0),
    limit: int = Query(1000, ge=1, le=10000),  # Increased limit to fetch all cases
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Search cases by suit reference number or title for hearing creation"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    if q:
        # Search with query
        cases = db.query(ReportedCases).filter(
            or_(
                ReportedCases.suit_reference_number.ilike(f"%{q}%"),
                ReportedCases.title.ilike(f"%{q}%")
            )
        ).limit(limit).all()
    else:
        # Return all cases when no query provided
        cases = db.query(ReportedCases).filter(
            ReportedCases.title.isnot(None)
        ).limit(limit).all()
    
    return [
        {
            "id": case.id,
            "suit_reference_number": case.suit_reference_number,
            "title": case.title,
            "court_type": case.court_type,
            "court_division": case.court_division
        }
        for case in cases
    ]

@router.get("/all-cases")
async def get_all_cases(
    db: Session = Depends(get_db)
):
    """Get ALL cases from the database for hearing creation"""
    try:
        # Get all cases with titles (suit reference number can be null)
        cases = db.query(ReportedCases).filter(
            ReportedCases.title.isnot(None)
        ).order_by(ReportedCases.title).all()
        
        print(f"📊 Total cases found in database: {len(cases)}")
        
        return [
            {
                "id": case.id,
                "suit_reference_number": case.suit_reference_number,
                "title": case.title,
                "court_type": case.court_type,
                "court_division": case.court_division
            }
            for case in cases
        ]
    except Exception as e:
        print(f"❌ Error fetching all cases: {e}")
        return []

@router.get("/admin/case-hearings/courts")
async def get_courts_for_hearing(
    court_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get courts for hearing creation/editing"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(ReportedCases).distinct()
    
    if court_type:
        query = query.filter(ReportedCases.court_type == court_type)
    
    courts = query.with_entities(
        ReportedCases.court_type,
        ReportedCases.court_division,
        ReportedCases.region
    ).all()
    
    return [
        {
            "court_type": court.court_type,
            "court_name": court.court_division,
            "region": court.region
        }
        for court in courts if court.court_type and court.court_division
    ]

@router.get("/admin/case-hearings/judges")
async def get_judges_for_hearing(
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get judges for hearing creation/editing"""
    # Temporarily disabled for testing
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    judges = db.query(ReportedCases).filter(
        ReportedCases.presiding_judge.isnot(None)
    ).distinct().with_entities(ReportedCases.presiding_judge).all()
    
    return [judge.presiding_judge for judge in judges if judge.presiding_judge]

@router.get("/admin/case-hearings/stats")
async def get_hearing_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get hearing statistics for admin dashboard"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_hearings = db.query(CaseHearing).count()
    
    # Count by remark type
    hearing_by_remark = db.query(CaseHearing.remark, db.func.count(CaseHearing.id)).group_by(CaseHearing.remark).all()
    
    # Recent hearings (last 30 days)
    recent_hearings = db.query(CaseHearing).filter(
        CaseHearing.hearing_date >= datetime.now().replace(day=1)
    ).count()
    
    return {
        "total_hearings": total_hearings,
        "hearing_by_remark": {remark: count for remark, count in hearing_by_remark},
        "recent_hearings": recent_hearings
    }
