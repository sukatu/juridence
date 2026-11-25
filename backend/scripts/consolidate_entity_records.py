"""Consolidate high-confidence entity aliases without deleting source records.

The command is a dry run unless ``--apply`` is supplied. It performs two
conservative cleanups:

* adds case-source spelling variants to the canonical bank record; and
* archives punctuation-only duplicate legal/institution people records when
  none of the records contains identifying data.

No table or row is deleted. Archived people remain available for audit.
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

from sqlalchemy import func

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import models  # noqa: F401,E402 - register relationship targets before querying
from models.gazette import Gazette  # noqa: F401,E402
from database import SessionLocal
from models.banks import Banks
from models.pending_case_party import PendingCaseParty
from models.people import People


LEGAL_ROLE_PATTERN = re.compile(
    r"(?:J\.?S\.?C|J\.?A|JUSTICE|JUDGE|PRESIDING|ATTORNEY|COUNSEL|ESQ)",
    re.IGNORECASE,
)
INSTITUTION_PATTERN = re.compile(
    r"\b(?:BANK|INSURANCE|ASSURANCE|LIMITED|LTD|PLC|COMPANY|ENTERPRISE|"
    r"UNIVERSITY|SCHOOL|HOSPITAL|MINING|MINES|MICRO\s*FINANCE|BROAD\s*CASTING|"
    r"CONSTRUCTION|PROPERTIES|COLD\s*STORE)\b",
    re.IGNORECASE,
)
CORPORATE_TOKENS = {
    "BANK",
    "GH",
    "GHA",
    "GHANA",
    "LTD",
    "LIMITED",
    "PLC",
    "INC",
    "CORP",
    "CORPORATION",
}


def normalized_name(value: str | None) -> str:
    return "".join(re.findall(r"[a-z0-9]+", str(value or "").casefold()))


def cleaned_name(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def unpack_names(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        candidate = value.get("name") or value.get("value") or value.get("previous_name")
        return [candidate] if candidate else []
    if isinstance(value, (list, tuple, set)):
        names = []
        for entry in value:
            names.extend(unpack_names(entry))
        return names
    return []


def merge_names(canonical: str, *values) -> list[str]:
    seen = {normalized_name(canonical)}
    merged = []
    for value in values:
        for entry in unpack_names(value):
            entry = cleaned_name(entry)
            key = normalized_name(entry)
            if entry and key and key not in seen:
                seen.add(key)
                merged.append(entry)
    return merged


def plausible_bank_alias(canonical: str, alias: str) -> bool:
    alias = cleaned_name(alias)
    if not alias or alias.count("(") != alias.count(")"):
        return False
    canonical_tokens = set(re.findall(r"[A-Z0-9]+", canonical.upper()))
    alias_tokens = set(re.findall(r"[A-Z0-9]+", alias.upper()))
    if not (1 < len(alias_tokens) <= 7 and alias_tokens.issubset(canonical_tokens | CORPORATE_TOKENS)):
        return False
    legal_forms = alias_tokens & {"LTD", "LIMITED", "PLC"}
    if "PLC" in legal_forms and legal_forms & {"LTD", "LIMITED"}:
        return False
    return normalized_name(alias) != normalized_name(canonical)


def person_has_identity(person: People) -> bool:
    return any(
        (
            person.id_number,
            person.date_of_birth,
            person.email,
            person.phone_number,
        )
    )


def consolidate_bank_aliases(db, apply: bool) -> tuple[int, int]:
    party_rows = (
        db.query(PendingCaseParty.bank_id, PendingCaseParty.party_name)
        .filter(PendingCaseParty.is_source_bank.is_(True))
        .distinct()
        .all()
    )
    aliases_by_bank = defaultdict(list)
    for bank_id, party_name in party_rows:
        aliases_by_bank[bank_id].append(party_name)

    changed_banks = 0
    added_aliases = 0
    for bank in db.query(Banks).filter(Banks.is_active.is_(True)).order_by(Banks.id):
        candidates = [
            alias
            for alias in aliases_by_bank.get(bank.id, [])
            if plausible_bank_alias(bank.name, alias)
        ]
        aliases = merge_names(bank.name, bank.previous_names, sorted(candidates))
        existing = merge_names(bank.name, bank.previous_names)
        if aliases == existing:
            continue
        changed_banks += 1
        added_aliases += len(aliases) - len(existing)
        print(f"BANK {bank.id} {bank.name}: +{len(aliases) - len(existing)} aliases")
        if apply:
            bank.previous_names = aliases

    return changed_banks, added_aliases


def consolidate_people(db, apply: bool) -> tuple[int, int]:
    active_people = (
        db.query(People)
        .filter(func.lower(People.status).in_(("active", "archived_duplicate")))
        .order_by(People.id)
        .all()
    )
    groups = defaultdict(list)
    for person in active_people:
        groups[normalized_name(person.full_name)].append(person)

    changed_groups = 0
    archived_people = 0
    for key, people in groups.items():
        active = [person for person in people if str(person.status).lower() == "active"]
        if not key or len(active) < 2 or any(person_has_identity(person) for person in active):
            continue
        names = [person.full_name for person in active]
        if not any(LEGAL_ROLE_PATTERN.search(name or "") or INSTITUTION_PATTERN.search(name or "") for name in names):
            continue

        canonical = active[0]
        duplicates = active[1:]
        aliases = merge_names(canonical.full_name, canonical.previous_names, names[1:])
        changed_groups += 1
        archived_people += len(duplicates)
        print(
            f"PERSON {canonical.id} {canonical.full_name}: "
            f"archive {len(duplicates)} punctuation variants"
        )
        if apply:
            canonical.previous_names = aliases
            for duplicate in duplicates:
                duplicate.status = "archived_duplicate"
                duplicate.notes = (
                    f"{duplicate.notes.rstrip()}\n" if duplicate.notes else ""
                ) + f"Canonical duplicate: people.id={canonical.id}"

    return changed_groups, archived_people


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="commit the consolidation")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        bank_count, alias_count = consolidate_bank_aliases(db, args.apply)
        people_groups, people_count = consolidate_people(db, args.apply)
        print(
            "SUMMARY "
            f"banks={bank_count} aliases_added={alias_count} "
            f"people_groups={people_groups} people_archived={people_count} "
            f"mode={'apply' if args.apply else 'dry-run'}"
        )
        if args.apply:
            db.commit()
        else:
            db.rollback()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
