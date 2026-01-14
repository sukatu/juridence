from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class CourtLevel(enum.Enum):
    supreme_court = "supreme_court"
    court_of_appeal = "court_of_appeal"
    high_court = "high_court"
    circuit_court = "circuit_court"
    district_court = "district_court"
    magistrate_court = "magistrate_court"

class CourtTypes(Base):
    __tablename__ = "court_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)  # e.g., "Supreme Court", "High Court"
    code = Column(String(20), nullable=False, unique=True, index=True)  # e.g., "SC", "HC", "CC"
    level = Column(Enum(CourtLevel), nullable=False, index=True)
    description = Column(Text, nullable=True)
    jurisdiction = Column(Text, nullable=True)  # Geographic or subject matter jurisdiction
    region = Column(String(50), nullable=True, index=True)
    address = Column(Text, nullable=True)
    contact_info = Column(Text, nullable=True)  # JSON string for contact details
    presiding_judge = Column(String(255), nullable=True)
    established_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(100), nullable=True)
    updated_by = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<CourtType(name='{self.name}', code='{self.code}', level='{self.level}')>"
