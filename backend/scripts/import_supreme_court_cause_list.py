import argparse
import re
import sys
from datetime import datetime, date, time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

import pdfplumber
import pytesseract
from pytesseract import Output
from sqlalchemy import text

from database import engine


MONTHS = {
    "JANUARY": 1,
    "FEBRUARY": 2,
    "MARCH": 3,
    "APRIL": 4,
    "MAY": 5,
    "JUNE": 6,
    "JULY": 7,
    "AUGUST": 8,
    "SEPTEMBER": 9,
    "OCTOBER": 10,
    "NOVEMBER": 11,
    "DECEMBER": 12,
}

DATE_REGEX = re.compile(
    r"\b(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)"
    r"\s+([A-Z]+)\s+(\d{1,2})[^\dA-Z]*,?\s*(\d{4})",
    re.IGNORECASE,
)
TIME_REGEX = re.compile(r"\b(\d{1,2}:\d{2}\s*(AM|PM))\b", re.IGNORECASE)
VENUE_REGEX = re.compile(r"VENUE:\s*(.+)", re.IGNORECASE)
SUIT_NO_REGEX = re.compile(r"\b([A-Z]{0,3}\d+[A-Z]?/\d+/\d{2,4}|\d+/\d+/\d{2,4})\b")
REMARKS_REGEX = re.compile(r"\bF/[A-Z]{1,2}\b", re.IGNORECASE)

SECTION_HEADINGS = {
    "MOTIONS",
    "WRITS",
    "WRIT",
    "APPEALS",
    "APPEAL",
    "APPLICATIONS",
    "PETITIONS",
}

SKIP_LINE_FRAGMENTS = (
    "JUDICIAL SERVICE OF GHANA",
    "IN THE SUPERIOR COURT",
    "IN THE SUPREME COURT",
    "CAUSE LIST",
    "SUIT NO",
    "FOR: WEEK COMMENCING",
    "TIME OF SITTING",
    "FIRST SESSION",
)


