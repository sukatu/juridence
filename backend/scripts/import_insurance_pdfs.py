import os
import re
import sys
import logging
from datetime import datetime
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import SessionLocal, Base, engine
from models.insurance import Insurance
from models.insurance_directors import InsuranceDirector
from models.insurance_secretaries import InsuranceSecretary
from models.insurance_auditors import InsuranceAuditor
from models.insurance_shareholders import InsuranceShareholder
from models.insurance_capital_details import InsuranceCapitalDetail
from models.insurance_share_details import InsuranceShareDetail

try:
    import pdfplumber
except Exception as exc:
    raise SystemExit("pdfplumber is required to run this script. Install it in backend/venv.") from exc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATE_FORMATS = ["%d-%b-%Y", "%d-%B-%Y", "%d/%m/%Y", "%Y-%m-%d"]


def parse_date(value: str):
    if not value:
        return None
    value = value.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def parse_decimal(value: str):
    if not value:
        return None
    value = value.replace(",", "").strip()
    try:
        return Decimal(value)
    except Exception:
        return None


def extract_text(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
    return text


def extract_key_value(text: str, key: str):
    pattern = re.compile(rf"{re.escape(key)}\s*:\s*(.+)")
    for line in text.splitlines():
        match = pattern.search(line)
        if match:
            return match.group(1).strip()
    return None


def extract_section(text: str, start_key: str, end_keys):
    lines = text.splitlines()
    start_index = None
    for idx, line in enumerate(lines):
        if start_key.lower() in line.lower():
            start_index = idx
            break
    if start_index is None:
        return []
    for idx in range(start_index + 1, len(lines)):
        if any(end_key.lower() in lines[idx].lower() for end_key in end_keys):
            return lines[start_index + 1:idx]
    return lines[start_index + 1:]


def extract_officers(section_lines, role_label):
    officers = []
    for line in section_lines:
        if role_label.lower() not in line.lower():
            continue
        if "Entity / Company Name" in line:
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        tin = parts[-1]
        position = parts[-2]
        name = " ".join(parts[:-2]).strip()
        if not name:
            continue
        officers.append({
            "full_name": name,
            "position": position,
            "tin": tin
        })
    return officers


def extract_shareholders(section_lines):
    shareholders = []
    for line in section_lines:
        if "Entity / No. of" in line or "Company TIN" in line:
            continue
        match = re.match(r"^(?P<name>.+?)\s+(?P<tin>[CP]\d{7,})\s+(?P<shares>[\d,]+)\s+(?P<value>[\d,]+\.\d{2})", line.strip())
        if match:
            try:
                shares_val = int(match.group("shares").replace(",", ""))
            except Exception:
                shares_val = None
            if shares_val is not None and shares_val > 2147483647:
                shares_val = None
            shareholders.append({
                "name": match.group("name").strip(),
                "company_registration_number": match.group("tin").strip(),
                "number_of_shares": shares_val,
                "share_value": parse_decimal(match.group("value"))
            })
    return shareholders


def extract_capital(text: str):
    currency = extract_key_value(text, "Currency of Capital")
    stated_capital = extract_key_value(text, "Stated Capital")
    authorized_equity = extract_key_value(text, "Equity")
    authorized_preference = extract_key_value(text, "Preference")
    authorized_debenture = extract_key_value(text, "Debenture")
    issued_shares = extract_key_value(text, "No. Of Issued Shares For Each Class")

    def safe_int(value):
        if value is None:
            return None
        try:
            number = int(value.replace(",", ""))
        except Exception:
            return None
        return number if number <= 2147483647 else None

    return {
        "currency": currency,
        "authorized_capital": parse_decimal(stated_capital),
        "issued_capital": parse_decimal(stated_capital),
        "paid_up_capital": None,
        "unpaid_capital": None,
        "share_details": {
            "share_class": "Equity",
            "authorized_shares": safe_int(authorized_equity),
            "issued_shares": safe_int(issued_shares),
        }
    }


def normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name or "").strip().upper()


def upsert_insurance(db, data):
    insurance = None
    if data.get("registration_number"):
        insurance = db.query(Insurance).filter(Insurance.registration_number == data["registration_number"]).first()
    if not insurance:
        insurance = db.query(Insurance).filter(Insurance.name == data["name"]).first()
    if not insurance:
        insurance = Insurance(**data)
        db.add(insurance)
        db.flush()
        return insurance
    for key, value in data.items():
        setattr(insurance, key, value)
    db.add(insurance)
    db.flush()
    return insurance


