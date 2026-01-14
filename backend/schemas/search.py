from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from .people import PeopleResponse
from .banks import BanksResponse
from .insurance import InsuranceResponse

class UnifiedSearchRequest(BaseModel):
    query: Optional[str] = Field(None, max_length=255, description="General search query")
    search_type: Optional[str] = Field("all", pattern="^(all|people|banks|insurance)$", description="Type of search")
    
    # People specific filters
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    id_number: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    risk_level: Optional[str] = Field(None, pattern="^(Low|Medium|High|Critical)$")
    min_case_count: Optional[int] = Field(None, ge=0)
    max_case_count: Optional[int] = Field(None, ge=0)
    date_of_birth_from: Optional[datetime] = None
    date_of_birth_to: Optional[datetime] = None
    
    # Banks specific filters
    bank_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    has_mobile_app: Optional[bool] = None
    has_online_banking: Optional[bool] = None
    has_atm_services: Optional[bool] = None
    has_foreign_exchange: Optional[bool] = None
    bank_rating: Optional[str] = Field(None, max_length=10)
    min_assets: Optional[float] = Field(None, ge=0)
    max_assets: Optional[float] = Field(None, ge=0)
    
    # Insurance specific filters
    insurance_type: Optional[str] = Field(None, max_length=50)
    insurance_ownership_type: Optional[str] = Field(None, max_length=50)
    has_online_portal: Optional[bool] = None
    has_online_claims: Optional[bool] = None
    has_24_7_support: Optional[bool] = None
    insurance_rating: Optional[str] = Field(None, max_length=10)
    target_market: Optional[str] = Field(None, max_length=100)
    
    # Common filters
    sort_by: Optional[str] = Field(default="name", max_length=50)
    sort_order: Optional[str] = Field(default="asc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class SearchResultItem(BaseModel):
    id: int
    name: str
    type: str  # "people", "banks", "insurance", "companies", "gazette"
    description: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    logo_url: Optional[str] = None
    person_id: Optional[int] = None  # For gazette entries linked to people
    additional_info: Optional[Dict[str, Any]] = None

class UnifiedSearchResponse(BaseModel):
    results: List[SearchResultItem]
    people: Optional[List[PeopleResponse]] = None
    banks: Optional[List[BanksResponse]] = None
    insurance: Optional[List[InsuranceResponse]] = None
    
    # Pagination
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool
    
    # Search metadata
    search_type: str
    query: Optional[str] = None
    search_time_ms: Optional[float] = None

class QuickSearchRequest(BaseModel):
    query: str = Field(..., max_length=255, min_length=2)
    limit: int = Field(default=10, ge=1, le=50)

class QuickSearchResponse(BaseModel):
    suggestions: List[SearchResultItem]
    total: int

class AdvancedSearchRequest(BaseModel):
    # General search
    query: Optional[str] = Field(None, max_length=255)
    
    # Entity types to search
    search_people: bool = Field(True)
    search_banks: bool = Field(True)
    search_insurance: bool = Field(True)
    
    # People filters
    people_filters: Optional[Dict[str, Any]] = None
    
    # Banks filters
    banks_filters: Optional[Dict[str, Any]] = None
    
    # Insurance filters
    insurance_filters: Optional[Dict[str, Any]] = None
    
    # Pagination
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    
    # Sorting
    sort_by: Optional[str] = Field(default="relevance", max_length=50)
    sort_order: Optional[str] = Field(default="desc", pattern="^(asc|desc)$")

class AdvancedSearchResponse(BaseModel):
    results: Dict[str, Any]  # Contains people, banks, insurance results
    total_results: int
    search_metadata: Dict[str, Any]
    pagination: Dict[str, Any]

class SearchStats(BaseModel):
    total_people: int
    total_banks: int
    total_insurance: int
    total_searches_today: int
    popular_searches: List[str]
    search_categories: Dict[str, int]
