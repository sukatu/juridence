from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, text
from typing import List, Optional
import re
import math

from database import get_db
from models.court import Court
from models.user import User
from auth import get_current_user
from schemas.court import (
    CourtCreate, CourtUpdate, CourtResponse, CourtListResponse,
    CourtSearchRequest, CourtMapResponse, CourtMapListResponse,
    CourtType, CourtStatus
)

router = APIRouter()


def normalize_region_value(value: str) -> str:
    if not value:
        return value
    lowered = value.lower()
    lowered = re.sub(r"\bregion\b", "", lowered)
    return re.sub(r"[\s\-]+", "", lowered).strip()


def extract_town_name(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    cleaned = value.replace("–", "-").replace("—", "-").strip()
    if "," in cleaned:
        cleaned = cleaned.split(",", 1)[1].strip()
    if " Court" in cleaned:
        cleaned = re.split(r"\s+Court\b", cleaned, maxsplit=1, flags=re.IGNORECASE)[0].strip()
    # Remove trailing court-type qualifiers
    cleaned = re.sub(
        r"\b(High|Circuit|District|Commercial|Family|Land|Probate|Criminal|General|Human|Rights|Labour|Financial|Economic|Gender|Based|Violence|GBVC)\b$",
        "",
        cleaned,
        flags=re.IGNORECASE
    ).strip(" -")
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned or None

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) * math.sin(dlon/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

@router.get("/", response_model=CourtListResponse)
def get_courts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    court_type: Optional[CourtType] = Query(None, description="Filter by court type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    city: Optional[str] = Query(None, description="Filter by city"),
    is_active: Optional[bool] = Query(True, description="Filter by active status (default: True)"),
    db: Session = Depends(get_db)
):
    """Get all courts with optional filtering (defaults to active courts only)"""
    try:
        # Start with base query - only active courts by default
        query = db.query(Court)
        
        # Apply is_active filter (defaults to True)
        if is_active is not None:
            query = query.filter(Court.is_active == is_active)
        
        # Apply other filters
        if court_type:
            query = query.filter(Court.court_type == court_type)
        if region:
            normalized = normalize_region_value(region)
            normalized_db = func.replace(
                func.replace(
                    func.replace(func.lower(Court.region), "region", ""),
                    "-",
                    ""
                ),
                " ",
                ""
            )
            query = query.filter(normalized_db == normalized)
        if city:
            query = query.filter(Court.city.ilike(f"%{city}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        courts = query.offset(offset).limit(limit).all()
        
        total_pages = math.ceil(total / limit)
        
        return CourtListResponse(
            courts=courts,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courts: {str(e)}")

@router.get("/search", response_model=CourtListResponse)
def search_courts(
    query: Optional[str] = Query(None, description="Search query"),
    court_type: Optional[CourtType] = Query(None, description="Filter by court type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    city: Optional[str] = Query(None, description="Filter by city"),
    district: Optional[str] = Query(None, description="Filter by district"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    db: Session = Depends(get_db)
):
    """Search courts with various filters"""
    try:
        search_query = db.query(Court)
        
        # Text search
        if query:
            search_query = search_query.filter(
                or_(
                    Court.name.ilike(f"%{query}%"),
                    Court.registry_name.ilike(f"%{query}%"),
                    Court.location.ilike(f"%{query}%"),
                    Court.address.ilike(f"%{query}%"),
                    Court.city.ilike(f"%{query}%"),
                    Court.district.ilike(f"%{query}%"),
                    Court.area_coverage.ilike(f"%{query}%")
                )
            )
        
        # Apply filters
        if court_type:
            search_query = search_query.filter(Court.court_type == court_type)
        if region:
            normalized = normalize_region_value(region)
            normalized_db = func.replace(
                func.replace(
                    func.replace(func.lower(Court.region), "region", ""),
                    "-",
                    ""
                ),
                " ",
                ""
            )
            search_query = search_query.filter(normalized_db == normalized)
        if city:
            search_query = search_query.filter(Court.city.ilike(f"%{city}%"))
        if district:
            search_query = search_query.filter(Court.district.ilike(f"%{district}%"))
        if is_active is not None:
            search_query = search_query.filter(Court.is_active == is_active)
        
        # Get total count
        total = search_query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        courts = search_query.offset(offset).limit(limit).all()
        
        total_pages = math.ceil(total / limit)
        
        return CourtListResponse(
            courts=courts,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching courts: {str(e)}")

@router.get("/regions", response_model=List[str])
def get_regions(db: Session = Depends(get_db)):
    """Get all unique regions"""
    try:
        regions = db.query(Court.region).distinct().all()
        return [region[0] for region in regions if region[0]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching regions: {str(e)}")

@router.get("/cities", response_model=List[str])
def get_cities(
    region: Optional[str] = Query(None, description="Filter cities by region"),
    db: Session = Depends(get_db)
):
    """Get all unique cities, optionally filtered by region"""
    try:
        query = db.query(Court)
        if region:
            query = query.filter(Court.region.ilike(f"%{region}%"))
        cities = query.with_entities(Court.city, Court.name, Court.location).all()

        town_set = set()
        for city, name, location in cities:
            if city:
                town_set.add(city)
                continue
            for candidate in [location, name]:
                town = extract_town_name(candidate)
                if town:
                    town_set.add(town)

        return sorted(town_set)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cities: {str(e)}")

@router.get("/types", response_model=List[str])
def get_court_types(db: Session = Depends(get_db)):
    """Get all unique court types"""
    try:
        types = db.query(Court.court_type).distinct().all()
        return [court_type[0] for court_type in types if court_type[0]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching court types: {str(e)}")

@router.get("/map", response_model=CourtMapListResponse)
def get_courts_for_map(
    court_type: Optional[CourtType] = Query(None, description="Filter by court type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    city: Optional[str] = Query(None, description="Filter by city"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Latitude for proximity search"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Longitude for proximity search"),
    radius_km: Optional[float] = Query(None, gt=0, le=1000, description="Search radius in kilometers"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """Get courts for map display with optional proximity search"""
    try:
        query = db.query(Court).filter(Court.is_active == is_active)
        
        # Apply filters
        if court_type:
            query = query.filter(Court.court_type == court_type)
        if region:
            query = query.filter(Court.region.ilike(f"%{region}%"))
        if city:
            query = query.filter(Court.city.ilike(f"%{city}%"))
        
        # Filter by coordinates if provided
        if latitude and longitude and radius_km:
            # Use Haversine formula in SQL for better performance
            query = query.filter(
                text(f"""
                    (6371 * acos(
                        cos(radians(:lat)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians(:lon)) + 
                        sin(radians(:lat)) * sin(radians(latitude))
                    )) <= :radius
                """)
            ).params(lat=latitude, lon=longitude, radius=radius_km)
        
        courts = query.filter(
            Court.latitude.isnot(None),
            Court.longitude.isnot(None)
        ).all()
        
        # Calculate distances if proximity search
        court_maps = []
        for court in courts:
            distance_km = None
            if latitude and longitude:
                distance_km = calculate_distance(
                    latitude, longitude, 
                    court.latitude, court.longitude
                )
            
            court_maps.append(CourtMapResponse(
                id=court.id,
                name=court.name,
                registry_name=court.registry_name,
                court_type=court.court_type,
                region=court.region,
                location=court.location,
                latitude=court.latitude,
                longitude=court.longitude,
                address=court.address,
                contact_phone=court.contact_phone,
                is_active=court.is_active,
                distance_km=distance_km
            ))
        
        # Sort by distance if proximity search
        if latitude and longitude:
            court_maps.sort(key=lambda x: x.distance_km or float('inf'))
        
        # Calculate bounds for map
        bounds = None
        if court_maps:
            lats = [c.latitude for c in court_maps if c.latitude]
            lons = [c.longitude for c in court_maps if c.longitude]
            if lats and lons:
                bounds = {
                    "north": max(lats),
                    "south": min(lats),
                    "east": max(lons),
                    "west": min(lons)
                }
        
        return CourtMapListResponse(
            courts=court_maps,
            total=len(court_maps),
            bounds=bounds
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courts for map: {str(e)}")

@router.get("/{court_id}", response_model=CourtResponse)
def get_court(court_id: int, db: Session = Depends(get_db)):
    """Get a specific court by ID"""
    try:
        court = db.query(Court).filter(Court.id == court_id).first()
        if not court:
            raise HTTPException(status_code=404, detail="Court not found")
        
        # Update search count
        court.search_count += 1
        court.last_searched = func.now()
        db.commit()
        
        return court
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching court: {str(e)}")

@router.post("/", response_model=CourtResponse)
def create_court(
    court: CourtCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new court (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        db_court = Court(**court.dict())
        db.add(db_court)
        db.commit()
        db.refresh(db_court)
        return db_court
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating court: {str(e)}")

@router.put("/{court_id}", response_model=CourtResponse)
def update_court(
    court_id: int, 
    court: CourtUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a court (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        db_court = db.query(Court).filter(Court.id == court_id).first()
        if not db_court:
            raise HTTPException(status_code=404, detail="Court not found")
        
        update_data = court.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_court, field, value)
        
        db.commit()
        db.refresh(db_court)
        return db_court
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating court: {str(e)}")

@router.delete("/{court_id}")
def delete_court(
    court_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a court (soft delete)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        db_court = db.query(Court).filter(Court.id == court_id).first()
        if not db_court:
            raise HTTPException(status_code=404, detail="Court not found")
        
        # Soft delete - set is_active to False instead of hard delete
        db_court.is_active = False
        db.commit()
        return {"message": "Court deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting court: {str(e)}")
