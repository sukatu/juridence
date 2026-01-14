from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class MarriageOfficer(Base):
    """
    Marriage Officers Table
    Stores data about appointed marriage officers
    """
    __tablename__ = "marriage_officers"

    id = Column(Integer, primary_key=True, index=True)
    
    # Officer Information
    officer_name = Column(String(500), nullable=False, index=True, comment="Full name of the marriage officer")
    church = Column(String(500), nullable=True, index=True, comment="Church or organization name")
    location = Column(String(500), nullable=True, index=True, comment="Location of the church or organization (extracted from church name)")
    region = Column(String(200), nullable=True, index=True, comment="Region where the church is located (inferred from location)")
    appointing_authority = Column(String(500), nullable=True, comment="Name of the authority that appointed the officer")
    appointing_authority_title = Column(String(500), nullable=True, comment="Title of the appointing authority (e.g., Attorney-General and Minister for Justice)")
    
    # Appointment Details
    appointment_date = Column(Date, nullable=True, index=True, comment="Date of appointment")
    
    # Gazette Information
    gazette_number = Column(String(50), nullable=True, index=True, comment="Gazette number where the appointment was published")
    gazette_date = Column(Date, nullable=True, index=True, comment="Gazette publication date")
    page_number = Column(Integer, nullable=True, index=True, comment="Page number in the gazette")
    source_details = Column(String(500), nullable=True, comment="Combined source information (Gazette No., Date, Page)")
    
    # Document Information
    document_filename = Column(String(255), nullable=True, index=True, comment="Source Excel or document filename")
    
    # Link to People table (optional)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True, index=True, comment="Link to people table")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="Last update timestamp")
    
    # Relationships (using string reference to avoid circular imports)
    # Note: back_populates is commented out temporarily to avoid relationship initialization issues
    # person = relationship("People", back_populates="marriage_officer_entries", foreign_keys=[person_id])
