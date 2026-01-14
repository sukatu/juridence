from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class ChangeOfName(Base):
    """
    Change of Name Table
    Stores extracted data from "CHANGE OF NAMES" notices in Gazettes
    """
    __tablename__ = "change_of_name"

    id = Column(Integer, primary_key=True, index=True)
    
    # Item Number - Sequential number before the entry
    item_number = Column(String(50), nullable=False, index=True, comment="Sequential Item No. (e.g., '21220')")
    
    # Person Information
    old_name = Column(String(500), nullable=False, index=True, comment="Old name (the name before change, e.g., 'Sophia Nyame Nyanora-Awa')")
    new_name = Column(String(500), nullable=False, index=True, comment="New name (the name they want to be known as, e.g., 'Sophia Nyame Duku')")
    alias_name = Column(Text, nullable=True, comment="Alias names (comma-separated if multiple, e.g., 'Sophia Nyame N., John Doe')")
    profession = Column(String(200), nullable=True, comment="Profession/occupation (e.g., 'Unemployed')")
    gender = Column(String(10), nullable=True, index=True, comment="'Male' | 'Female' | 'Unknown' (inferred from title)")
    
    # Address Information
    address = Column(Text, nullable=True, comment="Full address as provided")
    town_city = Column(String(200), nullable=True, index=True, comment="Town or city (e.g., 'Tarkwa')")
    region = Column(String(200), nullable=True, index=True, comment="Region (e.g., 'Western Region')")
    
    # Date Information
    effective_date = Column(Date, nullable=True, index=True, comment="Effective date of change (e.g., 'May, 2011' or '1st May, 2011')")
    
    # Additional Information
    remarks = Column(Text, nullable=True, comment="Remarks (e.g., 'All documents bearing her former names are still valid.')")
    source = Column(String(200), nullable=True, comment="Source authority")
    
    # Source Information
    source_details = Column(String(500), nullable=True, comment="Combined Gazette No. and Gazette Date")
    gazette_number = Column(String(50), nullable=False, index=True, comment="Gazette number (e.g., '94')")
    gazette_date = Column(Date, nullable=False, index=True, comment="Gazette publication date (e.g., '09-05-2025')")
    page_number = Column(Integer, nullable=True, index=True, comment="Page number from upper left/right corner of the page")
    document_filename = Column(String(255), nullable=False, index=True, comment="Source PDF filename")
    
    # Link to People table
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True, index=True, comment="Link to people table")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="Last update timestamp")
    
    # Relationships
    person = relationship("People", back_populates="change_of_name_entries")
