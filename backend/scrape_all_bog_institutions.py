"""
Comprehensive script to scrape all financial institutions from Bank of Ghana website
and add them to the banks table
"""
import requests
from bs4 import BeautifulSoup
import time
from database import SessionLocal
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# All category URLs from BOG website
CATEGORY_URLS = {
    "Banks": "https://www.bog.gov.gh/supervision-regulation/registered-institutions/banks/",
    "Other Banks": "https://www.bog.gov.gh/supervision-regulation/registered-institutions/other-banks/",
    "Savings and Loans": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/savings-loans/",
    "Finance Houses": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/finance-houses/",
    "Leasing Companies": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/leasing-companies/",
    "Representative Offices": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/representative-offices/",
    "Finance and Leasing Companies": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/finance-and-leasing-companies/",
    "Mortgage Finance": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/mortgage-finance/",
    "Remittance Companies": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/remittance-companies/",
    "Deposit-taking Microfinance": "https://www.bog.gov.gh/supervision-regulation/ofisd/microfinance-institutions/",
    "Financial NGOs": "https://www.bog.gov.gh/supervision-regulation/ofisd/financial-ngos/",
    "Foreign Exchange Bureaux": "https://www.bog.gov.gh/supervision-regulation/ofisd/forex-exchange-bureaux/",
    "Microcredit Institutions": "https://www.bog.gov.gh/supervision-regulation/ofisd/micro-credit/",
    "Rural and Community Banks": "https://www.bog.gov.gh/supervision-regulation/ofisd/list-of-ofis/rural-and-community-banks",
    "Licensed PSPs": "https://www.bog.gov.gh/supervision-regulation/registered-institutions/list-of-licensed-psps/",
    "Credit Bureaus": "https://www.bog.gov.gh/supervision-regulation/fsd/licensed-credit-bureaus/",
    "Development Finance Institutions": "https://www.bog.gov.gh/supervision-regulation/all-institutions/development-finance-institutions/",
    "Digital Lending Applications": "https://www.bog.gov.gh/supervision-regulation/register-of-licensed-institutions/digital-lending-applications/",
    "Corporate Governance Certification Vendors": "https://www.bog.gov.gh/supervision-regulation/corporate-governance-certification-vendors/",
}

def extract_institutions_from_page(url, category_name):
    """Extract institution names from a BOG category page"""
    institutions = []
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table
        table = soup.find('table')
        if not table:
            logger.warning(f"No table found on {category_name} page")
            return institutions
        
        # Find all rows in tbody
        tbody = table.find('tbody')
        if not tbody:
            logger.warning(f"No tbody found on {category_name} page")
            return institutions
        
        rows = tbody.find_all('tr')
        for row in rows:
            cells = row.find_all('td')
            if cells:
                # First cell typically contains the institution name
                institution_name = cells[0].get_text(strip=True)
                if institution_name:
                    institutions.append(institution_name)
        
        logger.info(f"Extracted {len(institutions)} institutions from {category_name}")
        return institutions
        
    except Exception as e:
        logger.error(f"Error extracting from {category_name} ({url}): {e}")
        return institutions

def normalize_name(name):
    """Normalize bank name for comparison"""
    return name.upper().strip()

def import_institutions(institutions_list):
    """Import institutions into the banks table"""
    db = SessionLocal()
    try:
        added_count = 0
        skipped_count = 0
        
        for institution_name in institutions_list:
            if not institution_name:
                continue
                
            normalized = normalize_name(institution_name)
            
            # Check if bank already exists (case-insensitive)
            existing = db.execute(
                text("SELECT id, name FROM banks WHERE UPPER(TRIM(name)) = :name"),
                {"name": normalized}
            ).fetchone()
            
            if existing:
                skipped_count += 1
            else:
                # Create new bank using raw SQL
                result = db.execute(
                    text("""
                        INSERT INTO banks (name, created_at, updated_at)
                        VALUES (:name, NOW(), NOW())
                        RETURNING id
                    """),
                    {"name": institution_name}
                )
                new_id = result.fetchone()[0]
                logger.info(f"Added: {institution_name} (ID: {new_id})")
                added_count += 1
        
        db.commit()
        return added_count, skipped_count
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error importing institutions: {e}", exc_info=True)
        raise
    finally:
        db.close()

def main():
    """Main function to scrape and import all institutions"""
    all_institutions = []
    
    logger.info("="*60)
    logger.info("Starting BOG Institution Scraping")
    logger.info("="*60)
    
    for category_name, url in CATEGORY_URLS.items():
        logger.info(f"\nProcessing: {category_name}")
        logger.info(f"URL: {url}")
        
        institutions = extract_institutions_from_page(url, category_name)
        all_institutions.extend(institutions)
        
        # Be polite - wait between requests
        time.sleep(2)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_institutions = []
    for inst in all_institutions:
        normalized = normalize_name(inst)
        if normalized not in seen:
            seen.add(normalized)
            unique_institutions.append(inst)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Total unique institutions found: {len(unique_institutions)}")
    logger.info(f"{'='*60}\n")
    
    # Import to database
    logger.info("Importing institutions to database...")
    added, skipped = import_institutions(unique_institutions)
    
    logger.info(f"\n{'='*60}")
    logger.info("Import Summary:")
    logger.info(f"  Added: {added} institutions")
    logger.info(f"  Skipped (already exist): {skipped} institutions")
    logger.info(f"  Total processed: {len(unique_institutions)} institutions")
    logger.info(f"{'='*60}")

if __name__ == "__main__":
    main()
