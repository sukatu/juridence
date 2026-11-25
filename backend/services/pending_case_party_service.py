import re
import unicodedata
from typing import Dict, List, Sequence

from models.pending_case_party import PendingCaseParty


CASE_SEPARATOR = re.compile(r"\b(?:V|VS|VRS|VERSUS)\.?\s+", re.IGNORECASE)
NUMBERED_PARTY = re.compile(r"(?:^|\s+)(?:\d+[.)])\s*")
NON_ALPHANUMERIC = re.compile(r"[^a-z0-9]+")


def normalize_party_name(value: str) -> str:
    if not value:
        return ""
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return " ".join(NON_ALPHANUMERIC.sub(" ", ascii_value.casefold()).split())


def _clean_party_name(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" ,;:-")


def _split_numbered_parties(value: str) -> List[str]:
    value = value.strip()
    matches = list(NUMBERED_PARTY.finditer(value))
    if not matches:
        cleaned = _clean_party_name(value)
        return [cleaned] if cleaned else []

    prefix = _clean_party_name(value[: matches[0].start()])
    parties = [prefix] if prefix else []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(value)
        party = _clean_party_name(value[match.end() : end])
        if party:
            parties.append(party)
    return parties


def extract_case_parties(case_title: str) -> List[Dict[str, object]]:
    if not case_title:
        return []

    sides = CASE_SEPARATOR.split(case_title.strip(), maxsplit=1)
    if len(sides) != 2:
        return []

    extracted = []
    for side_name, side_value in (("claimant", sides[0]), ("respondent", sides[1])):
        for party_order, party_name in enumerate(_split_numbered_parties(side_value), start=1):
            normalized = normalize_party_name(party_name)
            if normalized:
                extracted.append(
                    {
                        "party_name": party_name,
                        "normalized_party_name": normalized,
                        "party_side": side_name,
                        "party_order": party_order,
                    }
                )
    return extracted


def _is_source_bank(party_name: str, aliases: Sequence[str]) -> bool:
    normalized_party = normalize_party_name(party_name)
    for alias in aliases:
        normalized_alias = normalize_party_name(alias)
        if len(normalized_alias) >= 4 and (
            normalized_alias in normalized_party or normalized_party in normalized_alias
        ):
            return True
    return False


def sync_pending_case_parties(
    db,
    case,
    bank: Dict[str, object],
    case_title: str,
    source_status: str,
    source_file: str,
    source_created_at,
    source_aliases: Sequence[str],
) -> Dict[str, int]:
    aliases = [bank["name"], *source_aliases]
    parties = extract_case_parties(case_title)

    for party in parties:
        party["is_source_bank"] = _is_source_bank(str(party["party_name"]), aliases)

    if not any(bool(party["is_source_bank"]) for party in parties):
        parties.append(
            {
                "party_name": str(bank["name"]),
                "normalized_party_name": normalize_party_name(str(bank["name"])),
                "party_side": "source_bank",
                "party_order": 1,
                "is_source_bank": True,
            }
        )

    existing = {
        record.normalized_party_name: record
        for record in db.query(PendingCaseParty)
        .filter(
            PendingCaseParty.case_id == case.id,
            PendingCaseParty.bank_id == bank["id"],
        )
        .all()
    }
    counts = {"created": 0, "updated": 0}

    for party in parties:
        normalized = str(party["normalized_party_name"])
        record = existing.get(normalized)
        if record is None:
            record = PendingCaseParty(
                case_id=case.id,
                bank_id=int(bank["id"]),
                normalized_party_name=normalized,
            )
            db.add(record)
            existing[normalized] = record
            counts["created"] += 1
        else:
            counts["updated"] += 1

        record.party_name = str(party["party_name"])
        record.party_side = str(party["party_side"])
        record.party_order = int(party["party_order"])
        record.is_source_bank = bool(party["is_source_bank"])
        record.source_case_status = source_status or None
        record.source_file = source_file
        record.source_created_at = source_created_at

    return counts
