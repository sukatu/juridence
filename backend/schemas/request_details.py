from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RequestType(str, Enum):
    CASE_DETAILS = "case_details"
    LEGAL_DOCUMENTS = "legal_documents"
    COURT_RECORDS = "court_records"
    FINANCIAL_INFORMATION = "financial_information"
    PROFILE_INFORMATION = "profile_information"
    CONTACT_DETAILS = "contact_details"
    MANAGEMENT_DETAILS = "management_details"
    LEGAL_HISTORY = "legal_history"
    OTHER = "other"

class EntityType(str, Enum):
    PERSON = "person"
    BANK = "bank"
    INSURANCE = "insurance"
    COMPANY = "company"
    CASE = "case"

class RequestStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Request submission schemas
class RequestDetailsBase(BaseModel):
    request_type: RequestType
    entity_type: EntityType
    entity_id: Optional[int] = None
    entity_name: Optional[str] = None
    case_id: Optional[int] = None
    case_suit_number: Optional[str] = None
    message: Optional[str] = None
    requester_name: Optional[str] = None
    requester_email: Optional[EmailStr] = None
    requester_phone: Optional[str] = None
    requester_organization: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    is_urgent: bool = False

class RequestDetailsCreate(RequestDetailsBase):
    pass

class RequestDetailsUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    assigned_to: Optional[str] = None
    admin_notes: Optional[str] = None
    response_message: Optional[str] = None
    priority: Optional[Priority] = None
    is_urgent: Optional[bool] = None

class RequestDetailsResponse(RequestDetailsBase):
    id: int
    status: RequestStatus
    assigned_to: Optional[str] = None
    admin_notes: Optional[str] = None
    response_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    source_ip: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None

    class Config:
        from_attributes = True

class RequestDetailsList(BaseModel):
    id: int
    request_type: RequestType
    entity_type: EntityType
    entity_name: Optional[str] = None
    case_suit_number: Optional[str] = None
    status: RequestStatus
    requester_name: Optional[str] = None
    requester_email: Optional[EmailStr] = None
    priority: Priority
    is_urgent: bool
    created_at: datetime
    assigned_to: Optional[str] = None

    class Config:
        from_attributes = True

# Statistics schema
class RequestStats(BaseModel):
    total_requests: int
    pending_requests: int
    in_progress_requests: int
    completed_requests: int
    rejected_requests: int
    urgent_requests: int
    requests_by_type: dict
    requests_by_entity: dict
    requests_by_status: dict

# Quick request schemas for frontend
class QuickCaseRequest(BaseModel):
    case_id: int
    case_suit_number: str
    request_type: RequestType = RequestType.CASE_DETAILS
    message: Optional[str] = None
    requester_name: Optional[str] = None
    requester_email: Optional[EmailStr] = None
    requester_phone: Optional[str] = None

class QuickProfileRequest(BaseModel):
    entity_type: EntityType
    entity_id: int
    entity_name: str
    request_type: RequestType = RequestType.PROFILE_INFORMATION
    message: Optional[str] = None
    requester_name: Optional[str] = None
    requester_email: Optional[EmailStr] = None
    requester_phone: Optional[str] = None
