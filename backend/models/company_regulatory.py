from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanyRegulatory(Base):
    __tablename__ = "company_regulatory"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    regulatory_body = Column(String(255), nullable=True)  # SEC, GRA, etc.
    license_permit_number = Column(String(100), nullable=True)
    license_permit_type = Column(String(100), nullable=True)  # Business License, Operating Permit, etc.
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=True)  # Active, Expired, Suspended, etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship
    company = relationship("Companies", backref="regulatory_compliance")

    def __repr__(self):
        return f"<CompanyRegulatory(id={self.id}, company_id={self.company_id}, regulatory_body={self.regulatory_body})>"
