from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class MarriageVenue(Base):
    """
    Marriage Venues Table
    Stores data about places of worship licensed for the celebration of marriages
    Matches the structure of the Excel sheet: marriage venues.xlsx
    """
    __tablename__ = "marriage_venues"

    id = Column(Integer, primary_key=True, index=True)
    
    # Excel Sheet Fields (matching exact column names)
    gazette_number = Column(String(50), nullable=True, index=True, comment="Gazette No.")
    page_number = Column(Integer, nullable=True, index=True, comment="Page Number")
    name_of_licensed_place = Column(String(500), nullable=False, index=True, comment="Name of Licensed Place")
    date_of_gazette = Column(Date, nullable=True, index=True, comment="Date of Gazette")
    denomination = Column(String(500), nullable=True, index=True, comment="Denomination")
    branch_location_address_region = Column(Text, nullable=True, comment="Branch Location/ Address/ Region")
    metropolitan_assembly_or_regional_coordinating_council = Column(String(500), nullable=True, index=True, comment="Metropolitan Assembly or Regional Co-ordinating Council")
    name_of_license_officer = Column(String(500), nullable=True, comment="Name of License Officer")
    designation_of_license_officer = Column(String(500), nullable=True, comment="Designation of License Officer")
    date_of_license = Column(Date, nullable=True, index=True, comment="Date of License")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="Last update timestamp")
