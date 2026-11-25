from math import ceil
import json
import re
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, desc, exists, func, or_, tuple_
from sqlalchemy.orm import Session

from database import get_db
from models.banks import Banks
from models.companies import Companies
from models.company_lifecycle import CompanyBulletinSource, CompanyLifecycleNotice
from models.gazette import Gazette
from models.insurance import Insurance
from models.pending_case_party import PendingCaseParty
from models.people import People
from models.reported_cases import ReportedCases
from services.pending_case_party_service import extract_case_parties, normalize_party_name


router = APIRouter(prefix="/api/dashboard-search", tags=["dashboard-search"])


def _serialize_datetime(value):
    return value.isoformat() if value else None


def _latest_value(db, model, *columns):
    values = [db.query(func.max(column)).scalar() for column in columns]
    return max(
        (value for value in values if value is not None),
        key=lambda value: value.isoformat(),
        default=None,
    )


def _token_variants(token: str):
    variants = {token, re.sub(r"(.)\1+", r"\1", token)}
    if len(token) >= 4:
        variants.update(token[:index] + character + token[index:] for index, character in enumerate(token))
    return variants


def _token_search_condition(column, token: str):
    return or_(*[column.ilike(f"%{variant}%") for variant in _token_variants(token)])


def _token_matches_value(token: str, value: str) -> bool:
    return any(variant in value for variant in _token_variants(token))


def _party_name_matches(candidate: str, names):
    normalized_candidate = normalize_party_name(candidate)
    if not normalized_candidate:
        return False
    return any(
        normalized_name == normalized_candidate
        or normalized_name in normalized_candidate
        or normalized_candidate in normalized_name
        for normalized_name in names
        if len(normalized_name) >= 4
    )


@router.get("/stats")
async def get_search_stats(
    db: Session = Depends(get_db),
):
    indexed_parties = db.query(PendingCaseParty).count()
    pending_cases = db.query(func.count(func.distinct(PendingCaseParty.case_id))).scalar() or 0
    source_banks = db.query(func.count(func.distinct(PendingCaseParty.bank_id))).scalar() or 0
    sources = (
        db.query(Banks.id, Banks.name, func.count(func.distinct(PendingCaseParty.case_id)))
        .join(PendingCaseParty, PendingCaseParty.bank_id == Banks.id)
        .group_by(Banks.id, Banks.name)
        .order_by(Banks.name.asc())
        .all()
    )
    return {
        "indexed_parties": indexed_parties,
        "pending_cases": pending_cases,
        "source_banks": source_banks,
        "sources": [
            {"id": bank_id, "name": bank_name, "case_count": case_count}
            for bank_id, bank_name, case_count in sources
        ],
    }


