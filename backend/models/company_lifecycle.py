from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class CompanyBulletinSource(Base):
    """A Companies Bulletin issue and its immutable source metadata."""

    __tablename__ = "company_bulletin_sources"

    id = Column(Integer, primary_key=True, index=True)
    publication_title = Column(String(255), nullable=False, default="Companies Bulletin")
    source_authority = Column(
        String(255), nullable=False, default="Office of the Registrar of Companies, Ghana"
    )
    volume_number = Column(String(50), nullable=True, index=True)
    issue_date = Column(Date, nullable=True, index=True)
    publication_date = Column(Date, nullable=True, index=True)
    jurisdiction = Column(String(100), nullable=False, default="Ghana")

    source_filename = Column(String(500), nullable=False)
    source_sha256 = Column(String(64), nullable=False, unique=True, index=True)
    source_path = Column(Text, nullable=True)
    document_url = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    page_count = Column(Integer, nullable=True)

    captured_at = Column(DateTime(timezone=True), nullable=True)
    imported_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    extraction_method = Column(String(100), nullable=False, default="pdf-text-layer")
    extraction_version = Column(String(50), nullable=False, default="1.0")
    import_status = Column(String(30), nullable=False, default="IMPORTED", index=True)
    source_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    notices = relationship("CompanyLifecycleNotice", back_populates="bulletin")


class CompanyLifecycleNotice(Base):
    """A company event published in a Companies Bulletin issue."""

    __tablename__ = "company_lifecycle_notices"
    __table_args__ = (
        UniqueConstraint("record_key", name="uq_company_lifecycle_notice_record_key"),
        Index("ix_company_lifecycle_name_type", "company_name", "notice_type"),
        Index("ix_company_lifecycle_registration_type", "registration_number", "notice_type"),
    )

    id = Column(Integer, primary_key=True, index=True)
    bulletin_id = Column(
        Integer, ForeignKey("company_bulletin_sources.id"), nullable=False, index=True
    )
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    record_key = Column(String(64), nullable=False, index=True)

    notice_type = Column(String(60), nullable=False, index=True)
    company_name = Column(String(500), nullable=False, index=True)
    old_company_name = Column(String(500), nullable=True, index=True)
    new_company_name = Column(String(500), nullable=True, index=True)
    registration_number = Column(String(100), nullable=True, index=True)
    notice_reference = Column(String(150), nullable=True, index=True)
    source_item_number = Column(String(50), nullable=True)
    source_page = Column(Integer, nullable=True, index=True)

    publication_date = Column(Date, nullable=True, index=True)
    event_date = Column(Date, nullable=True, index=True)
    effective_date = Column(Date, nullable=True)
    incorporation_date = Column(Date, nullable=True)
    dissolution_date = Column(Date, nullable=True)
    strike_off_date = Column(Date, nullable=True)
    objection_deadline = Column(Date, nullable=True)
    winding_up_date = Column(Date, nullable=True)
    liquidation_date = Column(Date, nullable=True)
    cessation_date = Column(Date, nullable=True)

    statutory_section = Column(String(100), nullable=True)
    act_reference = Column(String(255), nullable=True)
    registrar_name = Column(String(255), nullable=True)
    liquidator_name = Column(String(255), nullable=True)
    liquidator_contact = Column(String(255), nullable=True)
    registered_address = Column(Text, nullable=True)

    raw_text = Column(Text, nullable=True)
    notice_metadata = Column(JSON, nullable=True)
    extraction_confidence = Column(Float, nullable=False, default=0.5)
    review_status = Column(String(30), nullable=False, default="NEEDS_REVIEW", index=True)
    is_verified = Column(Boolean, nullable=False, default=False, index=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    bulletin = relationship("CompanyBulletinSource", back_populates="notices")
    company = relationship("Companies")
