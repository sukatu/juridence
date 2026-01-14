from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class ContactRequestStatus(str, enum.Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ContactRequestType(str, enum.Enum):
    CONTACT_REQUEST = "contact_request"
    SUBSCRIPTION_INQUIRY = "subscription_inquiry"
    DEMO_REQUEST = "demo_request"
    SUPPORT_REQUEST = "support_request"

class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Contact Information
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    organization = Column(String(200), nullable=False)
    position = Column(String(100), nullable=True)
    message = Column(Text, nullable=True)
    
    # Request Details
    type = Column(Enum(ContactRequestType), default=ContactRequestType.CONTACT_REQUEST, nullable=False)
    status = Column(Enum(ContactRequestStatus), default=ContactRequestStatus.PENDING, nullable=False, index=True)
    priority = Column(String(20), nullable=True)  # low, medium, high, urgent
    
    # Admin Management
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_notes = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    assigned_user = relationship("User", foreign_keys=[assigned_to])
