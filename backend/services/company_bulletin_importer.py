from dataclasses import asdict
from datetime import datetime, timezone
from typing import Dict

from sqlalchemy.orm import Session

from models.company_lifecycle import CompanyBulletinSource, CompanyLifecycleNotice
from services.company_bulletin_extractor import (
    EXTRACTION_VERSION,
    ExtractedBulletin,
    notice_record_key,
)


def import_bulletin(db: Session, bulletin: ExtractedBulletin) -> Dict[str, int]:
    """Insert one bulletin and any notices that are not already present."""
    source = (
        db.query(CompanyBulletinSource)
        .filter(CompanyBulletinSource.source_sha256 == bulletin.source_sha256)
        .first()
    )
    source_created = 0
    if not source:
        source = CompanyBulletinSource(
            publication_title="Companies Bulletin",
            source_authority="Office of the Registrar of Companies, Ghana",
            volume_number=bulletin.volume_number,
            issue_date=bulletin.issue_date,
            publication_date=bulletin.publication_date,
            jurisdiction="Ghana",
            source_filename=bulletin.source_filename,
            source_sha256=bulletin.source_sha256,
            source_path=str(bulletin.source_path),
            file_size_bytes=bulletin.file_size_bytes,
            page_count=bulletin.page_count,
            captured_at=datetime.now(timezone.utc),
            extraction_method="pdfplumber-text-layer",
            extraction_version=EXTRACTION_VERSION,
            import_status="IMPORTED",
            source_metadata=bulletin.metadata,
        )
        db.add(source)
        db.flush()
        source_created = 1

    inserted = 0
    skipped = 0
    for extracted in bulletin.notices:
        record_key = notice_record_key(bulletin.source_sha256, extracted)
        exists = (
            db.query(CompanyLifecycleNotice.id)
            .filter(CompanyLifecycleNotice.record_key == record_key)
            .first()
        )
        if exists:
            skipped += 1
            continue

        values = asdict(extracted)
        metadata = values.pop("metadata", {})
        notice = CompanyLifecycleNotice(
            bulletin_id=source.id,
            record_key=record_key,
            notice_metadata=metadata,
            **values,
        )
        db.add(notice)
        inserted += 1

    db.commit()
    return {
        "sources_created": source_created,
        "notices_inserted": inserted,
        "notices_skipped": skipped,
    }
