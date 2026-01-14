from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional
from datetime import datetime, timedelta
import math

from database import get_db
from models.gazette import Gazette, GazetteSearch as GazetteSearchModel, GazetteView
from schemas.gazette import (
    GazetteCreate, GazetteUpdate, GazetteResponse, GazetteListResponse,
    GazetteSearch, GazetteStats, GazetteViewCreate, GazetteViewResponse,
    GazetteAnalytics, GazetteType, GazetteStatus, GazettePriority
)
from models.people import People
from models.companies import Companies
from models.banks import Banks
from models.insurance import Insurance
from services.gazette_people_sync import sync_gazette_to_people, create_person_from_gazette

router = APIRouter(prefix="/gazette", tags=["gazette"])

# Create Gazette Entry
@router.post("/", response_model=GazetteResponse)
def create_gazette(gazette: GazetteCreate, db: Session = Depends(get_db)):
    """Create a new gazette entry"""
    db_gazette = Gazette(**gazette.dict())
    db.add(db_gazette)
    db.commit()
    db.refresh(db_gazette)
    
    # Synchronize with people table
    try:
        if db_gazette.person_id:
            # If person is linked, sync the gazette data to the person
            sync_gazette_to_people(db, db_gazette.id)
            # Generate analytics for the linked person
            try:
                from services.auto_analytics_generator import AutoAnalyticsGenerator
                generator = AutoAnalyticsGenerator(db)
                generator.generate_analytics_for_person(db_gazette.person_id)
                print(f"Analytics generated for gazette-linked person {db_gazette.person_id}")
            except Exception as analytics_error:
                print(f"Warning: Failed to generate analytics for gazette-linked person {db_gazette.person_id}: {analytics_error}")
        else:
            # If no person is linked but we have name data, create a new person
            if db_gazette.new_name or db_gazette.old_name:
                person_id = create_person_from_gazette(db, db_gazette.id)
                if person_id:
                    db_gazette.person_id = person_id
                    db.commit()
                    db.refresh(db_gazette)
                    # Generate analytics for the newly created person
                    try:
                        from services.auto_analytics_generator import AutoAnalyticsGenerator
                        generator = AutoAnalyticsGenerator(db)
                        generator.generate_analytics_for_person(person_id)
                        print(f"Analytics generated for new gazette person {person_id}")
                    except Exception as analytics_error:
                        print(f"Warning: Failed to generate analytics for new gazette person {person_id}: {analytics_error}")
    except Exception as e:
        # Log error but don't fail the gazette creation
        print(f"Warning: Failed to sync gazette {db_gazette.id} with people table: {e}")
    
    return db_gazette

# Get Gazette Entry by ID
@router.get("/{gazette_id}", response_model=GazetteResponse)
def get_gazette(gazette_id: int, db: Session = Depends(get_db)):
    """Get a specific gazette entry by ID"""
    gazette = db.query(Gazette).filter(Gazette.id == gazette_id).first()
    if not gazette:
        raise HTTPException(status_code=404, detail="Gazette entry not found")
    return gazette

# Update Gazette Entry
@router.put("/{gazette_id}", response_model=GazetteResponse)
def update_gazette(gazette_id: int, gazette_update: GazetteUpdate, db: Session = Depends(get_db)):
    """Update a gazette entry"""
    gazette = db.query(Gazette).filter(Gazette.id == gazette_id).first()
    if not gazette:
        raise HTTPException(status_code=404, detail="Gazette entry not found")
    
    update_data = gazette_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gazette, field, value)
    
    gazette.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(gazette)
    
    # Synchronize with people table
    try:
        if gazette.person_id:
            # If person is linked, sync the updated gazette data to the person
            sync_gazette_to_people(db, gazette.id)
        else:
            # If no person is linked but we have name data, create a new person
            if gazette.new_name or gazette.old_name:
                person_id = create_person_from_gazette(db, gazette.id)
                if person_id:
                    gazette.person_id = person_id
                    db.commit()
                    db.refresh(gazette)
    except Exception as e:
        # Log error but don't fail the gazette update
        print(f"Warning: Failed to sync gazette {gazette.id} with people table: {e}")
    
    return gazette

# Delete Gazette Entry
@router.delete("/{gazette_id}")
def delete_gazette(gazette_id: int, db: Session = Depends(get_db)):
    """Delete a gazette entry"""
    gazette = db.query(Gazette).filter(Gazette.id == gazette_id).first()
    if not gazette:
        raise HTTPException(status_code=404, detail="Gazette entry not found")
    
    db.delete(gazette)
    db.commit()
    return {"message": "Gazette entry deleted successfully"}

