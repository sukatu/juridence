from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanyCaseLink(Base):
    __tablename__ = "company_case_links"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=False, index=True)
    role_in_case = Column(String(100), nullable=True)  # Plaintiff, Defendant, Third Party, etc.
    case_number = Column(String(100), nullable=True)
    case_title = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Companies", backref="case_links")
    case = relationship("ReportedCases", backref="company_links")

    def __repr__(self):
        return f"<CompanyCaseLink(id={self.id}, company_id={self.company_id}, case_id={self.case_id})>"
