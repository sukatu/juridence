from sqlalchemy import Column, Integer, String, Text, DateTime, Date, DECIMAL, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class OilGasShareholder(Base):
    __tablename__ = "oil_gas_shareholders"

    id = Column(Integer, primary_key=True, index=True)
    oil_gas_company_id = Column(Integer, ForeignKey("oil_gas_companies.id"), nullable=False, index=True)
    
    # Shareholder Information
    name = Column(String(255), nullable=False, index=True)  # Shareholder name
    is_individual = Column(Boolean, default=True, nullable=False)  # True if person, False if company/trust
    
    # Individual Shareholder Details (if is_individual = True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    title = Column(String(50), nullable=True)
    nationality = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    id_number = Column(String(50), nullable=True)
    occupation = Column(String(200), nullable=True)
    
    # Company/Trust Shareholder Details (if is_individual = False)
    company_registration_number = Column(String(100), nullable=True)
    company_type = Column(String(100), nullable=True)  # Company, Trust, Partnership, etc.
    is_subscriber = Column(Boolean, default=False, nullable=False)  # True if original subscriber
    is_trustee = Column(Boolean, default=False, nullable=False)  # True if holding as trustee
    
    # Shareholding Details
    share_class = Column(String(100), nullable=True)  # Class of shares held
    number_of_shares = Column(Integer, nullable=True)  # Number of shares held
    percentage_holding = Column(DECIMAL(5, 2), nullable=True)  # Percentage of total shares
    share_value = Column(DECIMAL(15, 2), nullable=True)  # Total value of shares held
    
    # Contact Information
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_code = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Appointment/Transfer Details
    acquisition_date = Column(Date, nullable=True)  # Date shares were acquired
    transfer_date = Column(Date, nullable=True)  # Date shares were transferred (if no longer shareholder)
    is_current = Column(Boolean, default=True, nullable=False)
    
    # Currency
    currency = Column(String(10), nullable=True, default="GHS")
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    oil_gas_company = relationship("OilGasCompanies", back_populates="oil_gas_shareholders")