# List Gazette Entries with Search and Filtering
@router.get("/", response_model=GazetteListResponse)
def list_gazettes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    gazette_type: Optional[GazetteType] = Query(None),
    status: Optional[GazetteStatus] = Query(None),
    priority: Optional[GazettePriority] = Query(None),
    person_id: Optional[int] = Query(None),
    company_id: Optional[int] = Query(None),
    bank_id: Optional[int] = Query(None),
    insurance_id: Optional[int] = Query(None),
    jurisdiction: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    is_public: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    sort_by: str = Query("publication_date", regex="^(publication_date|created_at|title|priority)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """List gazette entries with search and filtering
    
    Note: For management page searches, this should only return CHANGE_OF_NAME entries.
    The frontend should explicitly specify gazette_type=CHANGE_OF_NAME when searching for change of name.
    """
    
    query = db.query(Gazette)
    
    # Note: We don't default to CHANGE_OF_NAME here to maintain backward compatibility
    # The frontend should explicitly pass gazette_type=CHANGE_OF_NAME for change of name searches
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        search_lower = search.lower()
        
        # Build search filter including alias_names JSONB array
        # For JSONB arrays, we need to properly search within array elements
        # Use PostgreSQL's jsonb_array_elements_text function via text()
        from sqlalchemy import text, literal_column
        
        # Build the search filter with proper JSONB array handling
        search_conditions = [
            Gazette.title.ilike(search_term),
            Gazette.content.ilike(search_term),
            Gazette.description.ilike(search_term),
            Gazette.reference_number.ilike(search_term),
            Gazette.gazette_number.ilike(search_term),
            # Search in name fields
            Gazette.old_name.ilike(search_term),
            Gazette.new_name.ilike(search_term),
            Gazette.current_name.ilike(search_term),
            Gazette.name_value.ilike(search_term),
        ]
        
        # Search in alias_names JSONB array
        # Use the simpler text-based search approach which is safer and more reliable
        # This searches the entire JSONB array as text representation
        # For more precise array element search, this could be enhanced with a subquery
        # but for now, the text-based search should work for most cases
        
        # Also keep the text cast search as a fallback for edge cases
        # This searches the entire JSONB array as text representation
        try:
            search_conditions.append(
                and_(
                    Gazette.alias_names.isnot(None),
                    func.lower(func.cast(Gazette.alias_names, func.text)).like(f"%{search_lower}%")
                )
            )
        except Exception as e:
            print(f"Warning: Failed to add alias_names text search: {e}")
        
        try:
            search_filter = or_(*search_conditions)
            query = query.filter(search_filter)
        except Exception as e:
            # If the search filter fails, log the error and use a simpler search
            print(f"Error creating search filter: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to basic text search only
            simple_search = or_(
                Gazette.title.ilike(search_term),
                Gazette.old_name.ilike(search_term),
                Gazette.new_name.ilike(search_term),
                Gazette.current_name.ilike(search_term),
                Gazette.name_value.ilike(search_term),
            )
            query = query.filter(simple_search)
    
    if gazette_type:
        query = query.filter(Gazette.gazette_type == gazette_type)
    
    if status:
        query = query.filter(Gazette.status == status)
    
    if priority:
        query = query.filter(Gazette.priority == priority)
    
    if person_id:
        query = query.filter(Gazette.person_id == person_id)
    
    if company_id:
        query = query.filter(Gazette.company_id == company_id)
    
    if bank_id:
        query = query.filter(Gazette.bank_id == bank_id)
    
    if insurance_id:
        query = query.filter(Gazette.insurance_id == insurance_id)
    
    if jurisdiction:
        query = query.filter(Gazette.jurisdiction.ilike(f"%{jurisdiction}%"))
    
    if source:
        query = query.filter(Gazette.source.ilike(f"%{source}%"))
    
    if date_from:
        # Filter by gazette_date (the actual date from the gazette document) or publication_date
        # gazette_date is a Date field, so convert datetime to date for comparison
        date_from_date = date_from.date() if isinstance(date_from, datetime) else date_from
        query = query.filter(
            or_(
                Gazette.publication_date >= date_from,
                Gazette.gazette_date >= date_from_date
            )
        )
    
    if date_to:
        # Filter by gazette_date (the actual date from the gazette document) or publication_date
        # gazette_date is a Date field, so convert datetime to date for comparison
        date_to_date = date_to.date() if isinstance(date_to, datetime) else date_to
        query = query.filter(
            or_(
                Gazette.publication_date <= date_to,
                Gazette.gazette_date <= date_to_date
            )
        )
    
    if is_public is not None:
        query = query.filter(Gazette.is_public == is_public)
    
    if is_featured is not None:
        query = query.filter(Gazette.is_featured == is_featured)
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(Gazette, sort_by)))
    else:
        query = query.order_by(asc(getattr(Gazette, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    gazettes = query.offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit)
    
    return GazetteListResponse(
        gazettes=gazettes,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

# Synchronization Endpoints
@router.post("/sync/{gazette_id}")
def sync_gazette_with_people(gazette_id: int, db: Session = Depends(get_db)):
    """Manually synchronize a specific gazette entry with the people table"""
    try:
        success = sync_gazette_to_people(db, gazette_id)
        if success:
            return {"message": f"Gazette {gazette_id} synchronized successfully with people table"}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to synchronize gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error synchronizing gazette: {str(e)}")

@router.post("/sync-all")
def sync_all_gazettes_with_people(db: Session = Depends(get_db)):
    """Manually synchronize all gazette entries with the people table"""
    try:
        from services.gazette_people_sync import sync_all_gazettes
        stats = sync_all_gazettes(db)
        return {
            "message": "Bulk synchronization completed",
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk synchronization: {str(e)}")

@router.post("/create-person/{gazette_id}")
def create_person_from_gazette_endpoint(gazette_id: int, db: Session = Depends(get_db)):
    """Create a new person record from gazette data"""
    try:
        person_id = create_person_from_gazette(db, gazette_id)
        if person_id:
            return {
                "message": f"Person {person_id} created successfully from gazette {gazette_id}",
                "person_id": person_id
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create person from gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating person from gazette: {str(e)}")

# Get Gazette Statistics
@router.get("/stats/overview", response_model=GazetteStats)
def get_gazette_stats(db: Session = Depends(get_db)):
    """Get gazette statistics"""
    
    # Total gazettes
    total_gazettes = db.query(Gazette).count()
    
    # Published gazettes
    published_gazettes = db.query(Gazette).filter(Gazette.status == GazetteStatus.PUBLISHED).count()
    
    # Draft gazettes
    draft_gazettes = db.query(Gazette).filter(Gazette.status == GazetteStatus.DRAFT).count()
    
    # Archived gazettes
    archived_gazettes = db.query(Gazette).filter(Gazette.status == GazetteStatus.ARCHIVED).count()
    
    # Gazettes by type
    gazettes_by_type = {}
    for gazette_type in GazetteType:
        count = db.query(Gazette).filter(Gazette.gazette_type == gazette_type).count()
        gazettes_by_type[gazette_type.value] = count
    
    # Gazettes by priority
    gazettes_by_priority = {}
    for priority in GazettePriority:
        count = db.query(Gazette).filter(Gazette.priority == priority).count()
        gazettes_by_priority[priority.value] = count
    
    # Gazettes by jurisdiction
    jurisdiction_stats = db.query(
        Gazette.jurisdiction,
        func.count(Gazette.id).label('count')
    ).filter(
        Gazette.jurisdiction.isnot(None)
    ).group_by(Gazette.jurisdiction).all()
    
    gazettes_by_jurisdiction = {stat.jurisdiction: stat.count for stat in jurisdiction_stats}
    
    # Recent gazettes (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_gazettes = db.query(Gazette).filter(
        Gazette.created_at >= thirty_days_ago
    ).count()
    
    # Featured gazettes
    featured_gazettes = db.query(Gazette).filter(Gazette.is_featured == True).count()
    
    return GazetteStats(
        total_gazettes=total_gazettes,
        published_gazettes=published_gazettes,
        draft_gazettes=draft_gazettes,
        archived_gazettes=archived_gazettes,
        gazettes_by_type=gazettes_by_type,
        gazettes_by_priority=gazettes_by_priority,
        gazettes_by_jurisdiction=gazettes_by_jurisdiction,
        recent_gazettes=recent_gazettes,
        featured_gazettes=featured_gazettes
    )

# Record Gazette View
@router.post("/{gazette_id}/view", response_model=GazetteViewResponse)
def record_gazette_view(gazette_id: int, view_data: GazetteViewCreate, db: Session = Depends(get_db)):
    """Record a view of a gazette entry"""
    
    # Check if gazette exists
    gazette = db.query(Gazette).filter(Gazette.id == gazette_id).first()
    if not gazette:
        raise HTTPException(status_code=404, detail="Gazette entry not found")
    
    # Create view record
    view = GazetteView(
        gazette_id=gazette_id,
        user_id=view_data.user_id,
        ip_address=view_data.ip_address,
        user_agent=view_data.user_agent
    )
    
    db.add(view)
    db.commit()
    db.refresh(view)
    
    return view

# Get Gazette Analytics
@router.get("/analytics/overview", response_model=GazetteAnalytics)
def get_gazette_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get gazette analytics"""
    
    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Total views
    total_views = db.query(GazetteView).count()
    
    # Unique views (by IP address)
    unique_views = db.query(GazetteView.ip_address).distinct().count()
    
    # Views by date
    views_by_date = {}
    date_views = db.query(
        func.date(GazetteView.viewed_at).label('date'),
        func.count(GazetteView.id).label('count')
    ).filter(
        GazetteView.viewed_at >= start_date,
        GazetteView.viewed_at <= end_date
    ).group_by(func.date(GazetteView.viewed_at)).all()
    
    for view in date_views:
        views_by_date[str(view.date)] = view.count
    
    # Popular gazettes
    popular_gazettes = db.query(
        Gazette.id,
        Gazette.title,
        func.count(GazetteView.id).label('view_count')
    ).join(GazetteView).group_by(
        Gazette.id, Gazette.title
    ).order_by(desc('view_count')).limit(10).all()
    
    popular_gazettes_list = [
        {"id": g.id, "title": g.title, "view_count": g.view_count}
        for g in popular_gazettes
    ]
    
    # Views by type
    views_by_type = {}
    type_views = db.query(
        Gazette.gazette_type,
        func.count(GazetteView.id).label('count')
    ).join(GazetteView).group_by(Gazette.gazette_type).all()
    
    for view in type_views:
        views_by_type[view.gazette_type.value] = view.count
    
    # Views by jurisdiction
    views_by_jurisdiction = {}
    jurisdiction_views = db.query(
        Gazette.jurisdiction,
        func.count(GazetteView.id).label('count')
    ).join(GazetteView).filter(
        Gazette.jurisdiction.isnot(None)
    ).group_by(Gazette.jurisdiction).all()
    
    for view in jurisdiction_views:
        views_by_jurisdiction[view.jurisdiction] = view.count
    
    return GazetteAnalytics(
        total_views=total_views,
        unique_views=unique_views,
        views_by_date=views_by_date,
        popular_gazettes=popular_gazettes_list,
        views_by_type=views_by_type,
        views_by_jurisdiction=views_by_jurisdiction
    )

# Get Gazettes by Person
@router.get("/person/{person_id}", response_model=GazetteListResponse)
def get_gazettes_by_person(
    person_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all gazette entries for a specific person"""
    
    # Check if person exists
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    query = db.query(Gazette).filter(Gazette.person_id == person_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    gazettes = query.order_by(desc(Gazette.publication_date)).offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit)
    
    return GazetteListResponse(
        gazettes=gazettes,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

# Synchronization Endpoints
@router.post("/sync/{gazette_id}")
def sync_gazette_with_people(gazette_id: int, db: Session = Depends(get_db)):
    """Manually synchronize a specific gazette entry with the people table"""
    try:
        success = sync_gazette_to_people(db, gazette_id)
        if success:
            return {"message": f"Gazette {gazette_id} synchronized successfully with people table"}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to synchronize gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error synchronizing gazette: {str(e)}")

@router.post("/sync-all")
def sync_all_gazettes_with_people(db: Session = Depends(get_db)):
    """Manually synchronize all gazette entries with the people table"""
    try:
        from services.gazette_people_sync import sync_all_gazettes
        stats = sync_all_gazettes(db)
        return {
            "message": "Bulk synchronization completed",
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk synchronization: {str(e)}")

@router.post("/create-person/{gazette_id}")
def create_person_from_gazette_endpoint(gazette_id: int, db: Session = Depends(get_db)):
    """Create a new person record from gazette data"""
    try:
        person_id = create_person_from_gazette(db, gazette_id)
        if person_id:
            return {
                "message": f"Person {person_id} created successfully from gazette {gazette_id}",
                "person_id": person_id
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create person from gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating person from gazette: {str(e)}")

# Get Gazettes by Company
@router.get("/company/{company_id}", response_model=GazetteListResponse)
def get_gazettes_by_company(
    company_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all gazette entries for a specific company"""
    
    # Check if company exists
    company = db.query(Companies).filter(Companies.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    query = db.query(Gazette).filter(Gazette.company_id == company_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    gazettes = query.order_by(desc(Gazette.publication_date)).offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit)
    
    return GazetteListResponse(
        gazettes=gazettes,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

# Synchronization Endpoints
@router.post("/sync/{gazette_id}")
def sync_gazette_with_people(gazette_id: int, db: Session = Depends(get_db)):
    """Manually synchronize a specific gazette entry with the people table"""
    try:
        success = sync_gazette_to_people(db, gazette_id)
        if success:
            return {"message": f"Gazette {gazette_id} synchronized successfully with people table"}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to synchronize gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error synchronizing gazette: {str(e)}")

@router.post("/sync-all")
def sync_all_gazettes_with_people(db: Session = Depends(get_db)):
    """Manually synchronize all gazette entries with the people table"""
    try:
        from services.gazette_people_sync import sync_all_gazettes
        stats = sync_all_gazettes(db)
        return {
            "message": "Bulk synchronization completed",
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk synchronization: {str(e)}")

@router.post("/create-person/{gazette_id}")
def create_person_from_gazette_endpoint(gazette_id: int, db: Session = Depends(get_db)):
    """Create a new person record from gazette data"""
    try:
        person_id = create_person_from_gazette(db, gazette_id)
        if person_id:
            return {
                "message": f"Person {person_id} created successfully from gazette {gazette_id}",
                "person_id": person_id
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create person from gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating person from gazette: {str(e)}")

# Get Gazettes by Bank
@router.get("/bank/{bank_id}", response_model=GazetteListResponse)
def get_gazettes_by_bank(
    bank_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all gazette entries for a specific bank"""
    
    # Check if bank exists
    bank = db.query(Banks).filter(Banks.id == bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    query = db.query(Gazette).filter(Gazette.bank_id == bank_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    gazettes = query.order_by(desc(Gazette.publication_date)).offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit)
    
    return GazetteListResponse(
        gazettes=gazettes,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

# Synchronization Endpoints
@router.post("/sync/{gazette_id}")
def sync_gazette_with_people(gazette_id: int, db: Session = Depends(get_db)):
    """Manually synchronize a specific gazette entry with the people table"""
    try:
        success = sync_gazette_to_people(db, gazette_id)
        if success:
            return {"message": f"Gazette {gazette_id} synchronized successfully with people table"}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to synchronize gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error synchronizing gazette: {str(e)}")

@router.post("/sync-all")
def sync_all_gazettes_with_people(db: Session = Depends(get_db)):
    """Manually synchronize all gazette entries with the people table"""
    try:
        from services.gazette_people_sync import sync_all_gazettes
        stats = sync_all_gazettes(db)
        return {
            "message": "Bulk synchronization completed",
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk synchronization: {str(e)}")

@router.post("/create-person/{gazette_id}")
def create_person_from_gazette_endpoint(gazette_id: int, db: Session = Depends(get_db)):
    """Create a new person record from gazette data"""
    try:
        person_id = create_person_from_gazette(db, gazette_id)
        if person_id:
            return {
                "message": f"Person {person_id} created successfully from gazette {gazette_id}",
                "person_id": person_id
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create person from gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating person from gazette: {str(e)}")

# Get Gazettes by Insurance
@router.get("/insurance/{insurance_id}", response_model=GazetteListResponse)
def get_gazettes_by_insurance(
    insurance_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all gazette entries for a specific insurance company"""
    
    # Check if insurance exists
    insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    query = db.query(Gazette).filter(Gazette.insurance_id == insurance_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    gazettes = query.order_by(desc(Gazette.publication_date)).offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit)
    
    return GazetteListResponse(
        gazettes=gazettes,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

# Synchronization Endpoints
@router.post("/sync/{gazette_id}")
def sync_gazette_with_people(gazette_id: int, db: Session = Depends(get_db)):
    """Manually synchronize a specific gazette entry with the people table"""
    try:
        success = sync_gazette_to_people(db, gazette_id)
        if success:
            return {"message": f"Gazette {gazette_id} synchronized successfully with people table"}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to synchronize gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error synchronizing gazette: {str(e)}")

@router.post("/sync-all")
def sync_all_gazettes_with_people(db: Session = Depends(get_db)):
    """Manually synchronize all gazette entries with the people table"""
    try:
        from services.gazette_people_sync import sync_all_gazettes
        stats = sync_all_gazettes(db)
        return {
            "message": "Bulk synchronization completed",
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk synchronization: {str(e)}")

@router.post("/create-person/{gazette_id}")
def create_person_from_gazette_endpoint(gazette_id: int, db: Session = Depends(get_db)):
    """Create a new person record from gazette data"""
    try:
        person_id = create_person_from_gazette(db, gazette_id)
        if person_id:
            return {
                "message": f"Person {person_id} created successfully from gazette {gazette_id}",
                "person_id": person_id
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to create person from gazette {gazette_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating person from gazette: {str(e)}")
