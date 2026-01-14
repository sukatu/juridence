from sqlalchemy import Column, Integer, String, Text, DateTime, Date, DECIMAL, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class InsuranceBeneficialOwner(Base):
    __tablename__ = "insurance_beneficial_owners"

    id = Column(Integer, primary_key=True, index=True)
    insurance_id = Column(Integer, ForeignKey("insurance.id"), nullable=False, index=True)
    
    # Beneficial Owner Information
    full_name = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    title = Column(String(50), nullable=True)
    
    # Personal Details
    nationality = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    id_number = Column(String(50), nullable=True)
    id_type = Column(String(50), nullable=True)  # Passport, National ID, etc.
    occupation = Column(String(200), nullable=True)
    
    # Ownership Details
    ownership_type = Column(String(100), nullable=True)  # Direct, Indirect, etc.
    percentage_ownership = Column(DECIMAL(5, 2), nullable=True)  # Percentage of beneficial ownership
    ownership_through = Column(String(255), nullable=True)  # Name of intermediary (if indirect)
    number_of_shares = Column(Integer, nullable=True)  # Number of shares beneficially owned
    
    # Contact Information
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_code = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Additional Information
    is_pep = Column(Boolean, default=False, nullable=False)  # Politically Exposed Person
    pep_details = Column(Text, nullable=True)  # Details if PEP
    risk_level = Column(String(20), nullable=True)  # Low, Medium, High
    
    # Dates
    identification_date = Column(Date, nullable=True)  # Date beneficial ownership was identified
    verification_date = Column(Date, nullable=True)  # Date ownership was verified
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    insurance = relationship("Insurance", back_populates="insurance_beneficial_owners")
