from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Float, LargeBinary
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class CaseMetadata(Base):
    __tablename__ = "case_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=False, unique=True, index=True)
    
    # Case Summary and Analysis
    case_summary = Column(Text, nullable=True)
    summernote_content = Column(Text, nullable=True)  # WYSIWYG formatted case content (LONGTEXT)
    case_type = Column(String(100), nullable=True)
    area_of_law = Column(String(200), nullable=True)
    keywords = Column(JSON, nullable=True)  # Array of keywords
    
    # People Involved
    judges = Column(JSON, nullable=True)  # Array of judge names
    lawyers = Column(JSON, nullable=True)  # Array of lawyer names
    related_people = Column(JSON, nullable=True)  # Array of people mentioned
    protagonist = Column(String(500), nullable=True)
    antagonist = Column(String(500), nullable=True)
    
    # Organizations and Affiliations
    organizations = Column(JSON, nullable=True)  # Array of organizations mentioned
    banks_involved = Column(JSON, nullable=True)  # Array of banks mentioned
    insurance_involved = Column(JSON, nullable=True)  # Array of insurance companies mentioned
    
    # Case Resolution and Outcomes
    resolution_status = Column(String(50), nullable=True)  # resolved, pending, dismissed, etc.
    outcome = Column(String(100), nullable=True)  # favorable, unfavorable, mixed, etc.
    decision_type = Column(String(100), nullable=True)  # judgment, settlement, dismissal, etc.
    monetary_amount = Column(Float, nullable=True)  # If applicable
    
    # Legal Information
    statutes_cited = Column(JSON, nullable=True)  # Array of statutes
    cases_cited = Column(JSON, nullable=True)  # Array of case citations
    court_type = Column(String(100), nullable=True)
    court_division = Column(String(100), nullable=True)
    
    # Search and Analytics
    search_keywords = Column(JSON, nullable=True)  # Keywords for search optimization
    relevance_score = Column(Float, default=0.0)  # For search ranking
    is_processed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    case = relationship("ReportedCases", back_populates="case_metadata")

class CaseSearchIndex(Base):
    __tablename__ = "case_search_index"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=False, index=True)
    
    # Searchable content
    searchable_text = Column(Text, nullable=False)  # Combined searchable text
    person_names = Column(JSON, nullable=True)  # All person names mentioned
    organization_names = Column(JSON, nullable=True)  # All organization names mentioned
    keywords = Column(JSON, nullable=True)  # All keywords
    
    # Search metadata
    word_count = Column(Integer, default=0)
    last_indexed = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    case = relationship("ReportedCases", back_populates="case_search_index")
