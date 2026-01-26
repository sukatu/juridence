from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# Use TYPE_CHECKING to avoid circular imports
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.court import Court
    from models.judges import Judges
    from models.reported_cases import ReportedCases

class CauseList(Base):
    __tablename__ = "cause_lists"

    id = Column(Integer, primary_key=True, index=True)
    
    # Case information
    case_type = Column(String(50), nullable=True)  # Civil, Criminal, Commercial, etc.
    suit_no = Column(String(100), nullable=True)  # Case number
    case_title = Column(Text, nullable=True)
    
    # Hearing details
    hearing_date = Column(Date, nullable=False, index=True)
    hearing_time = Column(Time, nullable=True)
    
    # Judge information
    judge_id = Column(Integer, ForeignKey("judges.id"), nullable=True)
    judge_name = Column(String(255), nullable=True)  # Denormalized for quick access
    
    # Parties
    first_party_title = Column(String(50), nullable=True)  # Plaintiff, Defendant, etc.
    first_party_name = Column(String(255), nullable=True)
    second_party_title = Column(String(50), nullable=True)
    second_party_name = Column(String(255), nullable=True)
    
    # Counsel information
    first_party_counsel_title = Column(String(50), nullable=True)
    first_party_counsel_name = Column(String(255), nullable=True)
    first_party_counsel_contact = Column(String(100), nullable=True)
    second_party_counsel_title = Column(String(50), nullable=True)
    second_party_counsel_name = Column(String(255), nullable=True)
    second_party_counsel_contact = Column(String(100), nullable=True)
    
    # Additional information
    remarks = Column(Text, nullable=True)
    status = Column(String(50), default="Active", nullable=False)  # Active, Closed, Adjourned
    
    # Registry/Court information
    registry_id = Column(Integer, nullable=True)  # Reference to registry
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=True)
    court_type = Column(String(100), nullable=True)  # Supreme Court, Appeal Court, etc.
    location = Column(String(255), nullable=True)
    venue = Column(String(255), nullable=True)
    
    # Link to reported case if exists
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(100), nullable=True)
    updated_by = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships - commented out temporarily to fix login issue
    # These will be re-enabled once model loading order is fixed
    # judge = relationship("Judges", foreign_keys=[judge_id], lazy="noload")
    # court = relationship("Court", foreign_keys=[court_id], lazy="noload", backref="cause_lists")
    # reported_case = relationship("ReportedCases", foreign_keys=[case_id], lazy="noload")

    def __repr__(self):
        return f"<CauseList(id={self.id}, suit_no='{self.suit_no}', hearing_date='{self.hearing_date}')>"

