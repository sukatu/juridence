from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class OilGasAuditor(Base):
    __tablename__ = "oil_gas_auditors"

    id = Column(Integer, primary_key=True, index=True)
    oil_gas_company_id = Column(Integer, ForeignKey("oil_gas_companies.id"), nullable=False, index=True)
    
    # Auditor Information
    name = Column(String(255), nullable=False, index=True)  # Firm name or individual name
    is_individual = Column(Boolean, default=False, nullable=False)  # True if person, False if firm
    
    # Individual Auditor Details (if is_individual = True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    title = Column(String(50), nullable=True)
    nationality = Column(String(100), nullable=True)
    professional_qualification = Column(String(200), nullable=True)  # CA, CPA, etc.
    
    # Firm Details (if is_individual = False)
    firm_registration_number = Column(String(100), nullable=True)
    firm_type = Column(String(100), nullable=True)  # Partnership, Limited Company, etc.
    
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
    oil_gas_company = relationship("OilGasCompanies", back_populates="oil_gas_auditors")
