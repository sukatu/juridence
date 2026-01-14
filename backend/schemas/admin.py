from pydantic import BaseModel, EmailStr
from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    admin = "admin"
    user = "user"
    moderator = "moderator"

class UserStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"

class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"
    cancelled = "cancelled"

class SubscriptionStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    cancelled = "cancelled"
    expired = "expired"
    pending = "pending"

# Base Models
class BaseResponse(BaseModel):
    class Config:
        from_attributes = True

# Dashboard Statistics
class AdminStatsResponse(BaseResponse):
    total_users: int
    total_cases: int
    total_people: int
    total_banks: int
    total_insurance: int
    total_companies: int
    total_payments: int
    active_subscriptions: int
    recent_users: int
    recent_cases: int
    last_updated: datetime

# User Management
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.user
    status: UserStatus = UserStatus.active
    is_admin: bool = False

class UserCreateRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    phone_number: Optional[str] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    is_admin: Optional[bool] = None
    user_type: Optional[str] = None  # administrator, court_registrar, corporate_client
    court_type: Optional[str] = None  # Court type for court registrar
    entity_type: Optional[str] = None  # For corporate_client: 'company', 'bank', or 'insurance'
    entity_id: Optional[int] = None  # ID of the selected company, bank, or insurance
    language: Optional[str] = "en"
    timezone: Optional[str] = "UTC"
    email_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = False

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    is_admin: Optional[bool] = None
    user_type: Optional[str] = None
    court_type: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None

class UserResponse(BaseResponse):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    role: str
    status: str
    is_admin: bool
    user_type: Optional[str] = None
    court_type: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

class UserDetailResponse(UserResponse):
    subscription: Optional[dict] = None
    notifications_count: int = 0
    api_keys_count: int = 0

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# API Key Management
class ApiKeyBase(BaseModel):
    user_id: int
    name: str
    expires_in_days: Optional[int] = None

class ApiKeyCreateRequest(ApiKeyBase):
    pass

class ApiKeyResponse(BaseResponse):
    id: int
    user_id: int
    name: str
    key_prefix: str
    full_key: Optional[str] = None  # Only returned on creation
    is_active: bool
    created_at: datetime
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None

# Case Management
class CaseResponse(BaseResponse):
    id: int
    title: str
    suit_reference_number: Optional[str] = None
    date: Optional[str] = None  # Changed to string to handle various date formats
    presiding_judge: Optional[str] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    court_type: Optional[str] = None
    court_division: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class CaseDetailResponse(CaseResponse):
    statutes_cited: Optional[str] = None
    cases_cited: Optional[str] = None
    lawyers: Optional[str] = None
    commentary: Optional[str] = None
    headnotes: Optional[str] = None
    town: Optional[str] = None
    region: Optional[str] = None
    dl_citation_no: Optional[str] = None
    file_url: Optional[str] = None
    judgement: Optional[str] = None
    year: Optional[int] = None
    type: Optional[str] = None
    firebase_url: Optional[str] = None
    summernote: Optional[str] = None
    detail_content: Optional[str] = None
    decision: Optional[str] = None
    citation: Optional[str] = None
    file_name: Optional[str] = None
    c_t: Optional[str] = None
    judgement_by: Optional[str] = None
    case_summary: Optional[str] = None
    area_of_law: Optional[str] = None
    keywords_phrases: Optional[str] = None
    published: Optional[bool] = None
    dl_type: Optional[str] = None
    academic_programme_id: Optional[int] = None
    opinion_by: Optional[str] = None
    conclusion: Optional[str] = None
    ai_case_outcome: Optional[str] = None
    ai_court_orders: Optional[str] = None
    ai_financial_impact: Optional[str] = None
    ai_detailed_outcome: Optional[str] = None
    ai_summary_generated_at: Optional[str] = None  # Changed to string
    ai_summary_version: Optional[str] = None

class CaseCreateRequest(BaseModel):
    title: str
    suit_reference_number: Optional[str] = None
    date: Optional[datetime] = None
    presiding_judge: Optional[str] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    court_type: Optional[str] = None
    court_division: Optional[str] = None
    status: Optional[str] = None
    statutes_cited: Optional[str] = None
    cases_cited: Optional[str] = None
    lawyers: Optional[str] = None
    commentary: Optional[str] = None
    headnotes: Optional[str] = None
    town: Optional[str] = None
    region: Optional[str] = None
    dl_citation_no: Optional[str] = None
    file_url: Optional[str] = None
    judgement: Optional[str] = None
    year: Optional[int] = None
    type: Optional[str] = None
    firebase_url: Optional[str] = None
    summernote: Optional[str] = None
    detail_content: Optional[str] = None
    decision: Optional[str] = None
    citation: Optional[str] = None
    file_name: Optional[str] = None
    c_t: Optional[str] = None
    judgement_by: Optional[str] = None
    case_summary: Optional[str] = None
    area_of_law: Optional[str] = None
    keywords_phrases: Optional[str] = None
    published: Optional[bool] = None
    dl_type: Optional[str] = None
    academic_programme_id: Optional[int] = None
    opinion_by: Optional[str] = None
    conclusion: Optional[str] = None

