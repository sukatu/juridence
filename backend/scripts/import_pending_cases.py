import argparse
import csv
import difflib
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.banks import Banks
from models.bank_rulings_judgements import BankRulingsJudgements
from models.reported_cases import ReportedCases
from services.pending_case_party_service import sync_pending_case_parties
import models  # noqa: F401
try:
    from models.gazette import Gazette  # noqa: F401
except ImportError:
    pass


PENDING_STATUS = "pending"
DEFAULT_DIR = PROJECT_ROOT / "uploads" / "pending_cases"

HEADER_KEY_REGEX = re.compile(r"[^a-z0-9]+", re.IGNORECASE)
VS_REGEX = re.compile(r"\s+VRS\.?\s+|\s+VS\.?\s+", re.IGNORECASE)
ALIAS_CANDIDATES = {
    "ADB": [
        "AGRICULTURAL DEVELOPMENT BANK",
        "ADB BANK",
        "ADB PLC",
    ],
    "NIB": [
        "NATIONAL INVESTMENT BANK",
        "NIB BANK",
    ],
    "FBN BANK GHANA": [
        "FBNBANK",
        "FBN BANK",
        "FIRST BANK",
        "FIRST BANK GHANA",
        "FIRST BANK OF NIGERIA",
    ],
}


def normalize_header_key(value: str) -> str:
    if value is None:
        return ""
    cleaned = HEADER_KEY_REGEX.sub("", value.strip().lower())
    return cleaned


def normalize_name(value: str) -> str:
    if value is None:
        return ""
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def build_acronym(value: str) -> str:
    if not value:
        return ""
    parts = re.split(r"[^A-Za-z0-9]+", value)
    letters = [part[0] for part in parts if part]
    return "".join(letters).upper()


