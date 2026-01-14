from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class PersonCaseLink(Base):
    __tablename__ = "person_case_links"
    
    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Case Details (if case doesn't exist in DB yet)
    case_number = Column(String(100), nullable=True)
    case_title = Column(String(500), nullable=True)
    role_in_case = Column(String(100), nullable=False)  # e.g., "Plaintiff", "Defendant", "Witness"
    
    # Additional Details
    notes = Column(Text, nullable=True)
    
    # System Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    person = relationship("People", backref="case_links")
    case = relationship("ReportedCases", backref="person_links")
