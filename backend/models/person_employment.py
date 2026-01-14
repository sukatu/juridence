from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class PersonEmployment(Base):
    __tablename__ = "person_employment"
    
    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Employment Details
    company_name = Column(String(200), nullable=False)
    position = Column(String(200), nullable=False)
    department = Column(String(100), nullable=True)
    
    # Duration
    start_date = Column(String(100), nullable=True)  # Store as string for flexibility (e.g., "March 2020")
    end_date = Column(String(100), nullable=True)  # Store as string (e.g., "Present", "March 2020")
    is_current = Column(Boolean, default=False)
    
    # Additional Details
    reason_for_leaving = Column(Text, nullable=True)
    source = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    
    # System Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    person = relationship("People", backref="employment_history")
