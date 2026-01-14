from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, Enum, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

# Create named ENUM types for PostgreSQL
risk_level_enum = Enum('Low', 'Medium', 'High', 'Critical', name='risk_level')

class PersonAnalytics(Base):
    __tablename__ = "person_analytics"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id"), unique=True, nullable=False)
    
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
    
    # Additional Analytics
    case_complexity_score = Column(Integer, default=0)
    success_rate = Column(DECIMAL(5, 2), default=0.00)
    
    # Timestamps
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship with People
    person = relationship("People", back_populates="analytics")

    def __repr__(self):
        return f"<PersonAnalytics(person_id={self.person_id}, risk_score={self.risk_score}, risk_level={self.risk_level})>"
