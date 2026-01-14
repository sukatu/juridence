from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, Date, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Banks(Base):
    __tablename__ = "banks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    former_name = Column(String(255), nullable=True, index=True)  # Previous bank name
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
    commencement_date = Column(Date, nullable=True)  # Commencement date from PDF
    type_of_company = Column(String(100), nullable=True)  # Public Limited, Private Limited, etc.
    business_entity_type = Column(String(100), nullable=True)  # Company With Shares, etc.
    nature_of_business = Column(Text, nullable=True)
    objects_of_company = Column(Text, nullable=True)  # Objects of the company from PDF
    principal_activity = Column(Text, nullable=True)  # Principal activity from PDF
    isic_code = Column(String(50), nullable=True)  # ISIC code from PDF
    financial_year_end_month = Column(Integer, nullable=True)  # Financial year end month (1-12)
    financial_year_end_day = Column(Integer, nullable=True)  # Financial year end day (1-31)
    constitution_option = Column(String(100), nullable=True)  # Registered Constitution, etc.
    
    # Bank specific fields
    bank_code = Column(String(20), nullable=True, unique=True)
    swift_code = Column(String(20), nullable=True)
    license_number = Column(String(100), nullable=True)
    established_date = Column(DateTime, nullable=True)
    bank_type = Column(String(50), nullable=True)  # Commercial, Development, Microfinance, etc.
    ownership_type = Column(String(50), nullable=True)  # Public, Private, Foreign, etc.
    
    # Services offered
    services = Column(JSON, nullable=True)  # Array of services
    previous_names = Column(JSON, nullable=True)  # Array of previous names (legacy)
    branches_count = Column(Integer, default=0)
    atm_count = Column(Integer, default=0)
    
    # Directors and key personnel (JSON for legacy, relationships for new)
    directors = Column(JSON, nullable=True)  # Legacy: Array of directors
    board_of_directors = Column(JSON, nullable=True)  # Legacy: Array of board members
    secretary = Column(JSON, nullable=True)  # Legacy: Secretary object
    key_personnel = Column(JSON, nullable=True)  # Array of key personnel/employees
    
    # Financial information
    total_assets = Column(Float, nullable=True)
    net_worth = Column(Float, nullable=True)
    rating = Column(String(10), nullable=True)  # A+, A, B+, etc.
    
    # Contact information
    head_office_address = Column(Text, nullable=True)
    customer_service_phone = Column(String(50), nullable=True)
    customer_service_email = Column(String(255), nullable=True)
    
    # Notification information
    notification_email = Column(String(255), nullable=True)  # Email for notifications
    notification_phone = Column(String(50), nullable=True)  # Phone for notifications
    notification_address = Column(Text, nullable=True)  # Address for notifications
    
    # Digital services
    has_mobile_app = Column(Boolean, default=False)
    has_online_banking = Column(Boolean, default=False)
    has_atm_services = Column(Boolean, default=True)
    has_foreign_exchange = Column(Boolean, default=False)
    
    # Status and metadata
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_date = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # Search and analytics
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
    analytics = relationship("BankAnalytics", back_populates="bank", uselist=False)
    case_statistics = relationship("BankCaseStatistics", back_populates="bank", uselist=False)
    gazette_entries = relationship("Gazette", back_populates="bank", lazy="dynamic")
    bank_directors = relationship("BankDirector", back_populates="bank", cascade="all, delete-orphan")
    bank_secretaries = relationship("BankSecretary", back_populates="bank", cascade="all, delete-orphan")
    bank_auditors = relationship("BankAuditor", back_populates="bank", cascade="all, delete-orphan")
    bank_capital_details = relationship("BankCapitalDetail", back_populates="bank", cascade="all, delete-orphan")
    bank_share_details = relationship("BankShareDetail", back_populates="bank", cascade="all, delete-orphan")
    bank_shareholders = relationship("BankShareholder", back_populates="bank", cascade="all, delete-orphan")
    bank_beneficial_owners = relationship("BankBeneficialOwner", back_populates="bank", cascade="all, delete-orphan")
    contact_details = relationship("BankContactDetails", back_populates="bank", uselist=False, cascade="all, delete-orphan")
    phone_numbers = relationship("BankPhoneNumber", back_populates="bank", cascade="all, delete-orphan")