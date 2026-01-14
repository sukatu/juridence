from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class BankRulingsJudgements(Base):
    """
    Bank Rulings and Judgements Table
    Links banks to reported cases based on case titles and content
    """
    __tablename__ = "bank_rulings_judgements"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    bank_id = Column(Integer, ForeignKey("banks.id"), nullable=False, index=True, comment="Reference to banks table")
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=False, index=True, comment="Reference to reported_cases table")
    
    # Matching Information
    matched_bank_name = Column(String(500), nullable=True, comment="The bank name as it appeared in the case title")
    match_confidence = Column(String(50), nullable=True, comment="High, Medium, Low - confidence level of the match")
    match_method = Column(String(100), nullable=True, comment="How the match was made (title_match, protagonist_match, etc.)")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="Last update timestamp")
    
    # Unique constraint to prevent duplicate links
    __table_args__ = (
        UniqueConstraint('bank_id', 'case_id', name='uq_bank_case'),
    )
    
    # Relationships
    bank = relationship("Banks", backref="bank_rulings_judgements")
    case = relationship("ReportedCases", backref="bank_rulings_judgements")
