from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Date
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class GazetteType(str, enum.Enum):
    # Legal Notices
    CHANGE_OF_NAME = "CHANGE_OF_NAME"
    CHANGE_OF_DATE_OF_BIRTH = "CHANGE_OF_DATE_OF_BIRTH"
    CHANGE_OF_PLACE_OF_BIRTH = "CHANGE_OF_PLACE_OF_BIRTH"
    APPOINTMENT_OF_MARRIAGE_OFFICERS = "APPOINTMENT_OF_MARRIAGE_OFFICERS"
    
    # General Categories
    LEGAL_NOTICE = "LEGAL_NOTICE"
    BUSINESS_NOTICE = "BUSINESS_NOTICE"
    PROPERTY_NOTICE = "PROPERTY_NOTICE"
    PERSONAL_NOTICE = "PERSONAL_NOTICE"
    REGULATORY_NOTICE = "REGULATORY_NOTICE"
    COURT_NOTICE = "COURT_NOTICE"
    BANKRUPTCY_NOTICE = "BANKRUPTCY_NOTICE"
    PROBATE_NOTICE = "PROBATE_NOTICE"
    OTHER = "OTHER"

class GazetteStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"
    REVIEWED = "REVIEWED"
    CANCELLED = "CANCELLED"

class GazettePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class Gazette(Base):
    """
    Gazette Entries Table - Optimized for Change of Name Notices
    Supports master + variant rows for each name (Current, Old, each Alias)
    """
    __tablename__ = "gazette_entries"

    id = Column(Integer, primary_key=True, index=True)
    
    # ========================================
    # Name Variant Management (for master/variant row linking)
    # ========================================
    name_set_id = Column(String(200), index=True, comment="Links master and variant rows: '2025-{filename}-{item_number}-{sequence}'")
    name_role = Column(String(20), index=True, comment="'master' | 'old' | 'alias' | 'other'")
    name_value = Column(String(500), index=True, comment="The specific name for this row (searchable)")
    
    # ========================================
    # Source Identification (Required)
    # ========================================
    gazette_number = Column(String(50), nullable=False, index=True, comment="Gazette number (e.g., '94', '101')")
    gazette_date = Column(Date, index=True, comment="Gazette publication date")
    gazette_page = Column(Integer, comment="Page number in gazette")
    item_number = Column(String(50), nullable=False, index=True, comment="Sequential Item No. (e.g., '24024') - unique record ID")
    source_item_number = Column(String(50), comment="Item number as printed in source")
    
    # ========================================
    # Document Information
    # ========================================
    document_filename = Column(String(255), nullable=False, index=True, comment="Source PDF filename")
    document_url = Column(String(500), comment="URL to document if stored externally")
    document_size = Column(Integer, comment="File size in bytes")
    
    # ========================================
    # Name Information
    # ========================================
    current_name = Column(String(500), index=True, comment="Current/New name (same in all rows for reporting)")
    old_name = Column(String(500), index=True, comment="Former name (if name_role = 'old', this contains the variant)")
    alias_names = Column(JSONB, comment="Array of aliases (stored as JSONB for master row)")
    other_names = Column(Text, comment="Other names not in old_name or alias_names")
    
    # ========================================
    # Person Identification
    # ========================================
    gender = Column(String(10), index=True, comment="'Male' | 'Female' | NULL")
    profession = Column(String(200), comment="Current profession/occupation")
    address = Column(Text, comment="Physical address or P.O. Box")
    
    # ========================================
    # Change Information
    # ========================================
    effective_date_of_change = Column(Date, comment="Date the change took effect")
    effective_date = Column(Date, comment="Alias for effective_date_of_change")
    
    # ========================================
    # Additional Details
    # ========================================
    remarks = Column(Text, comment="Correction notices, confirmation details, or other notes")
    source = Column(String(200), comment="Source authority (e.g., 'High Court', 'Registrar General')")
    reference_number = Column(String(100), index=True, comment="Reference number for linking across databases")
    
    # ========================================
    # Gazette Type and Classification
    # ========================================
    gazette_type = Column(Enum(GazetteType), nullable=False, default=GazetteType.CHANGE_OF_NAME, index=True, comment="Type of notice")
    status = Column(Enum(GazetteStatus), default=GazetteStatus.PUBLISHED, index=True, comment="Status of entry")
    priority = Column(Enum(GazettePriority), default=GazettePriority.MEDIUM, comment="Priority level")
    
    # ========================================
    # Dates
    # ========================================
    publication_date = Column(DateTime(timezone=True), nullable=False, default=func.now(), index=True, comment="When entry was published")
    expiry_date = Column(Date, comment="Optional expiry date")
    
    # ========================================
    # Location Information
    # ========================================
    jurisdiction = Column(String(100), default="Ghana", comment="e.g., 'Greater Accra', 'Ashanti Region'")
    court_location = Column(String(200), comment="Court or location where change was registered")
    
    # ========================================
    # Links to Other Databases
    # ========================================
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True, index=True, comment="Link to people table for cross-database searching")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True, comment="Link to companies table (Company Registry Database)")
    court_case_id = Column(Integer, nullable=True, index=True, comment="Link to court cases (Court Judgement and Ruling Database)")
    cause_list_id = Column(Integer, nullable=True, index=True, comment="Link to cause list (Cause List Database)")
    bank_id = Column(Integer, ForeignKey("banks.id"), nullable=True, index=True)
    insurance_id = Column(Integer, ForeignKey("insurance.id"), nullable=True, index=True)
    
    # ========================================
    # Search and Indexing
    # ========================================
    # search_text = Column(TSVECTOR, comment="Full-text search vector (auto-generated from names)")  # Not in table yet
    keywords = Column(JSON, comment="Array of keywords for search")
    tags = Column(JSON, comment="Array of tags for categorization")
    
    # ========================================
    # Legacy/Compatibility Fields
    # ========================================
    title = Column(String(500), index=True, comment="Legacy: Title field (derived from current_name)")
    description = Column(Text, comment="Legacy: Description field")
    content = Column(Text, comment="Legacy: Full content text")
    summary = Column(Text, comment="Legacy: Summary text")
    gazette_metadata = Column(JSONB, comment="Legacy: Additional metadata")
    page_number = Column(Integer, comment="Legacy: Page number (same as gazette_page)")
    
    # Legacy: new_name is same as current_name
    new_name = Column(String(500), index=True, comment="Legacy: Name adopted or confirmed (same as current_name)")
    
    # Change of Date of Birth Fields (for future expansion)
    old_date_of_birth = Column(DateTime)
    new_date_of_birth = Column(DateTime)
    place_of_birth = Column(String(200))
    
    # Change of Place of Birth Fields (for future expansion)
    old_place_of_birth = Column(String(200))
    new_place_of_birth = Column(String(200))
    
    # Marriage Officer Fields (for future expansion)
    officer_name = Column(String(200))
    officer_title = Column(String(100))
    appointment_authority = Column(String(200))
    jurisdiction_area = Column(String(200))
    
    # ========================================
    # Edit and Reporting Tracking
    # ========================================
    edit_count = Column(Integer, default=0, comment="Number of times entry has been edited")
    last_edited_at = Column(DateTime(timezone=True), comment="Last edit timestamp")
    report_count = Column(Integer, default=0, comment="Number of times entry has been reported")
    last_reported_at = Column(DateTime(timezone=True), comment="Last report timestamp")
    
    # ========================================
    # Verification Fields
    # ========================================
    is_verified = Column(Boolean, default=False, comment="Whether entry has been verified")
    verification_date = Column(DateTime(timezone=True), comment="When entry was verified")
    verification_notes = Column(Text, comment="Notes from verification")
    
    # ========================================
    # System Fields
    # ========================================
    created_by = Column(Integer, ForeignKey("users.id"), comment="User ID who created this record")
    updated_by = Column(Integer, ForeignKey("users.id"), comment="User ID who last updated this record")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="Last update timestamp")
    
    # ========================================
    # Visibility
    # ========================================
    is_public = Column(Boolean, default=True, comment="Whether entry is publicly visible")
    is_featured = Column(Boolean, default=False, comment="Whether entry is featured")
    
    # Relationships
    person = relationship("People", back_populates="gazette_entries")
    company = relationship("Companies", back_populates="gazette_entries")
    bank = relationship("Banks", back_populates="gazette_entries")
    insurance = relationship("Insurance", back_populates="gazette_entries")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])

class GazetteSearch(Base):
    __tablename__ = "gazette_search_index"
    
    id = Column(Integer, primary_key=True, index=True)
    gazette_id = Column(Integer, ForeignKey("gazette_entries.id"), nullable=False)
    search_text = Column(Text, nullable=False, index=True)  # Combined searchable text
    person_name = Column(String(255), index=True)
    company_name = Column(String(255), index=True)
    keywords_text = Column(Text, index=True)  # Flattened keywords for search
    
    # Relationships
    gazette_entry = relationship("Gazette")

class GazetteView(Base):
    __tablename__ = "gazette_views"
    
    id = Column(Integer, primary_key=True, index=True)
    gazette_id = Column(Integer, ForeignKey("gazette_entries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    gazette_entry = relationship("Gazette")
    user = relationship("User")
