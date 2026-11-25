from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class BulletinSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    publication_title: str
    source_authority: str
    volume_number: Optional[str] = None
    issue_date: Optional[date] = None
    publication_date: Optional[date] = None
    jurisdiction: str
    source_filename: str
    source_sha256: str
    document_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    page_count: Optional[int] = None
    captured_at: Optional[datetime] = None
    imported_at: datetime
    extraction_method: str
    extraction_version: str
    import_status: str
    source_metadata: Optional[Dict[str, Any]] = None


class LifecycleNoticeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bulletin_id: int
    company_id: Optional[int] = None
    notice_type: str
    company_name: str
    old_company_name: Optional[str] = None
    new_company_name: Optional[str] = None
    registration_number: Optional[str] = None
    notice_reference: Optional[str] = None
    source_item_number: Optional[str] = None
    source_page: Optional[int] = None
    publication_date: Optional[date] = None
    event_date: Optional[date] = None
    effective_date: Optional[date] = None
    incorporation_date: Optional[date] = None
    dissolution_date: Optional[date] = None
    strike_off_date: Optional[date] = None
    objection_deadline: Optional[date] = None
    winding_up_date: Optional[date] = None
    liquidation_date: Optional[date] = None
    cessation_date: Optional[date] = None
    statutory_section: Optional[str] = None
    act_reference: Optional[str] = None
    registrar_name: Optional[str] = None
    liquidator_name: Optional[str] = None
    registered_address: Optional[str] = None
    extraction_confidence: float
    review_status: str
    is_verified: bool
    source: Optional[BulletinSourceResponse] = None


class LifecycleNoticeListResponse(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    notices: List[LifecycleNoticeResponse]
