from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class PendingCaseParty(Base):
    __tablename__ = "pending_case_parties"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("reported_cases.id"), nullable=False, index=True)
    bank_id = Column(Integer, ForeignKey("banks.id"), nullable=False, index=True)
    party_name = Column(String(500), nullable=False)
    normalized_party_name = Column(String(500), nullable=False, index=True)
    party_side = Column(String(30), nullable=False, default="unknown")
    party_order = Column(Integer, nullable=False, default=1)
    is_source_bank = Column(Boolean, nullable=False, default=False, index=True)
    source_case_status = Column(String(100), nullable=True, index=True)
    source_file = Column(String(255), nullable=True)
    source_created_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    case = relationship("ReportedCases", backref="pending_case_parties")
    bank = relationship("Banks", backref="pending_case_parties")

    __table_args__ = (
        UniqueConstraint(
            "case_id",
            "bank_id",
            "normalized_party_name",
            name="uq_pending_case_party_case_bank_name",
        ),
    )