def normalize_line(line: str) -> str:
    cleaned = line.replace("|", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"^\d+\.\s*", "", cleaned)
    cleaned = re.sub(r"\bos\b", "VRS", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bvs\b", "VRS", cleaned, flags=re.IGNORECASE)
    return cleaned


def normalize_case_title(title: str) -> str:
    if not title:
        return title
    cleaned = re.sub(r"^\s*[~\-–—]+\s*", "", title).strip()
    cleaned = re.sub(r"^[&o)\(\\-\\s]*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(
        r"^(?:[A-Z]{0,3}\d+[A-Z]?/\d+/\d{2,4}|\d+/\d+/\d{2,4})\s+",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = cleaned.replace("ADIJEI", "ADJEI")
    upper_title = cleaned.upper()
    if "VRS" not in upper_title and "EX-PARTE" not in upper_title:
        markers = [
            r"\bTHE ATTORNEY GENERAL\b",
            r"\bATTORNEY-GENERAL\b",
            r"\bANAS AREMEYAW ANAS\b",
        ]
        for marker in markers:
            match = re.search(marker, cleaned, flags=re.IGNORECASE)
            if match and match.start() > 5:
                cleaned = f"{cleaned[:match.start()].rstrip()} VRS {cleaned[match.start():].lstrip()}"
                break
        if "VRS" not in cleaned.upper():
            company_pattern = re.compile(r"[A-Z][A-Z\\s&\\.]*\\b(LTD\\.?|LIMITED)\\b", re.IGNORECASE)
            company_matches = list(company_pattern.finditer(cleaned))
            if len(company_matches) >= 2:
                split_at = company_matches[1].start()
                cleaned = f"{cleaned[:split_at].rstrip()} VRS {cleaned[split_at:].lstrip()}"
            elif len(company_matches) == 1 and (" & ORS " in upper_title or " & ANOR " in upper_title):
                split_at = company_matches[0].start()
                cleaned = f"{cleaned[:split_at].rstrip()} VRS {cleaned[split_at:].lstrip()}"
    cleaned = re.sub(r"\bVRS\s+VRS\b", "VRS", cleaned, flags=re.IGNORECASE)
    if "THE REPUBLIC" in cleaned.upper() and "VRS" not in cleaned.upper():
        cleaned = re.sub(r"\bTHE REPUBLIC\b", "THE REPUBLIC VRS", cleaned, count=1, flags=re.IGNORECASE)
    return cleaned


def normalize_heading(line: str) -> str:
    cleaned = re.sub(r"[^A-Z ]", "", line.upper()).strip()
    return cleaned


def normalize_suit_no(suit_no: str) -> str:
    parts = suit_no.split("/")
    if len(parts) != 3:
        return suit_no
    year = parts[2]
    if len(year) == 2 and year.isdigit():
        parts[2] = f"20{year}"
    normalized = "/".join(parts)
    if normalized.startswith("38/"):
        normalized = "J8/" + normalized[3:]
    if normalized.startswith("1/"):
        normalized = "J1/" + normalized[2:]
    return normalized


def split_parties(case_title: str) -> tuple[str | None, str | None]:
    if not case_title:
        return None, None
    match = re.split(r"\s+VRS\s+", case_title, flags=re.IGNORECASE, maxsplit=1)
    if len(match) == 2:
        return match[0].strip() or None, match[1].strip() or None
    return None, None


def parse_date_from_text(text: str) -> date | None:
    match = None
    for match in DATE_REGEX.finditer(text):
        pass
    if not match:
        return None
    month_name = match.group(2).upper()
    month = MONTHS.get(month_name)
    if not month:
        return None
    day = int(match.group(3))
    year = int(match.group(4))
    return date(year, month, day)


def parse_time_from_text(text: str) -> time | None:
    match = TIME_REGEX.search(text)
    if not match:
        return None
    value = match.group(1).upper()
    try:
        return datetime.strptime(value, "%I:%M %p").time()
    except ValueError:
        return None


def parse_header(text: str) -> dict:
    venue = None
    location = None
    hearing_date = parse_date_from_text(text)
    hearing_time = parse_time_from_text(text)

    venue_match = VENUE_REGEX.search(text)
    if venue_match:
        venue = venue_match.group(1).strip()

    location_match = re.search(r"\b([A-Z]+(?:-[A-Z]+)+)\b", text)
    if location_match and "GHANA" in location_match.group(1):
        location = location_match.group(1).strip()

    return {
        "venue": venue,
        "location": location,
        "hearing_date": hearing_date,
        "hearing_time": hearing_time,
    }


def is_section_heading(line: str) -> bool:
    if not line:
        return False
    cleaned = normalize_heading(line)
    return cleaned in SECTION_HEADINGS


def extract_lines(page) -> list[tuple[int, str, int, list[dict]]]:
    img = page.to_image(resolution=400).original
    data = pytesseract.image_to_data(img, output_type=Output.DICT, config="--psm 6")
    grouped = {}
    for i in range(len(data["text"])):
        text = data["text"][i].strip()
        if not text:
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        grouped.setdefault(key, []).append(
            {
                "text": text,
                "left": data["left"][i],
                "top": data["top"][i],
            }
        )

    lines = []
    for words in grouped.values():
        words_sorted = sorted(words, key=lambda w: w["left"])
        line_text = " ".join(w["text"] for w in words_sorted)
        top = min(w["top"] for w in words_sorted)
        left = min(w["left"] for w in words_sorted)
        lines.append((top, line_text, left, words_sorted))

    return sorted(lines, key=lambda item: item[0])


def extract_cases(page, header: dict, page_text: str, inherited_case_type: str | None) -> tuple[list[dict], str | None]:
    header = header.copy()

    current_date = header.get("hearing_date")
    current_time = header.get("hearing_time")
    current_case_type = inherited_case_type
    current_case = None
    cases = []
    remarks_tokens = []
    vrs_positions = []
    section_heads = []

    img = page.to_image(resolution=400).original
    data = pytesseract.image_to_data(img, output_type=Output.DICT, config="--psm 6")
    for i in range(len(data["text"])):
        text = data["text"][i].strip()
        if not text:
            continue
        token = re.sub(r"[^\w/]", "", text.upper())
        if REMARKS_REGEX.fullmatch(token):
            remarks_tokens.append({"token": token, "top": data["top"][i]})
        if token == "VRS":
            vrs_positions.append(data["left"][i])

    vrs_column = None
    if vrs_positions:
        vrs_positions.sort()
        mid = len(vrs_positions) // 2
        vrs_column = vrs_positions[mid]

    w, h = img.size
    crop = img.crop((int(w * 0.7), 0, w, h))
    crop_config = "--psm 11 -c tessedit_char_whitelist=FJH/ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    crop_data = pytesseract.image_to_data(crop, output_type=Output.DICT, config=crop_config)
    for i in range(len(crop_data["text"])):
        text = crop_data["text"][i].strip()
        if not text:
            continue
        token = re.sub(r"[^\w/]", "", text.upper())
        if REMARKS_REGEX.fullmatch(token):
            remarks_tokens.append({"token": token, "top": crop_data["top"][i]})

    for line_top, raw_line, line_left, line_words in extract_lines(page):
        line = normalize_line(raw_line)
        if not line:
            continue

        upper_line = line.upper()
        if "MOTIONS" in upper_line and not SUIT_NO_REGEX.search(line) and not is_section_heading(line):
            continue

        if any(fragment in upper_line for fragment in SKIP_LINE_FRAGMENTS):
            if "TIME OF SITTING" in upper_line or "FIRST SESSION" in upper_line:
                current_time = parse_time_from_text(line) or current_time
            date_candidate = parse_date_from_text(line)
            if date_candidate:
                current_date = date_candidate
            continue

        date_candidate = parse_date_from_text(line)
        if date_candidate:
            current_date = date_candidate
            continue

        if "TIME OF SITTING" in upper_line or "FIRST SESSION" in upper_line:
            current_time = parse_time_from_text(line) or current_time
            continue

        if is_section_heading(line):
            heading = normalize_heading(line)
            section_heads.append({"top": line_top, "name": heading})
            if current_case and not current_case.get("case_type"):
                current_case["case_type"] = heading
            current_case_type = heading
            continue

        suit_match = SUIT_NO_REGEX.search(line)
        if suit_match:
            if current_case:
                current_case["case_title"] = current_case["case_title"].strip() or None
                cases.append(current_case)

            suit_no = normalize_suit_no(suit_match.group(1))
            remainder = line[suit_match.end():].strip()
            remarks_match = REMARKS_REGEX.search(remainder)
            remarks = remarks_match.group(0) if remarks_match else None
            if remarks_match:
                remainder = (remainder[:remarks_match.start()] + remainder[remarks_match.end():]).strip()

            normalized_title = normalize_case_title(remainder.strip())
            if vrs_column and "VRS" not in normalized_title.upper():
                left_words = [w["text"] for w in line_words if w["left"] < vrs_column]
                right_words = [w["text"] for w in line_words if w["left"] > vrs_column + 40]
                left_text = normalize_line(" ".join(left_words))
                right_text = normalize_line(" ".join(right_words))
                if left_text and right_text:
                    normalized_title = normalize_case_title(f"{left_text} VRS {right_text}")
            if suit_no:
                normalized_title = re.sub(rf"\b{re.escape(suit_no)}\b", "", normalized_title).strip()
                normalized_title = re.sub(r"\s+", " ", normalized_title)
            first_party, second_party = split_parties(normalized_title)
            current_case = {
                "suit_no": suit_no,
                "case_title": normalized_title,
                "first_party_name": first_party,
                "second_party_name": second_party,
                "remarks": remarks.upper() if remarks else None,
                "case_type": current_case_type,
                "hearing_date": current_date,
                "hearing_time": current_time,
                "venue": header.get("venue"),
                "location": header.get("location"),
                "_line_top": line_top,
            }
            continue

        if current_case:
            remarks_match = REMARKS_REGEX.search(line)
            if remarks_match and not current_case["remarks"]:
                current_case["remarks"] = remarks_match.group(0).upper()
                line = (line[:remarks_match.start()] + line[remarks_match.end():]).strip()
            else:
                if not current_case["remarks"]:
                    for token in line_words:
                        token_clean = re.sub(r"[^\w/]", "", token["text"].strip().upper())
                        if REMARKS_REGEX.fullmatch(token_clean) and line_left > 4500:
                            current_case["remarks"] = token_clean
                            line = ""
                            break

            if line:
                merged_title = f"{current_case['case_title']} {line}".strip()
                normalized_title = normalize_case_title(merged_title)
                if vrs_column and "VRS" not in normalized_title.upper():
                    left_words = [w["text"] for w in line_words if w["left"] < vrs_column]
                    right_words = [w["text"] for w in line_words if w["left"] > vrs_column + 40]
                    left_text = normalize_line(" ".join(left_words))
                    right_text = normalize_line(" ".join(right_words))
                    if left_text and right_text:
                        normalized_title = normalize_case_title(f"{left_text} VRS {right_text}")
                if current_case.get("suit_no"):
                    normalized_title = re.sub(
                        rf"\b{re.escape(current_case['suit_no'])}\b",
                        "",
                        normalized_title,
                    ).strip()
                    normalized_title = re.sub(r"\s+", " ", normalized_title)
                current_case["case_title"] = normalized_title
                first_party, second_party = split_parties(normalized_title)
                if first_party and not current_case.get("first_party_name"):
                    current_case["first_party_name"] = first_party
                if second_party and not current_case.get("second_party_name"):
                    current_case["second_party_name"] = second_party

    if current_case:
        current_case["case_title"] = normalize_case_title(current_case["case_title"].strip() or None)
        first_party, second_party = split_parties(current_case["case_title"])
        if first_party and not current_case.get("first_party_name"):
            current_case["first_party_name"] = first_party
        if second_party and not current_case.get("second_party_name"):
            current_case["second_party_name"] = second_party
        cases.append(current_case)

    if remarks_tokens:
        for case in cases:
            if case.get("remarks"):
                continue
            line_top = case.get("_line_top")
            if line_top is None:
                continue
            closest = min(
                remarks_tokens,
                key=lambda t: abs(t["top"] - line_top),
            )
            if abs(closest["top"] - line_top) <= 600:
                case["remarks"] = closest["token"]

    if section_heads:
        for case in cases:
            if case.get("case_type"):
                continue
            line_top = case.get("_line_top")
            if line_top is None:
                continue
            nearest = min(section_heads, key=lambda h: abs(h["top"] - line_top))
            if abs(nearest["top"] - line_top) <= 1500:
                case["case_type"] = nearest["name"]

    for case in cases:
        case.pop("_line_top", None)
        if case.get("case_type") == "APPEALS" and case.get("suit_no", "").startswith("4/"):
            case["suit_no"] = f"34/{case['suit_no'][2:]}"

    return cases, current_case_type


def ensure_columns(conn):
    conn.execute(text("ALTER TABLE cause_lists ADD COLUMN IF NOT EXISTS court_type VARCHAR(100)"))
    conn.execute(text("ALTER TABLE cause_lists ADD COLUMN IF NOT EXISTS location VARCHAR(255)"))
    conn.execute(text("ALTER TABLE cause_lists ADD COLUMN IF NOT EXISTS venue VARCHAR(255)"))


def upsert_cases(conn, cases: list[dict], court_type: str) -> tuple[int, int]:
    created = 0
    updated = 0
    for case in cases:
        hearing_date = case.get("hearing_date")
        if not hearing_date:
            continue
        suit_no = case.get("suit_no")
        existing = None
        if suit_no:
            existing = conn.execute(
                text(
                    "SELECT id FROM cause_lists "
                    "WHERE suit_no = :suit_no AND hearing_date::date = :hearing_date "
                    "LIMIT 1"
                ),
                {"suit_no": suit_no, "hearing_date": hearing_date},
            ).fetchone()

        if existing:
            conn.execute(
                text(
                    "UPDATE cause_lists SET "
                    "case_title = :case_title, "
                    "first_party_name = :first_party_name, "
                    "second_party_name = :second_party_name, "
                    "remarks = :remarks, "
                    "case_type = :case_type, "
                    "hearing_time = :hearing_time, "
                    "court_type = :court_type, "
                    "location = :location, "
                    "venue = :venue, "
                    "updated_by = :updated_by "
                    "WHERE id = :id"
                ),
                {
                    "case_title": case.get("case_title"),
                    "first_party_name": case.get("first_party_name"),
                    "second_party_name": case.get("second_party_name"),
                    "remarks": case.get("remarks"),
                    "case_type": case.get("case_type"),
                    "hearing_time": case.get("hearing_time"),
                    "court_type": court_type,
                    "location": case.get("location"),
                    "venue": case.get("venue"),
                    "updated_by": "pdf-import",
                    "id": existing.id,
                },
            )
            updated += 1
        else:
            conn.execute(
                text(
                    "INSERT INTO cause_lists ("
                    "suit_no, case_title, first_party_name, second_party_name, remarks, case_type, hearing_date, hearing_time, "
                    "court_type, location, venue, created_by, updated_by, status, is_active"
                    ") VALUES ("
                    ":suit_no, :case_title, :first_party_name, :second_party_name, :remarks, :case_type, :hearing_date, :hearing_time, "
                    ":court_type, :location, :venue, :created_by, :updated_by, :status, :is_active"
                    ")"
                ),
                {
                    "suit_no": suit_no,
                    "case_title": case.get("case_title"),
                    "first_party_name": case.get("first_party_name"),
                    "second_party_name": case.get("second_party_name"),
                    "remarks": case.get("remarks"),
                    "case_type": case.get("case_type"),
                    "hearing_date": hearing_date,
                    "hearing_time": case.get("hearing_time"),
                    "court_type": court_type,
                    "location": case.get("location"),
                    "venue": case.get("venue"),
                    "created_by": "pdf-import",
                    "updated_by": "pdf-import",
                    "status": "Active",
                    "is_active": True,
                },
            )
            created += 1

    return created, updated


def main(pdf_path: Path):
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    base_header = {"venue": None, "location": None, "hearing_date": None, "hearing_time": None}
    all_cases = []

    current_case_type = None
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            page_text = pytesseract.image_to_string(page.to_image(resolution=300).original)
            page_header = parse_header(page_text)
            for key in base_header:
                if page_header.get(key):
                    base_header[key] = page_header[key]
            merged_header = base_header.copy()
            for key in merged_header:
                if page_header.get(key):
                    merged_header[key] = page_header[key]
            page_cases, current_case_type = extract_cases(
                page,
                merged_header,
                page_text,
                current_case_type,
            )
            all_cases.extend(page_cases)

    with engine.begin() as conn:
        ensure_columns(conn)
        created, updated = upsert_cases(conn, all_cases, "Supreme Court")

    print(f"Parsed cases: {len(all_cases)}")
    print(f"Created: {created}, Updated: {updated}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Supreme Court cause list PDF")
    parser.add_argument("pdf_path", type=Path, help="Path to cause list PDF")
    args = parser.parse_args()
    main(args.pdf_path)
