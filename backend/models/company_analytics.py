from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, Enum, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

# Create named ENUM types for PostgreSQL
risk_level_enum = Enum('Low', 'Medium', 'High', 'Critical', name='risk_level')

class CompanyAnalytics(Base):
    __tablename__ = "company_analytics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), unique=True, nullable=False)

    # Risk Assessment
    risk_score = Column(Integer, default=0, index=True)
    risk_level = Column(risk_level_enum, default='Low', index=True)
    risk_factors = Column(JSON)

    # Financial Impact
    total_monetary_amount = Column(DECIMAL(15, 2), default=0.00)
    average_case_value = Column(DECIMAL(15, 2), default=0.00)
    financial_risk_level = Column(risk_level_enum, default='Low', index=True)

    # Subject Matter
    primary_subject_matter = Column(String(255))
    subject_matter_categories = Column(JSON)
    legal_issues = Column(JSON)
    financial_terms = Column(JSON)

    # Company-specific Analytics
    regulatory_compliance_score = Column(Integer, default=0)
    customer_dispute_rate = Column(DECIMAL(5, 2), default=0.00)
    operational_risk_score = Column(Integer, default=0)
    business_continuity_score = Column(Integer, default=0)
    market_risk_score = Column(Integer, default=0)
    credit_risk_score = Column(Integer, default=0)
    reputation_risk_score = Column(Integer, default=0)

    # Case Complexity
    case_complexity_score = Column(Integer, default=0)
    success_rate = Column(DECIMAL(5, 2), default=0.00)

    # Timestamps
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship with Companies
    company = relationship("Companies", back_populates="analytics")

    def __repr__(self):
        return f"<CompanyAnalytics(company_id={self.company_id}, risk_score={self.risk_score}, risk_level={self.risk_level})>"
