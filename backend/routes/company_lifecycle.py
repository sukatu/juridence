from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.company_lifecycle import CompanyBulletinSource, CompanyLifecycleNotice
from schemas.company_lifecycle import (
    BulletinSourceResponse,
    LifecycleNoticeListResponse,
    LifecycleNoticeResponse,
)


router = APIRouter(prefix="/company-lifecycle", tags=["company-lifecycle"])


@router.get("/notices", response_model=LifecycleNoticeListResponse)
def list_company_lifecycle_notices(
    q: Optional[str] = Query(None, max_length=500),
    notice_type: Optional[str] = Query(None, max_length=60),
    registration_number: Optional[str] = Query(None, max_length=100),
    company_id: Optional[int] = Query(None, ge=1),
    review_status: Optional[str] = Query(None, max_length=40),
    is_verified: Optional[bool] = Query(None),
    min_confidence: float = Query(0.65, ge=0, le=1),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = (
        db.query(CompanyLifecycleNotice)
        .options(joinedload(CompanyLifecycleNotice.bulletin))
        .filter(CompanyLifecycleNotice.extraction_confidence >= min_confidence)
    )
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                CompanyLifecycleNotice.company_name.ilike(term),
                CompanyLifecycleNotice.old_company_name.ilike(term),
                CompanyLifecycleNotice.new_company_name.ilike(term),
                CompanyLifecycleNotice.registration_number.ilike(term),
            )
        )
    if notice_type:
        query = query.filter(CompanyLifecycleNotice.notice_type == notice_type.upper())
    if registration_number:
        query = query.filter(
            CompanyLifecycleNotice.registration_number.ilike(registration_number.strip())
        )
    if company_id:
        query = query.filter(CompanyLifecycleNotice.company_id == company_id)
    if review_status:
        query = query.filter(
            CompanyLifecycleNotice.review_status == review_status.strip().upper()
        )
    if is_verified is not None:
        query = query.filter(CompanyLifecycleNotice.is_verified == is_verified)

    total = query.count()
    rows = (
        query.order_by(
            CompanyLifecycleNotice.publication_date.desc().nullslast(),
            CompanyLifecycleNotice.id.desc(),
        )
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    notices = []
    for row in rows:
        item = LifecycleNoticeResponse.model_validate(row)
        item.source = BulletinSourceResponse.model_validate(row.bulletin)
        notices.append(item)
    return LifecycleNoticeListResponse(
        page=page,
        limit=limit,
        total=total,
        total_pages=ceil(total / limit) if total else 0,
        notices=notices,
    )


@router.get("/sources", response_model=list[BulletinSourceResponse])
def list_company_bulletin_sources(db: Session = Depends(get_db)):
    return (
        db.query(CompanyBulletinSource)
        .order_by(
            CompanyBulletinSource.publication_date.desc().nullslast(),
            CompanyBulletinSource.id.desc(),
        )
        .all()
    )


@router.get("/stats")
def get_company_lifecycle_stats(db: Session = Depends(get_db)):
    source_count = db.query(func.count(CompanyBulletinSource.id)).scalar() or 0
    notice_count = db.query(func.count(CompanyLifecycleNotice.id)).scalar() or 0
    by_type = dict(
        db.query(CompanyLifecycleNotice.notice_type, func.count(CompanyLifecycleNotice.id))
        .group_by(CompanyLifecycleNotice.notice_type)
        .order_by(CompanyLifecycleNotice.notice_type)
        .all()
    )
    review_counts = dict(
        db.query(CompanyLifecycleNotice.review_status, func.count(CompanyLifecycleNotice.id))
        .group_by(CompanyLifecycleNotice.review_status)
        .all()
    )
    return {
        "bulletin_sources": source_count,
        "lifecycle_notices": notice_count,
        "notices_by_type": by_type,
        "review_status": review_counts,
    }
