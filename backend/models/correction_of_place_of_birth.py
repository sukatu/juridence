from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class CorrectionOfPlaceOfBirth(Base):
    """
    Correction of Place of Birth Table
    Stores extracted data from "Correction of Places of Birth" notices in Gazettes
    """
    __tablename__ = "correction_of_place_of_birth"

    id = Column(Integer, primary_key=True, index=True)
    
    # Item Number - Sequential number before the entry
    item_number = Column(String(50), nullable=False, index=True, comment="Sequential Item No. (e.g., '24024')")
    
    # Person Information
    person_name = Column(String(500), nullable=False, index=True, comment="Primary name listed at the start of the entry (salutations removed)")
    alias = Column(String(500), nullable=True, index=True, comment="Alternative name, also known as (AKA), or alias name")
    profession = Column(Text, comment="Full occupation and specific place of work or registration number if provided")
    address = Column(Text, comment="Physical address including Region or P.O. Box exactly as provided")
    gender = Column(String(10), index=True, comment="'Male' | 'Female' | 'Unknown'")
    
    # Place of Birth Information
    new_place_of_birth = Column(String(200), index=True, comment="New place of birth after 'wishes all to know that her/his place of birth is'")
    old_place_of_birth = Column(String(200), index=True, comment="Old place of birth which comes after the New place of birth")
    
    # Date Information
    effective_date = Column(Date, index=True, comment="Date following 'with effect from' (Day Month Year format)")
    
    # Additional Information
    remarks = Column(Text, comment="Remarks about documents still being valid")
    
    # Source Information
    source_details = Column(String(500), comment="Combined Gazette No. and Gazette Date")
    gazette_number = Column(String(50), index=True, comment="Gazette number (e.g., '94', '101')")
    gazette_date = Column(Date, index=True, comment="Gazette publication date")
    page = Column(Integer, index=True, comment="Page number where the information can be located")
    document_filename = Column(String(255), nullable=False, index=True, comment="Source PDF filename")
    
    # Link to People table
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True, index=True, comment="Link to people table")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="Last update timestamp")
    
    # Relationships
    person = relationship("People", back_populates="correction_of_place_of_birth_entries")
