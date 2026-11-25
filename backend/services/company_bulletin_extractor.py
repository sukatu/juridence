import hashlib
import re
import subprocess
import tempfile
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import pdfplumber


EXTRACTION_VERSION = "1.0"

NOTICE_TYPES = {
    "DISSOLUTION": "COMPANY_DISSOLUTION",
    "STRIKE": "COMPANY_STRIKE_OFF_INTENTION",
    "WINDING": "COMPANY_WINDING_UP",
    "LIQUIDAT": "COMPANY_LIQUIDATION",
    "INCORPOR": "COMPANY_INCORPORATION",
    "CHANGE": "COMPANY_CHANGE_OF_NAME",
    "CESSATION": "COMPANY_CESSATION_OF_BUSINESS",
}

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
    "JAN": 1,
    "FEB": 2,
    "MAR": 3,
    "APR": 4,
    "JUN": 6,
    "JUL": 7,
    "AUG": 8,
    "SEP": 9,
    "SEPT": 9,
    "OCT": 10,
    "OCTO": 10,
    "NOV": 11,
    "DEC": 12,
}


@dataclass
class ExtractedNotice:
    notice_type: str
    company_name: str
    old_company_name: Optional[str] = None
    new_company_name: Optional[str] = None
    registration_number: Optional[str] = None
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
    raw_text: Optional[str] = None
    extraction_confidence: float = 0.55
    review_status: str = "NEEDS_REVIEW"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExtractedBulletin:
    source_path: Path
    source_sha256: str
    source_filename: str
    volume_number: Optional[str]
    issue_date: Optional[date]
    publication_date: Optional[date]
    page_count: int
    file_size_bytes: int
    notices: List[ExtractedNotice]
    metadata: Dict[str, Any] = field(default_factory=dict)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def normalized_key(value: str) -> str:
    return re.sub(r"[^A-Z0-9]+", " ", value.upper()).strip()


def _compact(value: str) -> str:
    value = value.replace("\u2019", "'").replace("\u2018", "'")
    value = value.replace("\u2013", "-").replace("\u2014", "-")
    return re.sub(r"\s+", " ", value).strip(" .,:;-\n\t")


def _clean_company_name(value: str) -> str:
    value = _compact(value)
    value = re.sub(r"^[^A-Z0-9]+", "", value, flags=re.IGNORECASE)
    value = re.sub(r"\s+(?:COMPANIES BULLETIN|OFFICE OF THE REGISTRAR).*$", "", value, flags=re.IGNORECASE)
    return value.strip(" .,:;-()")


def _plausible_company_name(value: str) -> bool:
    if not 3 <= len(value) <= 220:
        return False
    if any(character in value for character in "[]{}=|?"):
        return False
    letters = sum(character.isalpha() for character in value)
    return letters >= 3 and letters / max(1, len(value)) >= 0.45


def _parse_date(value: str) -> Optional[date]:
    cleaned = _compact(value).upper().replace("OCTOBER9", "OCTOBER")
    month_pattern = "|".join(sorted(MONTHS, key=len, reverse=True))
    for match in re.finditer(rf"({month_pattern})", cleaned):
        preceding = cleaned[max(0, match.start() - 18):match.start()]
        day_groups = re.findall(r"\d+", preceding)
        following = cleaned[match.end():match.end() + 20]
        year_match = re.search(r"20\d{2}", following)
        if not day_groups or not year_match:
            continue
        distorted_day = None
        for pattern in (
            r"(\d{1,2})S1\s*$",
            r"(\d{1,2})['’]1\s*11\s*$",
            r"(\d{1,2})['’]1\s*II\s*$",
            r"(\d{1,2})1\s+11\s*$",
            r"(\d{1,2})111\s*$",
        ):
            distorted_day = re.search(pattern, preceding)
            if distorted_day:
                break
        day_text = distorted_day.group(1) if distorted_day else day_groups[-1][-2:]
        month = MONTHS.get(match.group(1).replace("0", "O"))
        try:
            return date(int(year_match.group(0)), month, int(day_text))
        except ValueError:
            continue
    return None


