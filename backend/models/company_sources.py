from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanySource(Base):
    __tablename__ = "company_sources"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    source = Column(String(255), nullable=True)  # Registry, Gazette, Manual Entry, etc.
    source_reference = Column(String(255), nullable=True)  # Document number, URL, etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship
    company = relationship("Companies", backref="sources")

    def __repr__(self):
        return f"<CompanySource(id={self.id}, company_id={self.company_id}, source={self.source})>"
