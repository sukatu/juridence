from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Court(Base):
    __tablename__ = "courts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    registry_name = Column(String(255), nullable=True)
    court_type = Column(String(100), nullable=False, index=True)  # High Court, Circuit Court, District Court, etc.
    region = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    
    # Google Maps integration
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    google_place_id = Column(String(255), nullable=True)
    
    # Court details
    area_coverage = Column(Text, nullable=True)  # Jurisdiction area coverage
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Media
    court_picture_url = Column(String(500), nullable=True)
    additional_images = Column(Text, nullable=True)  # JSON array of image URLs
    
    # Operational details
    operating_hours = Column(JSON, nullable=True)  # JSON object with hours
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    
    # Search and analytics
    search_count = Column(Integer, default=0, nullable=False)
    last_searched = Column(DateTime, nullable=True)
    
    # Additional fields
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    
    # Relationships - using string references to avoid circular imports
    # creator = relationship("User", foreign_keys=[created_by])
    # updater = relationship("User", foreign_keys=[updated_by])