def _classify_notice(label: str) -> Optional[str]:
    normalized = normalized_key(label)
    if "DISSOLUTION" in normalized or "DISSOLVED" in normalized:
        return NOTICE_TYPES["DISSOLUTION"]
    if "STRIKE" in normalized and "REGISTER" in normalized:
        return NOTICE_TYPES["STRIKE"]
    if "CESSATION" in normalized and "BUSINESS" in normalized:
        return NOTICE_TYPES["CESSATION"]
    if "WINDING" in normalized:
        return NOTICE_TYPES["WINDING"]
    if "LIQUIDAT" in normalized:
        return NOTICE_TYPES["LIQUIDAT"]
    if "INCORPOR" in normalized:
        return NOTICE_TYPES["INCORPOR"]
    if "CHANGE" in normalized and "NAME" in normalized:
        return NOTICE_TYPES["CHANGE"]
    return None


def _extract_volume(text: str, filename: str) -> Optional[str]:
    match = re.search(r"\bV[O0]L[U]?ME\s*([0-9]{1,3})(?![0-9])", text, flags=re.IGNORECASE)
    if not match:
        match = re.search(r"\b(?:VLM|VOLUME)[\s_-]*([0-9]{1,3})(?![0-9])", filename, flags=re.IGNORECASE)
    return match.group(1) if match else None


def _extract_publication_date(text: str, filename: str) -> Optional[date]:
    header = " ".join(text.splitlines()[:40])
    return _parse_date(filename) or _parse_date(header)


def _extract_registration_number(text: str) -> Optional[str]:
    candidates = re.findall(r"\b(?:CS|CG|CA|CB|CP|C|FC|F|BN)[\s_-]?[0-9]{5,12}\b", text, flags=re.IGNORECASE)
    if not candidates:
        return None
    return re.sub(r"[\s_-]+", "", candidates[0]).upper()


def _extract_statutory_section(text: str) -> Optional[str]:
    match = re.search(r"Section\s*([0-9]{1,3}(?:\s*\([^)]{1,12}\))?)", text, flags=re.IGNORECASE)
    return _compact(match.group(1)) if match else None


def _extract_act_reference(text: str) -> Optional[str]:
    match = re.search(
        r"Companies\s+Act\s*,?\s*2019\s*\(?\s*Act\s*992\s*\)?",
        text,
        flags=re.IGNORECASE,
    )
    return _compact(match.group(0)) if match else None


def _extract_event_date(text: str) -> Optional[date]:
    for pattern in (
        r"(?:this|dated(?:\s+at[^,]{0,80})?)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,10},?\s+20[0-9]{2})",
        r"\b([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,10},?\s+20[0-9]{2})\b",
    ):
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            parsed = _parse_date(match.group(1))
            if parsed:
                return parsed
    return None


def _extract_registrar(text: str) -> Optional[str]:
    matches = re.findall(
        r"\b([A-Z][A-Z .,'()-]{5,80})\s+(?:\(MRS\)\s+)?(?:AG\.?\s+)?Registrar\s+of\s+Companies",
        text,
        flags=re.IGNORECASE,
    )
    if not matches:
        return None
    return _compact(matches[-1]).title()


def _page_for_name(page_texts: List[str], company_name: str, start_at: int = 2) -> Optional[int]:
    key = normalized_key(company_name)
    if len(key) < 4:
        return None
    for index, page_text in enumerate(page_texts[start_at:], start=start_at):
        if key in normalized_key(page_text):
            return index + 1
    return None


def _notice_dates(notice_type: str, event_date: Optional[date]) -> Dict[str, Optional[date]]:
    result = {
        "incorporation_date": None,
        "dissolution_date": None,
        "strike_off_date": None,
        "winding_up_date": None,
        "liquidation_date": None,
        "cessation_date": None,
    }
    date_field = {
        "COMPANY_INCORPORATION": "incorporation_date",
        "COMPANY_DISSOLUTION": "dissolution_date",
        "COMPANY_STRIKE_OFF_INTENTION": "strike_off_date",
        "COMPANY_WINDING_UP": "winding_up_date",
        "COMPANY_LIQUIDATION": "liquidation_date",
        "COMPANY_CESSATION_OF_BUSINESS": "cessation_date",
    }.get(notice_type)
    if date_field:
        result[date_field] = event_date
    return result