class CaseUpdateRequest(BaseModel):
    title: Optional[str] = None
    suit_reference_number: Optional[str] = None
    date: Optional[datetime] = None
    presiding_judge: Optional[str] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    court_type: Optional[str] = None
    court_division: Optional[str] = None
    status: Optional[str] = None
    statutes_cited: Optional[str] = None
    cases_cited: Optional[str] = None
    lawyers: Optional[str] = None
    commentary: Optional[str] = None
    headnotes: Optional[str] = None
    town: Optional[str] = None
    region: Optional[str] = None
    dl_citation_no: Optional[str] = None
    file_url: Optional[str] = None
    judgement: Optional[str] = None
    year: Optional[int] = None
    type: Optional[str] = None
    firebase_url: Optional[str] = None
    summernote: Optional[str] = None
    detail_content: Optional[str] = None
    decision: Optional[str] = None
    citation: Optional[str] = None
    file_name: Optional[str] = None
    c_t: Optional[str] = None
    judgement_by: Optional[str] = None
    case_summary: Optional[str] = None
    area_of_law: Optional[str] = None
    keywords_phrases: Optional[str] = None
    published: Optional[bool] = None
    dl_type: Optional[str] = None
    academic_programme_id: Optional[int] = None
    opinion_by: Optional[str] = None
    conclusion: Optional[str] = None

