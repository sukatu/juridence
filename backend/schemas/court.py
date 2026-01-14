from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class CourtType(str, Enum):
    HIGH_COURT = "High Court"
    CIRCUIT_COURT = "Circuit Court"
    DISTRICT_COURT = "District Court"
    SUPREME_COURT = "Supreme Court"
    APPEAL_COURT = "Appeal Court"
    MAGISTRATE_COURT = "Magistrate Court"
    FAMILY_COURT = "Family Court"
    COMMERCIAL_COURT = "Commercial Court"
    LAND_COURT = "Land Court"
    LABOUR_COURT = "Labour Court"
    TRIBUNAL = "Tribunal"
    UNKNOWN = "Unknown"

class CourtStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    UNDER_RENOVATION = "UNDER_RENOVATION"
    TEMPORARILY_CLOSED = "TEMPORARILY_CLOSED"

class CourtBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the court")
    registry_name: Optional[str] = Field(None, max_length=255, description="Name of the court registry")
    court_type: CourtType = Field(..., description="Type of court")
    region: str = Field(..., min_length=1, max_length=100, description="Region where court is located")
    location: str = Field(..., min_length=1, max_length=255, description="Specific location of the court")
    address: Optional[str] = Field(None, description="Full address of the court")
    city: Optional[str] = Field(None, max_length=100, description="City where court is located")
    district: Optional[str] = Field(None, max_length=100, description="District where court is located")
    
    # Google Maps integration
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")
    google_place_id: Optional[str] = Field(None, max_length=255, description="Google Place ID")
    
    # Court details
    area_coverage: Optional[str] = Field(None, description="Area coverage of jurisdiction")
    contact_phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    contact_email: Optional[str] = Field(None, max_length=255, description="Contact email")
    website: Optional[str] = Field(None, max_length=255, description="Court website")
    
    # Media
    court_picture_url: Optional[str] = Field(None, max_length=500, description="URL of court picture")
    additional_images: Optional[List[str]] = Field(None, description="Additional image URLs")
    
    # Operational details
    operating_hours: Optional[Dict[str, Any]] = Field(None, description="Operating hours in JSON format")
    is_active: bool = Field(True, description="Whether the court is active")
    is_verified: bool = Field(False, description="Whether the court information is verified")
    
    # Additional fields
    notes: Optional[str] = Field(None, description="Additional notes about the court")
    status: CourtStatus = Field(CourtStatus.ACTIVE, description="Court status")

class CourtCreate(CourtBase):
    pass

class CourtUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    registry_name: Optional[str] = Field(None, max_length=255)
    court_type: Optional[CourtType] = None
    region: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    google_place_id: Optional[str] = Field(None, max_length=255)
    
    area_coverage: Optional[str] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    contact_email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    
    court_picture_url: Optional[str] = Field(None, max_length=500)
    additional_images: Optional[List[str]] = None
    
    operating_hours: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    
    notes: Optional[str] = None
    status: Optional[CourtStatus] = None

class CourtResponse(CourtBase):
    id: int
    search_count: int
    last_searched: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int]
    updated_by: Optional[int]
    
    class Config:
        from_attributes = True

class CourtListResponse(BaseModel):
    courts: List[CourtResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class CourtSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    court_type: Optional[CourtType] = Field(None, description="Filter by court type")
    region: Optional[str] = Field(None, description="Filter by region")
    city: Optional[str] = Field(None, description="Filter by city")
    district: Optional[str] = Field(None, description="Filter by district")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude for proximity search")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude for proximity search")
    radius_km: Optional[float] = Field(None, gt=0, le=1000, description="Search radius in kilometers")
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Number of results per page")

class CourtMapResponse(BaseModel):
    id: int
    name: str
    registry_name: Optional[str]
    court_type: str
    region: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]
    contact_phone: Optional[str]
    is_active: bool
    distance_km: Optional[float] = None  # For proximity searches

class CourtMapListResponse(BaseModel):
    courts: List[CourtMapResponse]
    total: int
    bounds: Optional[Dict[str, float]] = None  # Map bounds for all results
