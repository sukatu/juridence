from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from decimal import Decimal
import json

# Director schema
class Director(BaseModel):
    name: str
    address: str
    nationality: str
    occupation: str
    email: str
    contact: str
    tax_identification_number: str
    other_directorship: Optional[List[str]] = None

# Secretary schema
class Secretary(BaseModel):
    name: str
    address: str
    nationality: str
    occupation: str
    email: str
    contact: str
    tax_identification_number: str

# Auditor schema
class Auditor(BaseModel):
    name: str
    address: str
    nationality: str
    occupation: str
    email: str
    contact: str
    tax_identification_number: str

# Shareholder schema
class Shareholder(BaseModel):
    name: str
    address: str
    nationality: str
    occupation: Optional[str] = None
    email: str
    contact: str
    tax_identification_number: str
    shares_alloted: int
    consideration_payable: str  # Cash/Other than Cash

class CompaniesBase(BaseModel):
    name: str = Field(..., max_length=255)
    short_name: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field("Ghana", max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    
    # Comprehensive Company Profile Fields
    type_of_company: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    date_of_incorporation: Optional[date] = None
    date_of_commencement: Optional[date] = None
    nature_of_business: Optional[str] = None
    registration_number: Optional[str] = Field(None, max_length=100)
    tax_identification_number: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    
    # Directors, Secretary, Auditor
    directors: Optional[List[Director]] = None
    secretary: Optional[Secretary] = None
    auditor: Optional[Auditor] = None
    
    # Capital Details
    authorized_shares: Optional[int] = Field(None, ge=0)
    stated_capital: Optional[Decimal] = Field(None, ge=0)
    
    # Shareholders and Linked Companies
    shareholders: Optional[List[Shareholder]] = None
    other_linked_companies: Optional[List[str]] = None
    
    # Legacy fields (keeping for backward compatibility)
    tin_number: Optional[str] = Field(None, max_length=50)
    established_date: Optional[datetime] = None
    company_type: Optional[str] = Field(None, max_length=50)
    industry: Optional[str] = Field(None, max_length=100)
    ownership_type: Optional[str] = Field(None, max_length=50)
    business_activities: Optional[List[str]] = None
    previous_names: Optional[List[str]] = None
    board_of_directors: Optional[List[Dict[str, Any]]] = None
    key_personnel: Optional[List[Dict[str, Any]]] = None
    subsidiaries: Optional[List[str]] = None
    annual_revenue: Optional[float] = Field(None, ge=0)
    net_worth: Optional[float] = Field(None, ge=0)
    employee_count: Optional[int] = Field(0, ge=0)
    rating: Optional[str] = Field(None, max_length=10)
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = Field(None, max_length=50)
    customer_service_email: Optional[str] = Field(None, max_length=255)
    has_website: Optional[bool] = False
    has_social_media: Optional[bool] = False
    has_mobile_app: Optional[bool] = False
    description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('business_activities', 'previous_names', 'subsidiaries', 'other_linked_companies', mode='before')
    @classmethod
    def parse_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return v.split(', ') if v else []
        return v

    @field_validator('board_of_directors', 'key_personnel', 'directors', 'shareholders', mode='before')
    @classmethod
    def parse_complex_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v

    @field_validator('secretary', 'auditor', mode='before')
    @classmethod
    def parse_object_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

class CompaniesCreate(CompaniesBase):
    pass

class CompaniesUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    short_name: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    registration_number: Optional[str] = Field(None, max_length=100)
    tin_number: Optional[str] = Field(None, max_length=50)
    established_date: Optional[datetime] = None
    company_type: Optional[str] = Field(None, max_length=50)
    industry: Optional[str] = Field(None, max_length=100)
    ownership_type: Optional[str] = Field(None, max_length=50)
    business_activities: Optional[List[str]] = None
    previous_names: Optional[List[str]] = None
    board_of_directors: Optional[List[Dict[str, Any]]] = None
    key_personnel: Optional[List[Dict[str, Any]]] = None
    subsidiaries: Optional[List[str]] = None
    annual_revenue: Optional[float] = Field(None, ge=0)
    net_worth: Optional[float] = Field(None, ge=0)
    employee_count: Optional[int] = Field(None, ge=0)
    rating: Optional[str] = Field(None, max_length=10)
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = Field(None, max_length=50)
    customer_service_email: Optional[str] = Field(None, max_length=255)
    has_website: Optional[bool] = None
    has_social_media: Optional[bool] = None
    has_mobile_app: Optional[bool] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class CompaniesResponse(CompaniesBase):
    id: int
    is_active: bool
    is_verified: bool
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    search_count: int
    last_searched: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    status: str
    # Analytics fields
    total_cases: Optional[int] = 0
    risk_score: Optional[int] = 0
    risk_level: Optional[str] = 'Low'
    success_rate: Optional[float] = 0.0
    analytics_available: Optional[bool] = False
    case_statistics_available: Optional[bool] = False

    class Config:
        from_attributes = True

class CompaniesSearchRequest(BaseModel):
    query: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    company_type: Optional[str] = None
    industry: Optional[str] = None
    is_active: Optional[bool] = True
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)

class CompaniesSearchResponse(BaseModel):
    results: List[CompaniesResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class CompaniesStats(BaseModel):
    total_companies: int
    active_companies: int
    verified_companies: int
    companies_by_region: Dict[str, int]
    companies_by_type: Dict[str, int]
    companies_by_industry: Dict[str, int]
