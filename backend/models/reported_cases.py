from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class ReportedCases(Base):
    __tablename__ = "reported_cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=True, index=True)
    suit_reference_number = Column(String(100), nullable=True)
    date = Column(DateTime, nullable=True, index=True)
    presiding_judge = Column(Text, nullable=True)
    statutes_cited = Column(Text, nullable=True)
    cases_cited = Column(Text, nullable=True)
    lawyers = Column(Text, nullable=True)
    commentary = Column(Text, nullable=True)
    headnotes = Column(Text, nullable=True)
    town = Column(String(100), nullable=True, index=True)
    region = Column(String(200), nullable=True, index=True)
    dl_citation_no = Column(String(50), nullable=True, index=True)
    created_by = Column(String(50), nullable=True)
    updated_by = Column(String(50), nullable=True)
    file_url = Column(String(500), nullable=True)
    judgement = Column(Text, nullable=True)
    year = Column(String(4), nullable=True, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    type = Column(String(50), nullable=True, index=True)
    firebase_url = Column(String(500), nullable=True)
    summernote = Column(Text, nullable=True)
    detail_content = Column(Text, nullable=True)
    decision = Column(Text, nullable=True)
    antagonist = Column(String(500), nullable=True, index=True)
    protagonist = Column(String(500), nullable=True, index=True)
    citation = Column(String(100), nullable=True, index=True)
    court_type = Column(String(10), nullable=True, index=True)
    court_division = Column(String(100), nullable=True)
    file_name = Column(String(200), nullable=True)
    c_t = Column(Integer, nullable=True)
    judgement_by = Column(String(200), nullable=True)
    status = Column(String(50), nullable=True)
    case_summary = Column(Text, nullable=True)
    area_of_law = Column(String(200), nullable=True, index=True)
    keywords_phrases = Column(Text, nullable=True)
    published = Column(Boolean, default=True)
    dl_type = Column(String(50), nullable=True)
    academic_programme_id = Column(String(50), nullable=True)
    opinion_by = Column(String(200), nullable=True)
    conclusion = Column(Text, nullable=True)
    
    # AI Banking Summary Fields
    ai_case_outcome = Column(Text, nullable=True, comment='AI-generated case outcome')
    ai_court_orders = Column(Text, nullable=True, comment='AI-generated court orders analysis')
    ai_financial_impact = Column(Text, nullable=True, comment='AI-generated financial impact level')
    ai_detailed_outcome = Column(Text, nullable=True, comment='AI-generated detailed outcome analysis')
    ai_summary_generated_at = Column(DateTime, nullable=True, comment='Timestamp when AI summary was generated')
    ai_summary_version = Column(String(10), nullable=True, default='1.0', comment='Version of AI summary generation algorithm')
    
    # Relationships
    case_metadata = relationship("CaseMetadata", back_populates="case", uselist=False)
    case_search_index = relationship("CaseSearchIndex", back_populates="case", uselist=False)
    hearings = relationship("CaseHearing", back_populates="case", cascade="all, delete-orphan")
    case_summary = relationship("CaseSummary", back_populates="case", uselist=False, cascade="all, delete-orphan")