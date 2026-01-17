"""
SQLAlchemy model for case_summaries table.
Stores AI-generated case summaries with monetary value extraction.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class CaseSummary(Base):
    __tablename__ = "case_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Summary content
    summary = Column(Text, nullable=False, comment="AI-generated case summary")
    monetary_value = Column(Float, nullable=True, comment="Extracted monetary value from judgment")
    monetary_currency = Column(String(10), nullable=True, default="GHS", comment="Currency of monetary value")
    has_monetary_value = Column(Boolean, default=False, comment="Whether case involves monetary value")
    
    # Metadata
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    version = Column(String(10), nullable=True, default="1.0", comment="Version of summary generation algorithm")
    is_active = Column(Boolean, default=True, comment="Whether this summary is currently active")
    
    # Relationships
    case = relationship("ReportedCases", back_populates="case_summary_record")
    
    def __repr__(self):
        return f"<CaseSummary(case_id={self.case_id}, has_monetary_value={self.has_monetary_value})>"
    
    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "case_id": self.case_id,
            "summary": self.summary,
            "monetary_value": self.monetary_value,
            "monetary_currency": self.monetary_currency,
            "has_monetary_value": self.has_monetary_value,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "version": self.version,
            "is_active": self.is_active
        }