def main():
    # Ensure all models are registered before table creation
    import models  # noqa: F401
    from models.gazette import Gazette  # noqa: F401
    Base.metadata.create_all(bind=engine)
    pdf_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "insurances")
    pdf_dir = os.path.abspath(pdf_dir)
    if not os.path.isdir(pdf_dir):
        logger.error("Insurance PDF directory not found: %s", pdf_dir)
        return

    session = SessionLocal()
    try:
        files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
        logger.info("Found %d insurance PDFs", len(files))

        for filename in files:
            file_path = os.path.join(pdf_dir, filename)
            text = extract_text(file_path)
            entity_name = extract_key_value(text, "Entity Name") or filename.replace(".pdf", "")
            registration_number = extract_key_value(text, "Registration Number")
            incorporation_date = extract_key_value(text, "Original Incorporation Date")
            commencement_date = extract_key_value(text, "Commencement Date")
            company_type = extract_key_value(text, "Company Type")
            business_entity_type = extract_key_value(text, "Business Entity Type")
            nature_of_business = extract_key_value(text, "Nature Of Business / Sector")
            objects = extract_key_value(text, "Objects of the Company")
            principal_activity = extract_key_value(text, "Principal Activity")
            city = extract_key_value(text, "City")
            region = extract_key_value(text, "Region")
            country = extract_key_value(text, "Country")
            mobile_no_1 = extract_key_value(text, "Mobile No.1")

            insurance_payload = {
                "name": normalize_name(entity_name),
                "registration_number": registration_number,
                "date_of_incorporation": parse_date(incorporation_date),
                "type_of_company": company_type,
                "nature_of_business": nature_of_business,
                "description": objects,
                "city": city,
                "region": region,
                "country": country,
                "phone": mobile_no_1
            }

            insurance = upsert_insurance(session, insurance_payload)

            # Clear existing related data for idempotency
            session.query(InsuranceDirector).filter(InsuranceDirector.insurance_id == insurance.id).delete()
            session.query(InsuranceSecretary).filter(InsuranceSecretary.insurance_id == insurance.id).delete()
            session.query(InsuranceAuditor).filter(InsuranceAuditor.insurance_id == insurance.id).delete()
            session.query(InsuranceShareholder).filter(InsuranceShareholder.insurance_id == insurance.id).delete()
            session.query(InsuranceCapitalDetail).filter(InsuranceCapitalDetail.insurance_id == insurance.id).delete()
            session.query(InsuranceShareDetail).filter(InsuranceShareDetail.insurance_id == insurance.id).delete()

            officer_section = extract_section(text, "Company Officer Detail", ["Company Capital Details", "Company Capital Detail"])
            directors = extract_officers(officer_section, "Director")
            secretaries = extract_officers(officer_section, "Secretary")
            auditors = extract_officers(officer_section, "Auditor")

            for director in directors:
                session.add(InsuranceDirector(
                    insurance_id=insurance.id,
                    full_name=director["full_name"],
                    position=director["position"]
                ))

            for secretary in secretaries:
                session.add(InsuranceSecretary(
                    insurance_id=insurance.id,
                    name=secretary["full_name"]
                ))

            for auditor in auditors:
                session.add(InsuranceAuditor(
                    insurance_id=insurance.id,
                    name=auditor["full_name"]
                ))

            capital = extract_capital(text)
            if capital.get("authorized_capital"):
                session.add(InsuranceCapitalDetail(
                    insurance_id=insurance.id,
                    authorized_capital=capital["authorized_capital"],
                    issued_capital=capital.get("issued_capital"),
                    paid_up_capital=capital.get("paid_up_capital"),
                    unpaid_capital=capital.get("unpaid_capital"),
                    currency=capital.get("currency") or "GHS"
                ))

            share_details = capital.get("share_details")
            if share_details:
                session.add(InsuranceShareDetail(
                    insurance_id=insurance.id,
                    share_class=share_details.get("share_class") or "Equity",
                    authorized_shares=share_details.get("authorized_shares"),
                    issued_shares=share_details.get("issued_shares")
                ))

            shareholders_section = extract_section(text, "Subscriber/Trustee Details", ["RGD Office", "Constitution Option", "SME Details"])
            shareholders = extract_shareholders(shareholders_section)
            for shareholder in shareholders:
                session.add(InsuranceShareholder(
                    insurance_id=insurance.id,
                    name=shareholder["name"],
                    is_individual=False,
                    company_registration_number=shareholder["company_registration_number"],
                    number_of_shares=shareholder["number_of_shares"],
                    share_value=shareholder["share_value"]
                ))

            logger.info("Imported insurance: %s", insurance.name)

        session.commit()
        logger.info("Insurance PDF import completed.")
    except Exception as exc:
        session.rollback()
        logger.error("Insurance PDF import failed: %s", exc, exc_info=True)
    finally:
        session.close()


if __name__ == "__main__":
    main()
