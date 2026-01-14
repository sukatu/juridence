from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class LegalHistory(Base):
    __tablename__ = "legal_history"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(20), nullable=False, index=True)  # 'person', 'bank', 'insurance'
    entity_id = Column(Integer, nullable=False, index=True)  # ID from people, banks, or insurance table
    entity_name = Column(String(500), nullable=False, index=True)  # Name for quick reference
    case_id = Column(BigInteger, ForeignKey("reported_cases.id"), nullable=False, index=True)
    mention_type = Column(String(50), nullable=False, index=True)  # 'title', 'antagonist', 'protagonist', 'content'
    mention_context = Column(Text, nullable=True)  # Surrounding text for context
    mention_count = Column(Integer, default=1)  # Number of times mentioned in this case
    relevance_score = Column(Float, default=0.0)  # AI-calculated relevance score
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship to reported case
    case = relationship("ReportedCases", backref="legal_history_entries")

class CaseMention(Base):
    __tablename__ = "case_mentions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(BigInteger, ForeignKey("reported_cases.id"), nullable=False, index=True)
    entity_type = Column(String(20), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    entity_name = Column(String(500), nullable=False, index=True)
    mention_in_title = Column(Boolean, default=False)
    mention_in_antagonist = Column(Boolean, default=False)
    mention_in_protagonist = Column(Boolean, default=False)
    mention_in_content = Column(Boolean, default=False)
    mention_in_judgement = Column(Boolean, default=False)
    mention_in_decision = Column(Boolean, default=False)
    total_mentions = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    # Relationship to reported case
    case = relationship("ReportedCases", backref="case_mentions")

class LegalSearchIndex(Base):
    __tablename__ = "legal_search_index"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(20), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    entity_name = Column(String(500), nullable=False, index=True)
    search_terms = Column(Text, nullable=False)  # All searchable terms for this entity
    case_count = Column(Integer, default=0)  # Total number of cases mentioning this entity
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True, index=True)
