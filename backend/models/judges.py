from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, Date, JSON
from sqlalchemy.sql import func
from database import Base
import enum

class JudgeStatus(enum.Enum):
    active = "active"
    retired = "retired"
    deceased = "deceased"
    suspended = "suspended"
    special_prosecutor = "special_prosecutor"

class Judges(Base):
    __tablename__ = "judges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    title = Column(String(100), nullable=True)  # e.g., "Justice", "Judge", "Chief Justice"
    gender = Column(String(20), nullable=True)  # e.g., "Male", "Female", "Other"
    court_type = Column(String(50), nullable=True, index=True)  # e.g., "Supreme Court", "High Court"
    court_division = Column(String(100), nullable=True)  # e.g., "Commercial Division", "Criminal Division"
    region = Column(String(50), nullable=True, index=True)
    status = Column(Enum(JudgeStatus), default=JudgeStatus.active, nullable=False)
    bio = Column(Text, nullable=True)  # Brief biography or background
    
    # New fields for comprehensive judge information
    date_of_birth = Column(Date, nullable=True)
    date_of_call_to_bar = Column(Date, nullable=True)
    schools_attended = Column(JSON, nullable=True)  # List of schools with dates
    date_appointment_high_court = Column(Date, nullable=True)
    date_appointment_court_appeal = Column(Date, nullable=True)
    date_appointment_supreme_court = Column(Date, nullable=True)
    
    # Cases conducted as a lawyer
    cases_as_lawyer_high_court = Column(JSON, nullable=True)  # List of cases
    cases_as_lawyer_court_appeal = Column(JSON, nullable=True)
    cases_as_lawyer_supreme_court = Column(JSON, nullable=True)
    
    # Judgments and rulings delivered
    judgments_high_court = Column(JSON, nullable=True)  # List of judgments
    judgments_court_appeal = Column(JSON, nullable=True)
    judgments_supreme_court = Column(JSON, nullable=True)
    
    # Articles and books
    articles_written = Column(JSON, nullable=True)  # List of articles
    books_written = Column(JSON, nullable=True)  # List of books
    
    # Original fields
    appointment_date = Column(DateTime, nullable=True)
    retirement_date = Column(DateTime, nullable=True)
    contact_info = Column(Text, nullable=True)  # JSON string for contact details
    specializations = Column(Text, nullable=True)  # Areas of law expertise
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(100), nullable=True)
    updated_by = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<Judge(name='{self.name}', title='{self.title}', court_type='{self.court_type}')>"