def parse_datetime(value: str) -> Optional[datetime]:
    if not value:
        return None
    raw = value.strip()
    for fmt in ("%d.%m.%Y %H:%M:%S", "%d.%m.%Y"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    return None


def split_parties(case_title: str) -> Tuple[Optional[str], Optional[str]]:
    if not case_title:
        return None, None
    parts = VS_REGEX.split(case_title, maxsplit=1)
    if len(parts) == 2:
        return parts[0].strip() or None, parts[1].strip() or None
    return None, None


def build_header_map(fieldnames: Iterable[str]) -> Dict[str, str]:
    mapping = {}
    for name in fieldnames:
        key = normalize_header_key(name)
        if key:
            mapping[key] = name
    return mapping


def get_row_value(row: Dict[str, str], header_map: Dict[str, str], key: str) -> str:
    raw_key = header_map.get(key, "")
    value = row.get(raw_key, "") if raw_key else ""
    return value.strip() if isinstance(value, str) else ""


def load_banks(db) -> List[Dict[str, str]]:
    banks = db.query(Banks).all()
    entries = []
    for bank in banks:
        variants = [bank.name, bank.short_name]
        former_name = getattr(bank, "former_name", None)
        if former_name:
            variants.append(former_name)
        previous_names = getattr(bank, "previous_names", None)
        if isinstance(previous_names, list):
            variants.extend(previous_names)
        variants = [v for v in variants if v]
        entries.append(
            {
                "id": bank.id,
                "name": bank.name,
                "variants": variants,
            }
        )
    return entries


def match_bank(file_stem: str, banks: List[Dict[str, str]]) -> Optional[Dict[str, str]]:
    normalized_stem = normalize_name(file_stem)
    stem_acronym = build_acronym(file_stem)
    best_match = None
    best_score = 0.0

    alias_list = ALIAS_CANDIDATES.get(file_stem.upper(), [])
    if alias_list:
        for bank in banks:
            for variant in bank["variants"]:
                for alias in alias_list:
                    if normalize_name(alias) in normalize_name(variant):
                        return bank

    for bank in banks:
        for variant in bank["variants"]:
            normalized_variant = normalize_name(variant)
            if not normalized_variant:
                continue
            if normalized_variant == normalized_stem:
                return bank
            if stem_acronym and build_acronym(variant) == stem_acronym:
                return bank
            score = 0.0
            if len(normalized_stem) >= 4 and normalized_stem in normalized_variant:
                score = max(score, 0.9)
            if len(normalized_variant) >= 4 and normalized_variant in normalized_stem:
                score = max(score, 0.8)
            if score < 0.9:
                # Fallback to sequence ratio when substring match is weak
                ratio = difflib_ratio(normalized_stem, normalized_variant)
                score = max(score, ratio)
            if score > best_score:
                best_score = score
                best_match = bank

    if best_score >= 0.6:
        return best_match
    return None


def difflib_ratio(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(a=a, b=b).ratio()


def find_existing_case(db, suit_number: str, case_id: str, case_title: str) -> Optional[ReportedCases]:
    if case_id:
        existing = db.query(ReportedCases).filter(ReportedCases.dl_citation_no == case_id).first()
        if existing:
            return existing
        return None
    if suit_number and any(character.isalnum() for character in suit_number):
        existing = db.query(ReportedCases).filter(ReportedCases.suit_reference_number == suit_number).first()
        if existing:
            return existing
        return None
    if suit_number:
        return None
    if case_title:
        existing = db.query(ReportedCases).filter(func.lower(ReportedCases.title) == case_title.lower()).first()
        if existing:
            return existing
    return None


def apply_case_updates(case: ReportedCases, data: Dict[str, Optional[str]]) -> None:
    for field, value in data.items():
        if value is None:
            continue
        current = getattr(case, field)
        if current is None or current == "":
            setattr(case, field, value)


def process_csv_file(
    db, csv_path: Path, bank: Dict[str, str], dry_run: bool, force_relink: bool
) -> Dict[str, int]:
    stats = {
        "rows": 0,
        "cases_created": 0,
        "cases_updated": 0,
        "links_created": 0,
        "links_existing": 0,
        "party_records_created": 0,
        "party_records_updated": 0,
    }

    with csv_path.open("r", encoding="utf-16", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if not reader.fieldnames:
            return stats

        header_map = build_header_map(reader.fieldnames)
        for row in reader:
            stats["rows"] += 1
            suit_number = get_row_value(row, header_map, "suitnumber")
            case_id = get_row_value(row, header_map, "caseid")
            case_title = get_row_value(row, header_map, "casetitle")
            case_category = get_row_value(row, header_map, "casecategory")
            case_type = get_row_value(row, header_map, "casetype")
            court_type = get_row_value(row, header_map, "courttype")
            location = get_row_value(row, header_map, "location")
            status_text = get_row_value(row, header_map, "status")
            created_on = get_row_value(row, header_map, "createdon")

            created_at = parse_datetime(created_on)
            protagonist, antagonist = split_parties(case_title)

            case = find_existing_case(db, suit_number, case_id, case_title)
            if case is None:
                case = ReportedCases(
                    title=case_title or None,
                    suit_reference_number=suit_number or None,
                    date=created_at,
                    court_type=court_type or None,
                    town=location or None,
                    area_of_law=case_category or None,
                    type=case_type or None,
                    status=PENDING_STATUS,
                    protagonist=protagonist,
                    antagonist=antagonist,
                    dl_citation_no=case_id or None,
                )
                db.add(case)
                stats["cases_created"] += 1
            else:
                updates = {
                    "title": case_title or None,
                    "suit_reference_number": suit_number or None,
                    "date": created_at,
                    "court_type": court_type or None,
                    "town": location or None,
                    "area_of_law": case_category or None,
                    "type": case_type or None,
                    "dl_citation_no": case_id or None,
                    "protagonist": protagonist,
                    "antagonist": antagonist,
                }
                apply_case_updates(case, updates)
                case.status = PENDING_STATUS
                stats["cases_updated"] += 1

            db.flush()

            party_counts = sync_pending_case_parties(
                db=db,
                case=case,
                bank=bank,
                case_title=case_title,
                source_status=status_text,
                source_file=csv_path.name,
                source_created_at=created_at,
                source_aliases=[csv_path.stem],
            )
            stats["party_records_created"] += party_counts["created"]
            stats["party_records_updated"] += party_counts["updated"]

            if force_relink:
                (
                    db.query(BankRulingsJudgements)
                    .filter(
                        BankRulingsJudgements.case_id == case.id,
                        BankRulingsJudgements.match_method == "pending_cases_upload",
                        BankRulingsJudgements.bank_id != bank["id"],
                    )
                    .delete(synchronize_session=False)
                )

            link = (
                db.query(BankRulingsJudgements)
                .filter(
                    BankRulingsJudgements.bank_id == bank["id"],
                    BankRulingsJudgements.case_id == case.id,
                )
                .first()
            )
            if link:
                stats["links_existing"] += 1
                continue

            link = BankRulingsJudgements(
                bank_id=bank["id"],
                case_id=case.id,
                matched_bank_name=bank["name"],
                match_confidence="High",
                match_method="pending_cases_upload",
            )
            db.add(link)
            stats["links_created"] += 1

        if dry_run:
            db.rollback()
        else:
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
                raise

    return stats


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import pending bank cases from CSV files.")
    parser.add_argument(
        "--directory",
        type=Path,
        default=DEFAULT_DIR,
        help="Directory containing pending_cases CSV files.",
    )
    parser.add_argument("--bank", type=str, default=None, help="Process a single bank by CSV stem.")
    parser.add_argument("--dry-run", action="store_true", help="Parse and validate without saving.")
    parser.add_argument(
        "--force-relink",
        action="store_true",
        help="Remove pending_cases_upload links for other banks before linking.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    directory = args.directory
    if not directory.exists():
        print(f"[ERROR] Directory not found: {directory}")
        return 1

    csv_paths = sorted(directory.glob("*.csv"))
    if args.bank:
        csv_paths = [p for p in csv_paths if p.stem.lower() == args.bank.lower()]

    if not csv_paths:
        print("[WARN] No CSV files found to process.")
        return 0

    db = SessionLocal()
    try:
        banks = load_banks(db)
        if not banks:
            print("[ERROR] No banks found in database.")
            return 1

        totals = {
            "rows": 0,
            "cases_created": 0,
            "cases_updated": 0,
            "links_created": 0,
            "links_existing": 0,
            "files_processed": 0,
            "files_skipped": 0,
            "party_records_created": 0,
            "party_records_updated": 0,
        }

        for csv_path in csv_paths:
            bank = match_bank(csv_path.stem, banks)
            if not bank:
                print(f"[WARN] No bank match for file: {csv_path.name}")
                totals["files_skipped"] += 1
                continue

            stats = process_csv_file(db, csv_path, bank, args.dry_run, args.force_relink)
            totals["files_processed"] += 1
            for key in (
                "rows",
                "cases_created",
                "cases_updated",
                "links_created",
                "links_existing",
                "party_records_created",
                "party_records_updated",
            ):
                totals[key] += stats[key]

            print(
                f"[OK] {csv_path.name} -> {bank['name']} "
                f"(rows={stats['rows']} created={stats['cases_created']} "
                f"updated={stats['cases_updated']} links={stats['links_created']} "
                f"parties={stats['party_records_created']})"
            )

        print(
            "[DONE] files="
            f"{totals['files_processed']} skipped={totals['files_skipped']} "
            f"rows={totals['rows']} created={totals['cases_created']} "
            f"updated={totals['cases_updated']} links={totals['links_created']} "
            f"parties={totals['party_records_created']}"
        )
        if args.dry_run:
            print("[INFO] Dry-run enabled; no changes committed.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
