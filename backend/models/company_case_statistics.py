from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanyCaseStatistics(Base):
    __tablename__ = "company_case_statistics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    total_cases = Column(Integer, default=0, index=True)
    resolved_cases = Column(Integer, default=0)
    unresolved_cases = Column(Integer, default=0)
    favorable_cases = Column(Integer, default=0)
    unfavorable_cases = Column(Integer, default=0)
    mixed_cases = Column(Integer, default=0)
    case_outcome = Column(String(50), default="N/A", index=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship with Companies
    company = relationship("Companies", back_populates="case_statistics")

    def __repr__(self):
        return f"<CompanyCaseStatistics(company_id={self.company_id}, total_cases={self.total_cases}, outcome={self.case_outcome})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "company_id": self.company_id,
            "total_cases": self.total_cases,
            "resolved_cases": self.resolved_cases,
            "unresolved_cases": self.unresolved_cases,
            "favorable_cases": self.favorable_cases,
            "unfavorable_cases": self.unfavorable_cases,
            "mixed_cases": self.mixed_cases,
            "case_outcome": self.case_outcome,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
