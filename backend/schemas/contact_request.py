from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ContactRequestStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ContactRequestType(str, Enum):
    CONTACT_REQUEST = "contact_request"
    SUBSCRIPTION_INQUIRY = "subscription_inquiry"
    DEMO_REQUEST = "demo_request"
    SUPPORT_REQUEST = "support_request"

class ContactRequestBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    organization: str = Field(..., min_length=2, max_length=200)
    position: Optional[str] = Field(None, max_length=100)
    message: Optional[str] = Field(None, max_length=1000)
    type: ContactRequestType = ContactRequestType.CONTACT_REQUEST
    status: ContactRequestStatus = ContactRequestStatus.PENDING

class ContactRequestCreate(ContactRequestBase):
    pass

class ContactRequestUpdate(BaseModel):
    status: Optional[ContactRequestStatus] = None
    admin_notes: Optional[str] = Field(None, max_length=1000)
    assigned_to: Optional[int] = None
    priority: Optional[str] = Field(None, max_length=20)
    follow_up_date: Optional[datetime] = None

class ContactRequestResponse(ContactRequestBase):
    id: int
    created_at: datetime
    updated_at: datetime
    admin_notes: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ContactRequestListResponse(BaseModel):
    contact_requests: list[ContactRequestResponse]
    total: int
    page: int
    limit: int
    total_pages: int