class CaseListResponse(BaseModel):
    cases: List[CaseResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# People Management
class PeopleResponse(BaseResponse):
    id: int
    first_name: str
    last_name: str
    full_name: str
    previous_names: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    date_of_death: Optional[datetime] = None
    id_number: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    case_count: Optional[int] = None
    case_types: Optional[str] = None
    court_records: Optional[str] = None
    occupation: Optional[str] = None
    employer: Optional[str] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    marital_status: Optional[str] = None
    spouse_name: Optional[str] = None
    children_count: Optional[int] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    nationality: Optional[str] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    languages: Optional[str] = None
    is_verified: Optional[bool] = None
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    last_searched: Optional[datetime] = None
    search_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class PeopleListResponse(BaseModel):
    people: List[PeopleResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Bank Management
class BankResponse(BaseResponse):
    id: int
    name: str
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    bank_code: Optional[str] = None
    swift_code: Optional[str] = None
    license_number: Optional[str] = None
    established_date: Optional[datetime] = None
    bank_type: Optional[str] = None
    ownership_type: Optional[str] = None
    services: Optional[str] = None
    previous_names: Optional[str] = None
    branches_count: Optional[int] = None
    atm_count: Optional[int] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    has_mobile_app: Optional[bool] = None
    has_online_banking: Optional[bool] = None
    has_atm_services: Optional[bool] = None
    has_foreign_exchange: Optional[bool] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    search_count: Optional[int] = None
    last_searched: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class BankListResponse(BaseModel):
    banks: List[BankResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Insurance Management
class InsuranceResponse(BaseResponse):
    id: int
    name: str
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    license_number: Optional[str] = None
    established_date: Optional[datetime] = None
    insurance_type: Optional[str] = None
    ownership_type: Optional[str] = None
    services: Optional[str] = None
    previous_names: Optional[str] = None
    branches_count: Optional[int] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    has_mobile_app: Optional[bool] = None
    has_online_portal: Optional[bool] = None
    has_claims_processing: Optional[bool] = None
    has_underwriting: Optional[bool] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    search_count: Optional[int] = None
    last_searched: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class InsuranceListResponse(BaseModel):
    insurance: List[InsuranceResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Company Management
class CompanyResponse(BaseResponse):
    id: int
    name: str
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    registration_number: Optional[str] = None
    tax_identification_number: Optional[str] = None
    established_date: Optional[datetime] = None
    company_type: Optional[str] = None
    ownership_type: Optional[str] = None
    business_activities: Optional[str] = None
    directors: Optional[str] = None
    secretary: Optional[str] = None
    auditor: Optional[str] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    search_count: Optional[int] = None
    last_searched: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class CompanyListResponse(BaseModel):
    companies: List[CompanyResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Payment Management
class PaymentResponse(BaseResponse):
    id: int
    user_id: int
    subscription_id: Optional[int] = None
    amount: float
    currency: str
    status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    gateway_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class PaymentListResponse(BaseModel):
    payments: List[PaymentResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Subscription Management
class SubscriptionResponse(BaseResponse):
    id: int
    user_id: int
    plan: str
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    auto_renew: bool
    created_at: datetime
    updated_at: datetime

class SubscriptionListResponse(BaseModel):
    subscriptions: List[SubscriptionResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Bank Management CRUD Schemas
class BankCreateRequest(BaseModel):
    name: str
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    bank_code: Optional[str] = None
    swift_code: Optional[str] = None
    license_number: Optional[str] = None
    established_date: Optional[datetime] = None
    bank_type: Optional[str] = None
    ownership_type: Optional[str] = None
    services: Optional[str] = None  # Comma-separated string
    previous_names: Optional[str] = None  # Comma-separated string
    branches_count: Optional[int] = None
    atm_count: Optional[int] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    has_mobile_app: Optional[bool] = None
    has_online_banking: Optional[bool] = None
    has_atm_services: Optional[bool] = None
    has_foreign_exchange: Optional[bool] = None
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    verification_notes: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class BankUpdateRequest(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    bank_code: Optional[str] = None
    swift_code: Optional[str] = None
    license_number: Optional[str] = None
    established_date: Optional[datetime] = None
    bank_type: Optional[str] = None
    ownership_type: Optional[str] = None
    services: Optional[str] = None  # Comma-separated string
    previous_names: Optional[str] = None  # Comma-separated string
    branches_count: Optional[int] = None
    atm_count: Optional[int] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    has_mobile_app: Optional[bool] = None
    has_online_banking: Optional[bool] = None
    has_atm_services: Optional[bool] = None
    has_foreign_exchange: Optional[bool] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_notes: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    directors: Optional[str] = None  # JSON string for directors array
    board_of_directors: Optional[str] = None  # JSON string for board_of_directors array
    secretary: Optional[str] = None  # JSON string for secretary object
    key_personnel: Optional[str] = None  # JSON string for key_personnel array

# Insurance Management CRUD Schemas
class InsuranceCreateRequest(BaseModel):
    name: str
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    license_number: Optional[str] = None
    registration_number: Optional[str] = None
    established_date: Optional[datetime] = None
    insurance_type: Optional[str] = None
    ownership_type: Optional[str] = None
    services: Optional[str] = None  # Comma-separated string
    previous_names: Optional[str] = None  # Comma-separated string
    coverage_areas: Optional[str] = None  # Comma-separated string
    branches_count: Optional[int] = None
    agents_count: Optional[int] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    premium_income: Optional[float] = None
    claims_paid: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    claims_phone: Optional[str] = None
    claims_email: Optional[str] = None
    has_mobile_app: Optional[bool] = None
    has_online_portal: Optional[bool] = None
    has_online_claims: Optional[bool] = None
    has_24_7_support: Optional[bool] = None
    specializes_in: Optional[str] = None  # Comma-separated string
    target_market: Optional[str] = None
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    verification_notes: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class InsuranceUpdateRequest(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    license_number: Optional[str] = None
    registration_number: Optional[str] = None
    established_date: Optional[datetime] = None
    insurance_type: Optional[str] = None
    ownership_type: Optional[str] = None
    services: Optional[str] = None  # Comma-separated string
    previous_names: Optional[str] = None  # Comma-separated string
    coverage_areas: Optional[str] = None  # Comma-separated string
    branches_count: Optional[int] = None
    agents_count: Optional[int] = None
    total_assets: Optional[float] = None
    net_worth: Optional[float] = None
    premium_income: Optional[float] = None
    claims_paid: Optional[float] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    claims_phone: Optional[str] = None
    claims_email: Optional[str] = None
    has_mobile_app: Optional[bool] = None
    has_online_portal: Optional[bool] = None
    has_online_claims: Optional[bool] = None
    has_24_7_support: Optional[bool] = None
    specializes_in: Optional[str] = None  # Comma-separated string
    target_market: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_notes: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

# Company Management CRUD Schemas
class CompanyCreateRequest(BaseModel):
    name: str
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    type_of_company: Optional[str] = None
    district: Optional[str] = None
    date_of_incorporation: Optional[datetime] = None
    date_of_commencement: Optional[datetime] = None
    nature_of_business: Optional[str] = None
    registration_number: Optional[str] = None
    tax_identification_number: Optional[str] = None
    phone_number: Optional[str] = None
    directors: Optional[Union[str, List[Dict[str, Any]]]] = None  # Comma-separated string or JSON array
    secretary: Optional[Union[str, Dict[str, Any]]] = None  # Single name or JSON object
    auditor: Optional[Union[str, Dict[str, Any]]] = None  # Single name or JSON object
    authorized_shares: Optional[int] = None
    stated_capital: Optional[float] = None
    shareholders: Optional[Union[str, List[Dict[str, Any]]]] = None  # Comma-separated string or JSON array
    other_linked_companies: Optional[Union[str, List[Dict[str, Any]]]] = None  # Comma-separated string or JSON array
    tin_number: Optional[str] = None
    established_date: Optional[datetime] = None
    company_type: Optional[str] = None
    industry: Optional[str] = None
    ownership_type: Optional[str] = None
    business_activities: Optional[str] = None  # Comma-separated string
    previous_names: Optional[str] = None
    board_of_directors: Optional[Union[str, List[Dict[str, Any]]]] = None  # Comma-separated string or JSON array
    key_personnel: Optional[Union[str, List[Dict[str, Any]]]] = None  # Comma-separated string or JSON array
    subsidiaries: Optional[Union[str, List[str]]] = None  # Comma-separated string or JSON array
    annual_revenue: Optional[float] = None
    annual_turnover: Optional[float] = None
    net_worth: Optional[float] = None
    total_assets: Optional[float] = None
    authorized_capital: Optional[float] = None
    financial_year_end: Optional[datetime] = None
    employee_count: Optional[int] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    has_website: Optional[bool] = None
    has_social_media: Optional[bool] = None
    has_mobile_app: Optional[bool] = None
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    verification_notes: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    type_of_company: Optional[str] = None
    district: Optional[str] = None
    date_of_incorporation: Optional[datetime] = None
    date_of_commencement: Optional[datetime] = None
    nature_of_business: Optional[str] = None
    registration_number: Optional[str] = None
    tax_identification_number: Optional[str] = None
    phone_number: Optional[str] = None
    directors: Optional[str] = None  # Comma-separated string
    secretary: Optional[str] = None  # Single name
    auditor: Optional[str] = None  # Single name
    authorized_shares: Optional[int] = None
    stated_capital: Optional[float] = None
    shareholders: Optional[str] = None
    other_linked_companies: Optional[str] = None
    tin_number: Optional[str] = None
    established_date: Optional[datetime] = None
    company_type: Optional[str] = None
    industry: Optional[str] = None
    ownership_type: Optional[str] = None
    business_activities: Optional[str] = None  # Comma-separated string
    previous_names: Optional[str] = None
    board_of_directors: Optional[str] = None
    key_personnel: Optional[str] = None
    subsidiaries: Optional[str] = None
    annual_revenue: Optional[float] = None
    annual_turnover: Optional[float] = None
    net_worth: Optional[float] = None
    total_assets: Optional[float] = None
    authorized_capital: Optional[float] = None
    financial_year_end: Optional[datetime] = None
    employee_count: Optional[int] = None
    rating: Optional[float] = None
    head_office_address: Optional[str] = None
    customer_service_phone: Optional[str] = None
    customer_service_email: Optional[str] = None
    has_website: Optional[bool] = None
    has_social_media: Optional[bool] = None
    has_mobile_app: Optional[bool] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_notes: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

# Payment Management CRUD Schemas
class PaymentResponse(BaseModel):
    id: int
    subscription_id: int
    user_id: int
    amount: float
    currency: str
    status: str
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    payment_method: Optional[str] = None
    last_four: Optional[str] = None
    billing_period_start: datetime
    billing_period_end: datetime
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentCreateRequest(BaseModel):
    subscription_id: int
    user_id: int
    amount: float
    currency: str = "USD"
    status: str = "pending"
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    payment_method: Optional[str] = None
    last_four: Optional[str] = None
    billing_period_start: datetime
    billing_period_end: datetime
    paid_at: Optional[datetime] = None

class PaymentUpdateRequest(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    payment_method: Optional[str] = None
    last_four: Optional[str] = None
    billing_period_start: Optional[datetime] = None
    billing_period_end: Optional[datetime] = None
    paid_at: Optional[datetime] = None

class PaymentListResponse(BaseModel):
    payments: List[PaymentResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Settings Management CRUD Schemas
class SettingsResponse(BaseModel):
    id: int
    key: str
    category: str
    value: Optional[str] = None
    value_type: str
    description: Optional[str] = None
    is_public: bool
    is_editable: bool
    is_required: bool
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class SettingsCreateRequest(BaseModel):
    key: str
    category: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    is_public: bool = False
    is_editable: bool = True
    is_required: bool = False
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_editable: Optional[bool] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[dict] = None
    default_value: Optional[str] = None

class SettingsListResponse(BaseModel):
    settings: List[SettingsResponse]
    total: int
    page: int
    limit: int
    total_pages: int
