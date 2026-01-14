from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, Date, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class OilGasCompanies(Base):
    __tablename__ = "oil_gas_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    former_name = Column(String(255), nullable=True, index=True)  # Previous company name
    short_name = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    landmark = Column(String(255), nullable=True)  # Landmark for address
    city = Column(String(100), nullable=True, index=True)
    region = Column(String(100), nullable=True, index=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_code = Column(String(20), nullable=True)
    
    # Registration Information
    registration_number = Column(String(100), nullable=True, unique=True)
    tax_identification_number = Column(String(50), nullable=True, unique=True)
    date_of_incorporation = Column(Date, nullable=True)
    date_of_commencement = Column(Date, nullable=True)
    type_of_company = Column(String(100), nullable=True)  # Public Limited, Private Limited, etc.
    nature_of_business = Column(Text, nullable=True)
    
    # Oil & Gas specific fields
    license_number = Column(String(100), nullable=True)
    established_date = Column(DateTime, nullable=True)
    company_type = Column(String(50), nullable=True)  # Limited, Partnership, etc.
    ownership_type = Column(String(50), nullable=True)  # Public, Private, Foreign, etc.
    industry = Column(String(100), nullable=True)  # Oil & Gas, Energy, Petroleum, etc.
    
    # Business information
    business_activities = Column(JSON, nullable=True)  # Array of business activities
    previous_names = Column(JSON, nullable=True)  # Array of previous names
    
    # Financial information
    total_assets = Column(Float, nullable=True)
    net_worth = Column(Float, nullable=True)
    annual_revenue = Column(Float, nullable=True)
    authorized_capital = Column(DECIMAL(15, 2), nullable=True)
    employee_count = Column(Integer, default=0)
    rating = Column(String(10), nullable=True)  # A+, A, B+, etc.
    
    # Contact information
    head_office_address = Column(Text, nullable=True)
    customer_service_phone = Column(String(50), nullable=True)
    customer_service_email = Column(String(255), nullable=True)
    
    # Notification information
    notification_email = Column(String(255), nullable=True)  # Email for notifications
    notification_phone = Column(String(50), nullable=True)  # Phone for notifications
    notification_address = Column(Text, nullable=True)  # Address for notifications
    
    # Digital presence
    has_website = Column(Boolean, default=False)
    has_social_media = Column(Boolean, default=False)
    has_mobile_app = Column(Boolean, default=False)
    
    # Status and metadata
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_date = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)
    search_count = Column(Integer, default=0)
    last_searched = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    
    # Additional fields
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, INACTIVE, SUSPENDED
    
    # Relationships
    oil_gas_directors = relationship("OilGasDirector", back_populates="oil_gas_company", cascade="all, delete-orphan")
    oil_gas_secretaries = relationship("OilGasSecretary", back_populates="oil_gas_company", cascade="all, delete-orphan")
    oil_gas_auditors = relationship("OilGasAuditor", back_populates="oil_gas_company", cascade="all, delete-orphan")
    oil_gas_capital_details = relationship("OilGasCapitalDetail", back_populates="oil_gas_company", cascade="all, delete-orphan")
    oil_gas_share_details = relationship("OilGasShareDetail", back_populates="oil_gas_company", cascade="all, delete-orphan")
    oil_gas_shareholders = relationship("OilGasShareholder", back_populates="oil_gas_company", cascade="all, delete-orphan")
    oil_gas_beneficial_owners = relationship("OilGasBeneficialOwner", back_populates="oil_gas_company", cascade="all, delete-orphan")
