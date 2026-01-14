from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import json

class BanksBase(BaseModel):
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
    bank_code: Optional[str] = Field(None, max_length=20)
    swift_code: Optional[str] = Field(None, max_length=20)
    license_number: Optional[str] = Field(None, max_length=100)
    established_date: Optional[datetime] = None
    bank_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    services: Optional[List[str]] = None
    previous_names: Optional[List[str]] = None
    branches_count: Optional[int] = Field(0, ge=0)
    atm_count: Optional[int] = Field(0, ge=0)
    total_assets: Optional[float] = Field(None, ge=0)
    net_worth: Optional[float] = Field(None, ge=0)
    rating: Optional[str] = Field(None, max_length=10)
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = Field(None, max_length=50)
    customer_service_email: Optional[str] = Field(None, max_length=255)
    has_mobile_app: Optional[bool] = False
    has_online_banking: Optional[bool] = False
    has_atm_services: Optional[bool] = True
    has_foreign_exchange: Optional[bool] = False
    description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('services', 'previous_names', mode='before')
    @classmethod
    def parse_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return v.split(', ') if v else []
        return v

class BanksCreate(BanksBase):
    pass

class BanksUpdate(BaseModel):
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
    bank_code: Optional[str] = Field(None, max_length=20)
    swift_code: Optional[str] = Field(None, max_length=20)
    license_number: Optional[str] = Field(None, max_length=100)
    established_date: Optional[datetime] = None
    bank_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    services: Optional[List[str]] = None
    branches_count: Optional[int] = Field(None, ge=0)
    atm_count: Optional[int] = Field(None, ge=0)
    total_assets: Optional[float] = Field(None, ge=0)
    net_worth: Optional[float] = Field(None, ge=0)
    rating: Optional[str] = Field(None, max_length=10)
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = Field(None, max_length=50)
    customer_service_email: Optional[str] = Field(None, max_length=255)
    has_mobile_app: Optional[bool] = None
    has_online_banking: Optional[bool] = None
    has_atm_services: Optional[bool] = None
    has_foreign_exchange: Optional[bool] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class BanksResponse(BanksBase):
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

    class Config:
        from_attributes = True

class BanksSearchRequest(BaseModel):
    query: Optional[str] = Field(None, max_length=255)
    name: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    bank_type: Optional[str] = Field(None, max_length=50)
    ownership_type: Optional[str] = Field(None, max_length=50)
    has_mobile_app: Optional[bool] = None
    has_online_banking: Optional[bool] = None
    has_atm_services: Optional[bool] = None
    has_foreign_exchange: Optional[bool] = None
    rating: Optional[str] = Field(None, max_length=10)
    min_assets: Optional[float] = Field(None, ge=0)
    max_assets: Optional[float] = Field(None, ge=0)
    sort_by: Optional[str] = Field(default="name", max_length=50)
    sort_order: Optional[str] = Field(default="asc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class BanksSearchResponse(BaseModel):
    banks: List[BanksResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class BanksStats(BaseModel):
    total_banks: int
    active_banks: int
    banks_by_type: Dict[str, int]
    banks_by_region: Dict[str, int]
    banks_with_mobile_app: int
    banks_with_online_banking: int