def _summary_notices(page_texts: List[str], publication_date: Optional[date]) -> List[ExtractedNotice]:
    summary_text = "\n".join(page_texts[: min(3, len(page_texts))])
    flattened = re.sub(r"\s+", " ", summary_text)
    pattern = re.compile(
        r"Notice\s*of\s*([^()]{3,190})\(([^()]{2,260})\)",
        flags=re.IGNORECASE,
    )
    notices: List[ExtractedNotice] = []
    seen = set()
    for match in pattern.finditer(flattened):
        label = _compact(match.group(1))
        notice_type = _classify_notice(label)
        company_name = _clean_company_name(match.group(2))
        if not notice_type or not _plausible_company_name(company_name):
            continue
        key = (notice_type, normalized_key(company_name))
        if key in seen:
            continue
        seen.add(key)
        source_page = _page_for_name(page_texts, company_name)
        raw_text = page_texts[source_page - 1] if source_page else None
        event_date = _extract_event_date(raw_text or "")
        notices.append(
            ExtractedNotice(
                notice_type=notice_type,
                company_name=company_name,
                registration_number=_extract_registration_number(raw_text or ""),
                source_page=source_page,
                publication_date=publication_date,
                event_date=event_date,
                statutory_section=_extract_statutory_section(raw_text or label),
                act_reference=_extract_act_reference(raw_text or ""),
                registrar_name=_extract_registrar(raw_text or ""),
                raw_text=raw_text,
                extraction_confidence=0.84 if source_page else 0.66,
                metadata={"summary_label": label, "extraction_basis": "summary-of-contents"},
                **_notice_dates(notice_type, event_date),
            )
        )
    return notices


