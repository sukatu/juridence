from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class RequestType(str, enum.Enum):
    CASE_DETAILS = "case_details"
    LEGAL_DOCUMENTS = "legal_documents"
    COURT_RECORDS = "court_records"
    FINANCIAL_INFORMATION = "financial_information"
    PROFILE_INFORMATION = "profile_information"
    CONTACT_DETAILS = "contact_details"
    MANAGEMENT_DETAILS = "management_details"
    LEGAL_HISTORY = "legal_history"
    OTHER = "other"

class EntityType(str, enum.Enum):
    PERSON = "person"
    BANK = "bank"
    INSURANCE = "insurance"
    COMPANY = "company"
    CASE = "case"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# PostgreSQL ENUM types with proper names
requesttype_enum = Enum(RequestType, name="request_type")
entitytype_enum = Enum(EntityType, name="entity_type")
requeststatus_enum = Enum(RequestStatus, name="request_status")
priority_enum = Enum(Priority, name="priority")

class RequestDetails(Base):
    __tablename__ = "request_details"

    id = Column(Integer, primary_key=True, index=True)
    
    # Request information
    request_type = Column(requesttype_enum, nullable=False)
    entity_type = Column(entitytype_enum, nullable=False)
    entity_id = Column(Integer, nullable=True)  # ID of the specific entity (person, bank, etc.)
    entity_name = Column(String(255), nullable=True)  # Name of the entity for reference
    
    # Case-specific information (if requesting case details)
    case_id = Column(Integer, nullable=True)  # ID of the specific case
    case_suit_number = Column(String(255), nullable=True)  # Suit reference number
    
    # Request details
    message = Column(Text, nullable=True)  # Additional message from requester
    status = Column(requeststatus_enum, default=RequestStatus.PENDING)
    
    # Requester information
    requester_name = Column(String(255), nullable=True)
    requester_email = Column(String(255), nullable=True)
    requester_phone = Column(String(50), nullable=True)
    requester_organization = Column(String(255), nullable=True)
    
    # Admin/Staff information
    assigned_to = Column(String(255), nullable=True)  # Staff member assigned to handle request
    admin_notes = Column(Text, nullable=True)  # Internal notes for staff
    response_message = Column(Text, nullable=True)  # Response to the requester
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Priority and urgency
    priority = Column(priority_enum, default=Priority.MEDIUM)
    is_urgent = Column(Boolean, default=False)
    
    # Additional metadata
    source_ip = Column(String(45), nullable=True)  # IP address of requester
    user_agent = Column(Text, nullable=True)  # Browser information
    referrer = Column(String(500), nullable=True)  # Where the request came from

    def __repr__(self):
        return f"<RequestDetails(id={self.id}, request_type='{self.request_type}', status='{self.status}')>"
