from sqlalchemy import Column, Integer, String, Text, DateTime, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanyCapitalDetail(Base):
    __tablename__ = "company_capital_details"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
    # Capital Information
    authorized_capital = Column(DECIMAL(15, 2), nullable=True)  # Total authorized capital
    issued_capital = Column(DECIMAL(15, 2), nullable=True)  # Total issued capital
    paid_up_capital = Column(DECIMAL(15, 2), nullable=True)  # Total paid-up capital
    unpaid_capital = Column(DECIMAL(15, 2), nullable=True)  # Total unpaid capital
    
    # Currency
    currency = Column(String(10), nullable=True, default="GHS")  # GHS, USD, etc.
    
    # Additional Details
    capital_structure = Column(Text, nullable=True)  # Description of capital structure
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("Companies", back_populates="company_capital_details")
