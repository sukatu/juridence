"""
SQLAlchemy model for bank contact details.
Stores contact information extracted from bank registration documents.
"""

from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class BankContactDetails(Base):
    __tablename__ = "bank_contact_details"
    
    id = Column(Integer, primary_key=True, index=True)
    bank_id = Column(Integer, ForeignKey("banks.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Contact Information
    phone = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    fax = Column(String(50), nullable=True)
    
    # Address Information
    ghana_digital_address = Column(String(50), nullable=True)  # e.g., GA-226-9244
    house_building_flat_number = Column(Text, nullable=True)
    street_name_landmark = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_address_type = Column(String(50), nullable=True)  # PO Box, PMB, DTD
    postal_address = Column(Text, nullable=True)  # P.O.BOX GP 2949, etc.
    postal_code = Column(String(50), nullable=True)
    
    # GPS Coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Additional Contact Details
    customer_service_phone = Column(String(100), nullable=True)
    customer_service_email = Column(String(255), nullable=True)
    head_office_address = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    bank = relationship("Banks", back_populates="contact_details")
    
    def __repr__(self):
        return f"<BankContactDetails(bank_id={self.bank_id}, phone={self.phone})>"
