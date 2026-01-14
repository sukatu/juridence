from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class GazetteType(str, Enum):
    # Legal Notices
    CHANGE_OF_NAME = "CHANGE_OF_NAME"
    CHANGE_OF_DATE_OF_BIRTH = "CHANGE_OF_DATE_OF_BIRTH"
    CHANGE_OF_PLACE_OF_BIRTH = "CHANGE_OF_PLACE_OF_BIRTH"
    APPOINTMENT_OF_MARRIAGE_OFFICERS = "APPOINTMENT_OF_MARRIAGE_OFFICERS"
    
    # General Categories
    LEGAL_NOTICE = "LEGAL_NOTICE"
    BUSINESS_NOTICE = "BUSINESS_NOTICE"
    PROPERTY_NOTICE = "PROPERTY_NOTICE"
    PERSONAL_NOTICE = "PERSONAL_NOTICE"
    REGULATORY_NOTICE = "REGULATORY_NOTICE"
    COURT_NOTICE = "COURT_NOTICE"
    BANKRUPTCY_NOTICE = "BANKRUPTCY_NOTICE"
    PROBATE_NOTICE = "PROBATE_NOTICE"
    OTHER = "OTHER"

class GazetteStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"
    CANCELLED = "CANCELLED"

class GazettePriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

# Base Gazette Schema
class GazetteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    content: str = Field(..., min_length=1)
    summary: Optional[str] = None
    gazette_type: GazetteType
    priority: GazettePriority = GazettePriority.MEDIUM
    publication_date: datetime
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    source: Optional[str] = Field(None, max_length=200)
    reference_number: Optional[str] = Field(None, max_length=100)
    gazette_number: Optional[str] = Field(None, max_length=50)
    page_number: Optional[int] = None
    jurisdiction: Optional[str] = Field(None, max_length=100)
    court_location: Optional[str] = Field(None, max_length=200)
    person_id: Optional[int] = None
    company_id: Optional[int] = None
    bank_id: Optional[int] = None
    insurance_id: Optional[int] = None
    keywords: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    gazette_metadata: Optional[Dict[str, Any]] = None
    
    # Legal Notice Specific Fields
    # Change of Name Fields
    item_number: Optional[str] = Field(None, max_length=50)
    old_name: Optional[str] = Field(None, max_length=500)
    alias_names: Optional[List[str]] = None
    new_name: Optional[str] = Field(None, max_length=500)
    current_name: Optional[str] = Field(None, max_length=500)  # Current/New name field from model
    name_value: Optional[str] = Field(None, max_length=500)  # Specific name for this row variant
    name_role: Optional[str] = Field(None, max_length=20)  # 'master', 'old', 'alias', 'other'
    name_set_id: Optional[str] = Field(None, max_length=200)  # Links master and variant rows
    profession: Optional[str] = Field(None, max_length=200)
    effective_date_of_change: Optional[datetime] = None
    remarks: Optional[str] = None
    
    # Change of Date of Birth Fields
    old_date_of_birth: Optional[datetime] = None
    new_date_of_birth: Optional[datetime] = None
    place_of_birth: Optional[str] = Field(None, max_length=200)
    
    # Change of Place of Birth Fields
    old_place_of_birth: Optional[str] = Field(None, max_length=200)
    new_place_of_birth: Optional[str] = Field(None, max_length=200)
    
    # Marriage Officer Fields
    officer_name: Optional[str] = Field(None, max_length=200)
    officer_title: Optional[str] = Field(None, max_length=100)
    appointment_authority: Optional[str] = Field(None, max_length=200)
    jurisdiction_area: Optional[str] = Field(None, max_length=200)
    
    # Enhanced Source Information
    gazette_date: Optional[datetime] = None
    gazette_page: Optional[int] = None
    source_item_number: Optional[str] = Field(None, max_length=50)
    
    document_url: Optional[str] = Field(None, max_length=500)
    document_filename: Optional[str] = Field(None, max_length=255)
    document_size: Optional[int] = None
    is_public: bool = True
    is_featured: bool = False

# Create Gazette Schema
class GazetteCreate(GazetteBase):
    pass

# Update Gazette Schema
class GazetteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = None
    gazette_type: Optional[GazetteType] = None
    status: Optional[GazetteStatus] = None
    priority: Optional[GazettePriority] = None
    publication_date: Optional[datetime] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    source: Optional[str] = Field(None, max_length=200)
    reference_number: Optional[str] = Field(None, max_length=100)
    gazette_number: Optional[str] = Field(None, max_length=50)
    page_number: Optional[int] = None
    jurisdiction: Optional[str] = Field(None, max_length=100)
    court_location: Optional[str] = Field(None, max_length=200)
    person_id: Optional[int] = None
    company_id: Optional[int] = None
    bank_id: Optional[int] = None
    insurance_id: Optional[int] = None
    keywords: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    gazette_metadata: Optional[Dict[str, Any]] = None
    document_url: Optional[str] = Field(None, max_length=500)
    document_filename: Optional[str] = Field(None, max_length=255)
    document_size: Optional[int] = None
    is_public: Optional[bool] = None
    is_featured: Optional[bool] = None

# Gazette Response Schema
class GazetteResponse(GazetteBase):
    id: int
    status: GazetteStatus
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Gazette List Response Schema
class GazetteListResponse(BaseModel):
    gazettes: List[GazetteResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Gazette Search Schema
class GazetteSearch(BaseModel):
    query: Optional[str] = None
    gazette_type: Optional[GazetteType] = None
    status: Optional[GazetteStatus] = None
    priority: Optional[GazettePriority] = None
    person_id: Optional[int] = None
    company_id: Optional[int] = None
    bank_id: Optional[int] = None
    insurance_id: Optional[int] = None
    jurisdiction: Optional[str] = None
    source: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    is_public: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    page: int = 1
    limit: int = 20

# Gazette Statistics Schema
class GazetteStats(BaseModel):
    total_gazettes: int
    published_gazettes: int
    draft_gazettes: int
    archived_gazettes: int
    gazettes_by_type: Dict[str, int]
    gazettes_by_priority: Dict[str, int]
    gazettes_by_jurisdiction: Dict[str, int]
    recent_gazettes: int
    featured_gazettes: int

# Gazette View Schema
class GazetteViewCreate(BaseModel):
    gazette_id: int
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class GazetteViewResponse(BaseModel):
    id: int
    gazette_id: int
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    viewed_at: datetime
    
    class Config:
        from_attributes = True

# Gazette Analytics Schema
class GazetteAnalytics(BaseModel):
    total_views: int
    unique_views: int
    views_by_date: Dict[str, int]
    popular_gazettes: List[Dict[str, Any]]
    views_by_type: Dict[str, int]
    views_by_jurisdiction: Dict[str, int]