def _incorporation_notices(page_texts: List[str], publication_date: Optional[date]) -> List[ExtractedNotice]:
    notices: List[ExtractedNotice] = []
    for page_number, page_text in enumerate(page_texts, start=1):
        if "INCORPOR" not in normalized_key(page_text) or "CERTIFICATE" not in normalized_key(page_text):
            continue
        lines = page_text.splitlines()
        heading_index = next(
            (index for index, line in enumerate(lines) if "NOTICE" in line.upper() and "INCORPOR" in line.upper()),
            None,
        )
        if heading_index is None:
            continue
        company_lines = []
        for line in lines[heading_index + 1:heading_index + 10]:
            cleaned = _compact(line)
            upper = cleaned.upper()
            if not cleaned or "PURSUANT" in upper or "SECTION" in upper:
                continue
            if "CERTIFICATE" in upper or "COMPANIES ACT" in upper:
                continue
            if len(cleaned) > 3:
                company_lines.append(cleaned)
                break
        if not company_lines:
            continue
        company_name = _clean_company_name(company_lines[0])
        if not _plausible_company_name(company_name):
            continue
        registration_number = _extract_registration_number(page_text)
        incorporation_date = None
        date_match = re.search(
            r"Date\s+of\s+Incorporat(?:ion|lon)(.{0,220})",
            page_text,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if date_match:
            incorporation_date = _parse_date(date_match.group(1))
        incorporation_date = incorporation_date or _extract_event_date(page_text)
        notices.append(
            ExtractedNotice(
                notice_type="COMPANY_INCORPORATION",
                company_name=company_name,
                registration_number=registration_number,
                source_page=page_number,
                publication_date=publication_date,
                event_date=incorporation_date,
                incorporation_date=incorporation_date,
                statutory_section=_extract_statutory_section(page_text),
                act_reference=_extract_act_reference(page_text),
                registrar_name=_extract_registrar(page_text),
                raw_text=page_text,
                extraction_confidence=0.86 if registration_number and incorporation_date else 0.7,
                metadata={"extraction_basis": "incorporation-certificate"},
            )
        )
    return notices


def _name_change_notices(page_texts: List[str], publication_date: Optional[date]) -> List[ExtractedNotice]:
    if not any("OLD NAME" in page.upper() and "NEW NAME" in page.upper() for page in page_texts):
        return []
    notices: List[ExtractedNotice] = []
    for page_number, page_text in enumerate(page_texts, start=1):
        for line in page_text.splitlines():
            match = re.match(r"^\s*(\d{1,4})\s+(.{3,}?)\s{2,}(.{3,})\s*$", line)
            if not match:
                continue
            item_number, old_name, new_name = match.groups()
            old_name = _clean_company_name(old_name)
            new_name = _clean_company_name(new_name)
            if not _plausible_company_name(old_name) or not _plausible_company_name(new_name):
                continue
            if any(term in normalized_key(old_name) for term in ("OLD NAME", "OFFICE OF", "PAGE")):
                continue
            notices.append(
                ExtractedNotice(
                    notice_type="COMPANY_CHANGE_OF_NAME",
                    company_name=new_name,
                    old_company_name=old_name,
                    new_company_name=new_name,
                    source_item_number=item_number,
                    source_page=page_number,
                    publication_date=publication_date,
                    effective_date=publication_date,
                    raw_text=line.strip(),
                    extraction_confidence=0.74,
                    metadata={
                        "extraction_basis": "old-name-new-name-table",
                        "effective_date_basis": "publication date; registration date not printed per row",
                    },
                )
            )
    return notices


def _bulk_company_list_notices(
    page_texts: List[str], publication_date: Optional[date]
) -> List[ExtractedNotice]:
    """Extract conservative entries from numbered strike-off/dissolution lists."""
    opening = "\n".join(page_texts[:2])
    normalized_opening = normalized_key(opening)
    if "GOOD STANDING" in normalized_opening:
        return []
    if "INTENDS TO STRIKE" in normalized_opening or (
        "NOTICE OF INTENTION TO" in normalized_opening and "STAND DISSOLVED" in normalized_opening
    ):
        notice_type = "COMPANY_STRIKE_OFF_INTENTION"
    elif "STAND DISSOLVED" in normalized_opening and (
        "STRUCK" in normalized_opening or "SECTION 289" in normalized_opening
    ):
        notice_type = "COMPANY_DISSOLUTION"
    else:
        return []

    suffix_pattern = re.compile(
        r"\b(?:LIMITED|LTD|PLC|LBG|PRUC|COMPANY|ENTERPRISES?|FOUNDATION|ASSOCIATION)\b",
        flags=re.IGNORECASE,
    )
    notices: List[ExtractedNotice] = []
    seen = set()
    event_date = _extract_event_date(opening) or publication_date
    for page_number, page_text in enumerate(page_texts, start=1):
        for line in page_text.splitlines():
            row_parts = re.split(r"\s+[-~_]*\s*\d{1,4}\s+", line)
            for segment in re.split(r"\s{3,}|[|]+", "   ".join(row_parts)):
                candidate = re.sub(r"^[^A-Za-z]*\d{1,5}[^A-Za-z]+", "", segment)
                candidate = re.sub(r"\s+\d{1,5}\s*$", "", candidate)
                candidate = _clean_company_name(candidate)
                if not suffix_pattern.search(candidate) or not _plausible_company_name(candidate):
                    continue
                normalized = normalized_key(candidate)
                if any(
                    marker in normalized
                    for marker in (
                        "REGISTRAR OF COMPANIES",
                        "COMPANIES BULLETIN",
                        "COMPANIES ACT",
                        "NOTICE OF",
                        "REPUBLIC OF GHANA",
                    )
                ):
                    continue
                generic_words = {
                    "LIMITED",
                    "LTD",
                    "COMPANY",
                    "ASSOCIATION",
                    "FOUNDATION",
                    "ENTERPRISE",
                    "ENTERPRISES",
                }
                words = [word for word in normalized.split() if word not in generic_words]
                if not words or max(map(len, words)) < 3:
                    continue
                suffix_count = sum(
                    normalized.split().count(suffix)
                    for suffix in ("LIMITED", "LTD", "PLC", "LBG", "PRUC")
                )
                if suffix_count > 1 or re.search(r"\d\s*$", candidate):
                    continue
                key = (notice_type, normalized)
                if key in seen:
                    continue
                seen.add(key)
                notices.append(
                    ExtractedNotice(
                        notice_type=notice_type,
                        company_name=candidate,
                        source_page=page_number,
                        publication_date=publication_date,
                        event_date=event_date,
                        raw_text=line.strip(),
                        statutory_section=_extract_statutory_section(opening),
                        act_reference=_extract_act_reference(opening),
                        extraction_confidence=0.56,
                        metadata={"extraction_basis": "numbered-company-list"},
                        **_notice_dates(notice_type, event_date),
                    )
                )
    return notices


def notice_record_key(source_sha256: str, notice: ExtractedNotice) -> str:
    material = "|".join(
        [
            source_sha256,
            notice.notice_type,
            normalized_key(notice.company_name),
            normalized_key(notice.old_company_name or ""),
            normalized_key(notice.new_company_name or ""),
            notice.registration_number or "",
            str(notice.source_page or ""),
            notice.source_item_number or "",
        ]
    )
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def _extract_page_texts(path: Path) -> List[str]:
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", str(path), "-"],
            check=True,
            capture_output=True,
            text=True,
            timeout=120,
        )
        pages = result.stdout.split("\f")
        if pages and not pages[-1].strip():
            pages.pop()
        if any(page.strip() for page in pages):
            return pages
    except (FileNotFoundError, subprocess.SubprocessError):
        pass

    with pdfplumber.open(path) as pdf:
        return [(page.extract_text() or "") for page in pdf.pages]


