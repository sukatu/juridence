from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# Tenant Schemas
class TenantBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    
    # Address
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    
    # Branding
    logo_url: Optional[str] = None
    primary_color: str = Field(default="#3B82F6", max_length=7)
    secondary_color: str = Field(default="#1E40AF", max_length=7)
    accent_color: str = Field(default="#F59E0B", max_length=7)
    font_family: str = Field(default="Inter", max_length=100)
    
    # App Customization
    app_name: str = Field(default="Legal Search Engine", max_length=100)
    app_tagline: str = Field(default="Advanced Legal Research Platform", max_length=255)
    favicon_url: Optional[str] = None
    
    # Contact Person
    contact_person_name: Optional[str] = None
    contact_person_email: Optional[str] = None
    contact_person_phone: Optional[str] = None

class TenantCreateRequest(TenantBase):
    subscription_plan_id: Optional[int] = None
    max_users: int = Field(default=5, ge=1)
    max_cases_per_month: int = Field(default=1000, ge=1)
    max_storage_gb: float = Field(default=1.0, ge=0.1)
    features_enabled: Optional[List[str]] = None

class TenantUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    
    # Address
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    
    # Branding
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    
    # App Customization
    app_name: Optional[str] = None
    app_tagline: Optional[str] = None
    favicon_url: Optional[str] = None
    
    # Contact Person
    contact_person_name: Optional[str] = None
    contact_person_email: Optional[str] = None
    contact_person_phone: Optional[str] = None
    
    # Limits
    max_users: Optional[int] = None
    max_cases_per_month: Optional[int] = None
    max_storage_gb: Optional[float] = None
    features_enabled: Optional[List[str]] = None
    
    # Status
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    is_verified: Optional[bool] = None

class TenantResponse(TenantBase):
    id: int
    subscription_plan_id: Optional[int] = None
    subscription_status: str
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    max_users: int
    max_cases_per_month: int
    max_storage_gb: float
    features_enabled: Optional[List[str]] = None
    is_active: bool
    is_approved: bool
    is_verified: bool
    admin_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class TenantListResponse(BaseModel):
    tenants: List[TenantResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Subscription Plan Schemas
class SubscriptionPlanBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    slug: str = Field(..., max_length=50)
    price_monthly: float = Field(..., ge=0)
    price_yearly: Optional[float] = Field(None, ge=0)
    currency: str = Field(default="USD", max_length=3)
    max_users: int = Field(..., ge=1)
    max_cases_per_month: int = Field(..., ge=1)
    max_storage_gb: float = Field(..., ge=0.1)
    features: Optional[List[str]] = None
    is_popular: bool = False
    sort_order: int = 0

class SubscriptionPlanCreateRequest(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_monthly: Optional[float] = None
    price_yearly: Optional[float] = None
    currency: Optional[str] = None
    max_users: Optional[int] = None
    max_cases_per_month: Optional[int] = None
    max_storage_gb: Optional[float] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_popular: Optional[bool] = None
    sort_order: Optional[int] = None

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubscriptionPlanListResponse(BaseModel):
    plans: List[SubscriptionPlanResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Subscription Request Schemas
class SubscriptionRequestBase(BaseModel):
    tenant_id: int
    plan_id: int
    billing_cycle: str = Field(..., pattern="^(monthly|yearly)$")
    notes: Optional[str] = None

class SubscriptionRequestCreateRequest(SubscriptionRequestBase):
    pass

class SubscriptionRequestUpdateRequest(BaseModel):
    plan_id: Optional[int] = None
    billing_cycle: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class SubscriptionRequestResponse(SubscriptionRequestBase):
    id: int
    requested_by: Optional[int] = None
    status: str
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Enriched fields
    tenant_name: Optional[str] = None
    plan_name: Optional[str] = None
    requester_name: Optional[str] = None
    requester_email: Optional[str] = None

    class Config:
        from_attributes = True

class SubscriptionRequestListResponse(BaseModel):
    requests: List[SubscriptionRequestResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Tenant Setting Schemas
class TenantSettingBase(BaseModel):
    key: str = Field(..., max_length=255)
    value: Optional[str] = None
    value_type: str = Field(default="string", max_length=50)
    description: Optional[str] = None
    is_public: bool = False

class TenantSettingCreateRequest(TenantSettingBase):
    pass

class TenantSettingUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class TenantSettingResponse(TenantSettingBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

# Multi-tenant Frontend Schemas
class TenantBrandingResponse(BaseModel):
    app_name: str
    app_tagline: str
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: str
    secondary_color: str
    accent_color: str
    font_family: str

class TenantLimitsResponse(BaseModel):
    max_users: int
    max_cases_per_month: int
    max_storage_gb: float
    features_enabled: List[str]
    subscription_status: str
    subscription_ends_at: Optional[datetime] = None

class TenantPublicInfoResponse(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    branding: TenantBrandingResponse
    limits: TenantLimitsResponse

# Validation
@validator('primary_color', 'secondary_color', 'accent_color')
def validate_hex_color(cls, v):
    if v and not v.startswith('#') or len(v) != 7:
        raise ValueError('Color must be a valid hex color (e.g., #FF0000)')
    return v

@validator('slug')
def validate_slug(cls, v):
    if not v.replace('-', '').replace('_', '').isalnum():
        raise ValueError('Slug must contain only alphanumeric characters, hyphens, and underscores')
    return v.lower()

@validator('billing_cycle')
def validate_billing_cycle(cls, v):
    if v not in ['monthly', 'yearly']:
        raise ValueError('Billing cycle must be either "monthly" or "yearly"')
    return v
