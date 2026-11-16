from math import ceil
import re
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, desc, func, or_, tuple_
from sqlalchemy.orm import Session

from database import get_db
from models.banks import Banks
from models.pending_case_party import PendingCaseParty
from models.reported_cases import ReportedCases
from services.pending_case_party_service import normalize_party_name


router = APIRouter(prefix="/api/dashboard-search", tags=["dashboard-search"])


def _serialize_datetime(value):
    return value.isoformat() if value else None


def _token_variants(token: str):
    variants = {token, re.sub(r"(.)\1+", r"\1", token)}
    if len(token) >= 4:
        variants.update(token[:index] + character + token[index:] for index, character in enumerate(token))
    return variants


def _token_search_condition(column, token: str):
    return or_(*[column.ilike(f"%{variant}%") for variant in _token_variants(token)])


def _token_matches_value(token: str, value: str) -> bool:
    return any(variant in value for variant in _token_variants(token))


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


@router.get("/pending-cases")
async def search_pending_cases(
    q: str = Query("", max_length=200),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
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
        matched = [
            party.party_name
            for party in parties
            if tokens and all(
                _token_matches_value(token, party.normalized_party_name) for token in tokens
            )
        ]
        if not matched:
            matched = [party.party_name for party in parties if not party.is_source_bank]

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
