from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanySecretary(Base):
    __tablename__ = "company_secretaries"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
    # Secretary Information
    name = Column(String(255), nullable=False, index=True)  # Can be person name or company name
    is_individual = Column(Boolean, default=True, nullable=False)  # True if person, False if company
    
    # Individual Secretary Details (if is_individual = True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    title = Column(String(50), nullable=True)
    nationality = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    id_number = Column(String(50), nullable=True)
    occupation = Column(String(200), nullable=True)
    
    # Company Secretary Details (if is_individual = False)
    company_registration_number = Column(String(100), nullable=True)
    
    # Contact Information
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_code = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Appointment Details
    appointment_date = Column(Date, nullable=True)
    resignation_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=True, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("Companies", back_populates="company_secretaries")
