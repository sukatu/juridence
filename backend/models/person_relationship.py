from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class PersonRelationship(Base):
    __tablename__ = "person_relationships"
    
    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False, index=True)
    related_person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Relationship Details
    related_person_name = Column(String(200), nullable=False)  # Name if related person doesn't exist in DB
    relationship_type = Column(String(50), nullable=False)  # e.g., "Wife", "Cousin", "Business Partner"
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Additional Details
    notes = Column(Text, nullable=True)
    
    # System Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    person = relationship("People", foreign_keys=[person_id], backref="relationships")
    related_person = relationship("People", foreign_keys=[related_person_id])