def _ocr_page_texts(path: Path, page_count: int) -> List[str]:
    pages: List[str] = []
    with tempfile.TemporaryDirectory(prefix="company-bulletin-ocr-") as temp_dir:
        for page_number in range(1, page_count + 1):
            output_prefix = Path(temp_dir) / f"page-{page_number}"
            try:
                subprocess.run(
                    [
                        "pdftoppm",
                        "-f",
                        str(page_number),
                        "-l",
                        str(page_number),
                        "-singlefile",
                        "-png",
                        "-r",
                        "300",
                        str(path),
                        str(output_prefix),
                    ],
                    check=True,
                    capture_output=True,
                    timeout=120,
                )
                result = subprocess.run(
                    ["tesseract", f"{output_prefix}.png", "stdout", "--psm", "6"],
                    check=True,
                    capture_output=True,
                    text=True,
                    timeout=120,
                )
                pages.append(result.stdout)
            except (FileNotFoundError, subprocess.SubprocessError):
                return []
    return pages


def extract_company_bulletin(path: Path) -> ExtractedBulletin:
    path = Path(path).expanduser().resolve()
    with pdfplumber.open(path) as pdf:
        page_count = len(pdf.pages)
    page_texts = _extract_page_texts(path)

    first_pages = "\n".join(page_texts[:2])
    publication_date = _extract_publication_date(first_pages, path.name)
    source_sha256 = sha256_file(path)
    notices = _summary_notices(page_texts, publication_date)
    notices.extend(_incorporation_notices(page_texts, publication_date))
    notices.extend(_name_change_notices(page_texts, publication_date))
    if not notices:
        bulk_notices = _bulk_company_list_notices(page_texts, publication_date)
        if bulk_notices:
            ocr_page_texts = _ocr_page_texts(path, page_count)
            ocr_notices = _bulk_company_list_notices(ocr_page_texts, publication_date)
            notices.extend(ocr_notices or bulk_notices)

    deduplicated = {}
    for notice in notices:
        key = notice_record_key(source_sha256, notice)
        deduplicated.setdefault(key, notice)

    return ExtractedBulletin(
        source_path=path,
        source_sha256=source_sha256,
        source_filename=path.name,
        volume_number=_extract_volume(first_pages, path.name),
        issue_date=publication_date,
        publication_date=publication_date,
        page_count=page_count,
        file_size_bytes=path.stat().st_size,
        notices=list(deduplicated.values()),
        metadata={
            "source_authority": "Office of the Registrar of Companies, Ghana",
            "publication_title": "Companies Bulletin",
            "text_layer_present": any(bool(text.strip()) for text in page_texts),
            "extraction_version": EXTRACTION_VERSION,
        },
    )


def discover_unique_pdfs(paths: Iterable[Path]) -> List[Path]:
    files: List[Path] = []
    for supplied_path in paths:
        path = Path(supplied_path).expanduser()
        if path.is_dir():
            files.extend(sorted(path.glob("*.pdf")))
        elif path.is_file() and path.suffix.lower() == ".pdf":
            files.append(path)

    unique = {}
    for path in files:
        digest = sha256_file(path)
        unique.setdefault(digest, path.resolve())
    return sorted(unique.values(), key=lambda item: item.name.lower())
