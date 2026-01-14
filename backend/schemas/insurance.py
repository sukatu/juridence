from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import json

class InsuranceBase(BaseModel):
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
    license_number: Optional[str] = Field(None, max_length=100)
    registration_number: Optional[str] = Field(None, max_length=100)
    established_date: Optional[datetime] = None
    insurance_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    services: Optional[List[str]] = None
    previous_names: Optional[List[str]] = None
    coverage_areas: Optional[List[str]] = None
    branches_count: Optional[int] = Field(0, ge=0)
    agents_count: Optional[int] = Field(0, ge=0)
    total_assets: Optional[float] = Field(None, ge=0)
    net_worth: Optional[float] = Field(None, ge=0)
    premium_income: Optional[float] = Field(None, ge=0)
    claims_paid: Optional[float] = Field(None, ge=0)
    rating: Optional[str] = Field(None, max_length=10)
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = Field(None, max_length=50)
    customer_service_email: Optional[str] = Field(None, max_length=255)
    claims_phone: Optional[str] = Field(None, max_length=50)
    claims_email: Optional[str] = Field(None, max_length=255)
    has_mobile_app: Optional[bool] = False
    has_online_portal: Optional[bool] = False
    has_online_claims: Optional[bool] = False
    has_24_7_support: Optional[bool] = False
    specializes_in: Optional[List[str]] = None
    target_market: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('services', 'coverage_areas', 'specializes_in', 'previous_names', mode='before')
    @classmethod
    def parse_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return v.split(', ') if v else []
        return v

class InsuranceCreate(InsuranceBase):
    pass

class InsuranceUpdate(BaseModel):
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
    license_number: Optional[str] = Field(None, max_length=100)
    registration_number: Optional[str] = Field(None, max_length=100)
    established_date: Optional[datetime] = None
    insurance_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    services: Optional[List[str]] = None
    coverage_areas: Optional[List[str]] = None
    branches_count: Optional[int] = Field(None, ge=0)
    agents_count: Optional[int] = Field(None, ge=0)
    total_assets: Optional[float] = Field(None, ge=0)
    net_worth: Optional[float] = Field(None, ge=0)
    premium_income: Optional[float] = Field(None, ge=0)
    claims_paid: Optional[float] = Field(None, ge=0)
    rating: Optional[str] = Field(None, max_length=10)
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = Field(None, max_length=50)
    customer_service_email: Optional[str] = Field(None, max_length=255)
    claims_phone: Optional[str] = Field(None, max_length=50)
    claims_email: Optional[str] = Field(None, max_length=255)
    has_mobile_app: Optional[bool] = None
    has_online_portal: Optional[bool] = None
    has_online_claims: Optional[bool] = None
    has_24_7_support: Optional[bool] = None
    specializes_in: Optional[List[str]] = None
    target_market: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    notes: Optional[str] = None

class InsuranceResponse(InsuranceBase):
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
    # Analytics data
    total_cases: Optional[int] = 0
    risk_score: Optional[int] = 0
    risk_level: Optional[str] = "Low"
    success_rate: Optional[float] = 0.0
    analytics_available: Optional[bool] = False
    case_statistics_available: Optional[bool] = False

    class Config:
        from_attributes = True

class InsuranceSearchRequest(BaseModel):
    query: Optional[str] = Field(None, max_length=255)
    name: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    insurance_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    has_mobile_app: Optional[bool] = None
    has_online_portal: Optional[bool] = None
    has_online_claims: Optional[bool] = None
    has_24_7_support: Optional[bool] = None
    rating: Optional[str] = Field(None, max_length=10)
    target_market: Optional[str] = Field(None, max_length=100)
    min_assets: Optional[float] = Field(None, ge=0)
    max_assets: Optional[float] = Field(None, ge=0)
    sort_by: Optional[str] = Field(default="name", max_length=50)
    sort_order: Optional[str] = Field(default="asc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class InsuranceSearchResponse(BaseModel):
    insurance: List[InsuranceResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class InsuranceStats(BaseModel):
    total_insurance: int
    active_insurance: int
    insurance_by_type: Dict[str, int]
    insurance_by_region: Dict[str, int]
    insurance_with_mobile_app: int
    insurance_with_online_portal: int