@router.get("/overview")
async def get_dashboard_overview(db: Session = Depends(get_db)):
    """Return a read-only operational summary of the indexed Juridence datasets."""
    total_cases = db.query(func.count(ReportedCases.id)).scalar() or 0
    pending_cases = db.query(func.count(func.distinct(PendingCaseParty.case_id))).scalar() or 0
    judgments = max(total_cases - pending_cases, 0)
    indexed_parties = db.query(func.count(PendingCaseParty.id)).scalar() or 0
    source_banks = db.query(func.count(func.distinct(PendingCaseParty.bank_id))).scalar() or 0

    active_people = db.query(func.count(People.id)).filter(People.status == "active").scalar() or 0
    active_banks = db.query(func.count(Banks.id)).filter(Banks.is_active.is_(True)).scalar() or 0
    active_insurance = (
        db.query(func.count(Insurance.id)).filter(Insurance.is_active.is_(True)).scalar() or 0
    )
    active_companies = (
        db.query(func.count(Companies.id)).filter(Companies.is_active.is_(True)).scalar() or 0
    )

    gazette_records = db.query(func.count(Gazette.id)).scalar() or 0
    lifecycle_notices = db.query(func.count(CompanyLifecycleNotice.id)).scalar() or 0
    bulletin_sources = db.query(func.count(CompanyBulletinSource.id)).scalar() or 0
    lifecycle_verified = (
        db.query(func.count(CompanyLifecycleNotice.id))
        .filter(CompanyLifecycleNotice.is_verified.is_(True))
        .scalar()
        or 0
    )
    lifecycle_by_type = dict(
        db.query(CompanyLifecycleNotice.notice_type, func.count(CompanyLifecycleNotice.id))
        .group_by(CompanyLifecycleNotice.notice_type)
        .all()
    )

    case_updated = _latest_value(db, ReportedCases, ReportedCases.updated_at, ReportedCases.created_at, ReportedCases.date)
    gazette_updated = _latest_value(db, Gazette, Gazette.updated_at, Gazette.created_at, Gazette.publication_date)
    lifecycle_updated = _latest_value(
        db,
        CompanyBulletinSource,
        CompanyBulletinSource.imported_at,
        CompanyBulletinSource.captured_at,
        CompanyBulletinSource.publication_date,
    )
    entity_updated = max(
        (
            value
            for value in [
                _latest_value(db, People, People.updated_at, People.created_at),
                _latest_value(db, Banks, Banks.updated_at, Banks.created_at),
                _latest_value(db, Insurance, Insurance.updated_at, Insurance.created_at),
                _latest_value(db, Companies, Companies.updated_at, Companies.created_at),
            ]
            if value is not None
        ),
        key=lambda value: value.isoformat(),
        default=None,
    )

    recent_updates = []
    latest_case = db.query(ReportedCases).order_by(ReportedCases.id.desc()).first()
    if latest_case:
        recent_updates.append(
            {
                "source": "Court records",
                "record": latest_case.title or "Untitled court record",
                "detail": latest_case.suit_reference_number or latest_case.citation or "Reference not recorded",
                "updated_at": _serialize_datetime(latest_case.updated_at or latest_case.created_at or latest_case.date),
            }
        )
    latest_notice = db.query(CompanyLifecycleNotice).order_by(CompanyLifecycleNotice.id.desc()).first()
    if latest_notice:
        recent_updates.append(
            {
                "source": "Companies Bulletin",
                "record": latest_notice.company_name,
                "detail": str(latest_notice.notice_type or "Company notice").replace("_", " ").title(),
                "updated_at": _serialize_datetime(latest_notice.created_at or latest_notice.publication_date),
            }
        )
    latest_gazette = db.query(Gazette).order_by(Gazette.id.desc()).first()
    if latest_gazette:
        recent_updates.append(
            {
                "source": "Ghana Gazette",
                "record": latest_gazette.current_name or latest_gazette.name_value or latest_gazette.title or "Gazette record",
                "detail": f"Gazette {latest_gazette.gazette_number} · Item {latest_gazette.item_number}",
                "updated_at": _serialize_datetime(latest_gazette.created_at or latest_gazette.publication_date),
            }
        )
    latest_bulletin = db.query(CompanyBulletinSource).order_by(CompanyBulletinSource.id.desc()).first()
    if latest_bulletin:
        recent_updates.append(
            {
                "source": "Data ingestion",
                "record": latest_bulletin.source_filename,
                "detail": f"Companies Bulletin · {latest_bulletin.import_status}",
                "updated_at": _serialize_datetime(latest_bulletin.imported_at or latest_bulletin.captured_at),
            }
        )

    return {
        "totals": {
            "searchable_subjects": active_people + active_banks + active_insurance + active_companies,
            "people": active_people,
            "banks": active_banks,
            "insurance": active_insurance,
            "companies": active_companies,
            "court_records": total_cases,
            "pending_cases": pending_cases,
            "judgments": judgments,
            "indexed_case_parties": indexed_parties,
            "source_banks": source_banks,
            "gazette_records": gazette_records,
            "lifecycle_notices": lifecycle_notices,
            "bulletin_sources": bulletin_sources,
            "lifecycle_verified": lifecycle_verified,
        },
        "lifecycle_by_type": lifecycle_by_type,
        "coverage": [
            {
                "key": "subjects",
                "database": "Entity and individual index",
                "records": active_people + active_banks + active_insurance + active_companies,
                "source": "People, companies, banks and insurers",
                "updated_at": _serialize_datetime(entity_updated),
            },
            {
                "key": "cases",
                "database": "Court records",
                "records": total_cases,
                "source": "Pending cases and decided judgments",
                "updated_at": _serialize_datetime(case_updated),
            },
            {
                "key": "gazette",
                "database": "Ghana Gazette",
                "records": gazette_records,
                "source": "Published Gazette entries",
                "updated_at": _serialize_datetime(gazette_updated),
            },
            {
                "key": "lifecycle",
                "database": "Company lifecycle notices",
                "records": lifecycle_notices,
                "source": f"{bulletin_sources} Companies Bulletin sources",
                "updated_at": _serialize_datetime(lifecycle_updated),
            },
        ],
        "recent_updates": recent_updates,
    }


