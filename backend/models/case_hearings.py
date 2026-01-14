from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class HearingRemark(enum.Enum):
    fh = "fh"  # For Hearing
    fr = "fr"  # For Ruling
    fj = "fj"  # For Judgement

# PostgreSQL ENUM types with proper names
hearingremark_enum = Enum(HearingRemark, name="hearing_remark")

class CaseHearing(Base):
    __tablename__ = "case_hearings"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=False)
    
    # Hearing details
    hearing_date = Column(DateTime, nullable=False)
    hearing_time = Column(String(20), nullable=True)  # e.g., "10:00 AM"
    coram = Column(Text, nullable=True)  # Judges present
    remark = Column(hearingremark_enum, nullable=False)
    proceedings = Column(Text, nullable=True)  # Summary of proceedings
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    case = relationship("ReportedCases", back_populates="hearings")

# Add the relationship to ReportedCase model
# This will be added to the existing reported_cases.py file



