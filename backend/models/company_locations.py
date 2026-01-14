from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CompanyLocation(Base):
    __tablename__ = "company_locations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    location_type = Column(String(100), nullable=True)  # Head Office, Branch, Warehouse, etc.
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_code = Column(String(20), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship
    company = relationship("Companies", backref="locations")

    def __repr__(self):
        return f"<CompanyLocation(id={self.id}, company_id={self.company_id}, location_type={self.location_type})>"