@router.get("/pending-cases")
async def search_pending_cases(
    q: str = Query("", max_length=200),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    bank_id: Optional[int] = Query(None, ge=1),
    db: Session = Depends(get_db),
):
    normalized_query = normalize_party_name(q)
    tokens = normalized_query.split()

    key_query = (
        db.query(
            PendingCaseParty.case_id.label("case_id"),
            PendingCaseParty.bank_id.label("bank_id"),
            func.max(
                func.coalesce(
                    PendingCaseParty.source_created_at,
                    ReportedCases.date,
                    ReportedCases.created_at,
                )
            ).label("sort_date"),
        )
        .join(ReportedCases, ReportedCases.id == PendingCaseParty.case_id)
    )

    if bank_id:
        key_query = key_query.filter(PendingCaseParty.bank_id == bank_id)

    if tokens:
        party_match = and_(
            *[
                _token_search_condition(PendingCaseParty.normalized_party_name, token)
                for token in tokens
            ]
        )
        title_match = and_(
            *[
                func.lower(func.coalesce(ReportedCases.title, "")).ilike(f"%{token}%")
                for token in tokens
            ]
        )
        suit_match = func.lower(func.coalesce(ReportedCases.suit_reference_number, "")).ilike(
            f"%{q.strip().lower()}%"
        )
        key_query = key_query.filter(or_(party_match, title_match, suit_match))

    key_query = key_query.group_by(PendingCaseParty.case_id, PendingCaseParty.bank_id)
    total = key_query.count()
    key_rows = (
        key_query.order_by(desc("sort_date"), PendingCaseParty.case_id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    keys = [(row.case_id, row.bank_id) for row in key_rows]

    if not keys:
        return {
            "query": q,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": ceil(total / limit) if total else 0,
            "results": [],
        }

    rows = (
        db.query(PendingCaseParty, ReportedCases, Banks)
        .join(ReportedCases, ReportedCases.id == PendingCaseParty.case_id)
        .join(Banks, Banks.id == PendingCaseParty.bank_id)
        .filter(tuple_(PendingCaseParty.case_id, PendingCaseParty.bank_id).in_(keys))
        .order_by(PendingCaseParty.party_side.asc(), PendingCaseParty.party_order.asc())
        .all()
    )

    grouped = {}
    for party, case, bank in rows:
        key = (party.case_id, party.bank_id)
        record = grouped.setdefault(
            key,
            {"case": case, "bank": bank, "parties": [], "source_status": None, "source_created_at": None},
        )
        record["parties"].append(party)
        record["source_status"] = record["source_status"] or party.source_case_status
        record["source_created_at"] = record["source_created_at"] or party.source_created_at

    results = []
    for case_id, source_bank_id in keys:
        record = grouped[(case_id, source_bank_id)]
        case = record["case"]
        bank = record["bank"]
        parties = record["parties"]
        matched_records = [
            party
            for party in parties
            if tokens and all(
                _token_matches_value(token, party.normalized_party_name) for token in tokens
            )
        ]
        if not matched_records:
            matched_records = [party for party in parties if not party.is_source_bank]
        matched = [party.party_name for party in matched_records]

        results.append(
            {
                "case_id": case.id,
                "case_title": case.title,
                "suit_number": case.suit_reference_number,
                "court_type": case.court_type,
                "location": case.town,
                "status": record["source_status"] or case.status,
                "created_on": _serialize_datetime(
                    record["source_created_at"] or case.date or case.created_at
                ),
                "source_bank_id": bank.id,
                "source_bank": bank.name,
                "matched_party": matched[0] if matched else None,
                "matched_parties": matched,
                "matched_is_source_bank": any(party.is_source_bank for party in matched_records),
            }
        )

    return {
        "query": q,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": ceil(total / limit) if total else 0,
        "results": results,
    }


@router.get("/judgments")
async def search_judgments(
    names: str = Query(..., min_length=2, max_length=4000),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Find reported judgments whose case-title parties match an entity name or alias."""
    try:
        supplied_names = json.loads(names)
    except (json.JSONDecodeError, TypeError):
        supplied_names = [names]

    if not isinstance(supplied_names, list):
        supplied_names = [names]

    normalized_names = []
    display_names = []
    for value in supplied_names[:25]:
        if not isinstance(value, str):
            continue
        display_name = " ".join(value.split())
        normalized_name = normalize_party_name(display_name)
        if len(normalized_name) >= 4 and normalized_name not in normalized_names:
            display_names.append(display_name)
            normalized_names.append(normalized_name)

    if not display_names:
        return {"page": page, "limit": limit, "total": 0, "total_pages": 0, "results": []}

    title_conditions = [ReportedCases.title.ilike(f"%{name}%") for name in display_names]
    candidate_cases = (
        db.query(ReportedCases)
        .filter(
            ReportedCases.title.isnot(None),
            or_(ReportedCases.published.is_(True), ReportedCases.published.is_(None)),
            or_(*title_conditions),
            ~exists().where(PendingCaseParty.case_id == ReportedCases.id),
        )
        .order_by(desc(ReportedCases.date), desc(ReportedCases.id))
        .all()
    )

    matched_cases = []
    for case in candidate_cases:
        parties = [party["party_name"] for party in extract_case_parties(case.title)]
        title_values = parties or [case.title]
        if any(_party_name_matches(value, normalized_names) for value in title_values):
            matched_cases.append(case)

    total = len(matched_cases)
    page_cases = matched_cases[(page - 1) * limit:page * limit]
    results = [
        {
            "id": case.id,
            "title": case.title,
            "suit_reference_number": case.suit_reference_number,
            "date": _serialize_datetime(case.date),
            "court_type": case.court_type,
            "court_division": case.court_division,
            "town": case.town,
            "region": case.region,
            "status": case.case_progress or case.status,
            "area_of_law": case.area_of_law,
            "presiding_judge": case.presiding_judge or case.judgement_by,
            "citation": case.citation or case.dl_citation_no,
        }
        for case in page_cases
    ]

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": ceil(total / limit) if total else 0,
        "results": results,
    }
