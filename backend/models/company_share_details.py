from sqlalchemy import Column, Integer, String, Text, DateTime, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanyShareDetail(Base):
    __tablename__ = "company_share_details"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
    # Share Class Information
    share_class = Column(String(100), nullable=False, index=True)  # Ordinary, Preference, etc.
    share_type = Column(String(100), nullable=True)  # Common, Preferred, etc.
    
    # Share Quantities
    authorized_shares = Column(Integer, nullable=True)  # Number of authorized shares for this class
    issued_shares = Column(Integer, nullable=True)  # Number of issued shares for this class
    treasury_shares = Column(Integer, nullable=True, default=0)  # Number of treasury shares
    
    # Share Amounts
    par_value_per_share = Column(DECIMAL(15, 4), nullable=True)  # Par value per share
    total_authorized_amount = Column(DECIMAL(15, 2), nullable=True)  # Total authorized amount for this class
    total_issued_amount = Column(DECIMAL(15, 2), nullable=True)  # Total issued amount for this class
    
    # Payment Details
    amount_paid_in_cash = Column(DECIMAL(15, 2), nullable=True)  # Amount paid in cash for this class
    amount_paid_otherwise_than_cash = Column(DECIMAL(15, 2), nullable=True)  # Amount paid otherwise than cash
    amount_remaining_to_be_paid = Column(DECIMAL(15, 2), nullable=True)  # Amount remaining to be paid
    
    # Currency
    currency = Column(String(10), nullable=True, default="GHS")
    
    # Additional Details
    voting_rights = Column(String(100), nullable=True)  # Voting rights description
    dividend_rights = Column(String(100), nullable=True)  # Dividend rights description
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    company = relationship("Companies", back_populates="company_share_details")
