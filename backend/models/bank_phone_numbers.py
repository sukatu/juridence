from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class PhoneNumberType(enum.Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    MOBILE = "mobile"
    CUSTOMER_SERVICE = "customer_service"
    FAX = "fax"

class BankPhoneNumber(Base):
    __tablename__ = "bank_phone_numbers"

    id = Column(Integer, primary_key=True, index=True)
    bank_id = Column(Integer, ForeignKey("banks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Phone number details
    phone_number = Column(String(50), nullable=False)
    phone_type = Column(String(50), nullable=True)  # "Phone No.1", "Phone No.2", "Mobile No.1", etc.
    label = Column(String(100), nullable=True)  # "Primary", "Customer Service", etc.
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Integer, default=1, comment="1 for active, 0 for inactive")

    # Relationship
    bank = relationship("Banks", back_populates="phone_numbers")
