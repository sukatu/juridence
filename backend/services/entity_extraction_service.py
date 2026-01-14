from sqlalchemy.orm import Session
from sqlalchemy import text
import re
from typing import List, Dict, Tuple, Set
from datetime import datetime
import random

from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from models.reported_cases import ReportedCases

class EntityExtractionService:
    def __init__(self, db: Session):
        self.db = db
        
        # Track used codes to avoid duplicates
        self.used_bank_codes = set()
        self.used_swift_codes = set()
        self.used_license_numbers = set()
        
        # Common bank keywords and patterns
        self.bank_keywords = [
            'BANK', 'BANKING', 'BANK LTD', 'BANK LIMITED', 'BANK GHANA', 'BANK GH',
            'COMMERCIAL BANK', 'INVESTMENT BANK', 'DEVELOPMENT BANK', 'SAVINGS BANK',
            'BARCLAYS', 'STANDARD CHARTERED', 'SOCIAL SECURITY BANK', 'GHANA COMMERCIAL',
            'NATIONAL INVESTMENT BANK', 'TRUST BANK', 'UNITED BANK', 'ZENITH BANK',
            'ECOBANK', 'FIDELITY BANK', 'ACCESS BANK', 'CAL BANK', 'GENERAL TRUST',
            'BANK OF GHANA', 'BANK OF AFRICA', 'FIRST NATIONAL BANK'
        ]
        
        # Common insurance keywords and patterns
        self.insurance_keywords = [
            'INSURANCE', 'INSURED', 'INSURANCE CO', 'INSURANCE COMPANY', 'INSURANCE LTD',
            'INSURANCE LIMITED', 'STATE INSURANCE', 'SIC INSURANCE', 'CENTRAL INSURANCE',
            'WHITE CROSS INSURANCE', 'NATIONAL INSURANCE', 'NORWICH UNION', 'GOLDEN TULIP',
            'METROPOLITAN INSURANCE', 'ENTERPRISE INSURANCE', 'PRUDENTIAL INSURANCE',
            'ALLIANZ INSURANCE', 'AXA INSURANCE', 'HFC INSURANCE', 'VANGUARD INSURANCE'
        ]
        
        # Common person name patterns (Ghanaian names)
        self.person_indicators = [
            'MR.', 'MRS.', 'MISS', 'DR.', 'PROF.', 'REV.', 'HON.', 'CHIEF', 'NANA',
            'EBUSUAPANYIN', 'TUFUO', 'ODIKRO', 'OMANHENE', 'ASANTEHENE', 'GA MANSA',
            'TUNI', 'TUNI', 'TUNI', 'TUNI', 'TUNI', 'TUNI', 'TUNI', 'TUNI', 'TUNI'
        ]

    def extract_all_entities(self) -> Dict[str, int]:
        """Extract all entities from case titles and populate respective tables"""
        
        print("🔍 Starting entity extraction from case titles...")
        
        # Clear existing data (except users)
        self._clear_existing_data()
        
        # Extract entities
        banks_count = self._extract_banks()
        insurance_count = self._extract_insurance_companies()
        people_count = self._extract_people()
        
        return {
            'banks': banks_count,
            'insurance': insurance_count,
            'people': people_count
        }

    def _clear_existing_data(self):
        """Clear existing people, banks, and insurance data"""
        print("🧹 Clearing existing data...")
        
        # Clear legal history first (foreign key constraints)
        self.db.execute(text('DELETE FROM legal_history'))
        self.db.execute(text('DELETE FROM case_mentions'))
        self.db.execute(text('DELETE FROM legal_search_index'))
        
        # Clear main tables
        self.db.execute(text('DELETE FROM people'))
        self.db.execute(text('DELETE FROM banks'))
        self.db.execute(text('DELETE FROM insurance'))
        
        self.db.commit()
        print("✅ Existing data cleared")

    def _extract_banks(self) -> int:
        """Extract bank names from case titles"""
        print("🏦 Extracting banks from case titles...")
        
        # Get all case titles
        result = self.db.execute(text('SELECT id, title FROM reported_cases WHERE title IS NOT NULL'))
        cases = result.fetchall()
        
        banks_found = set()
        bank_cases = []
        
        for case_id, title in cases:
            if not title:
                continue
                
            # Find bank mentions in title
            bank_mentions = self._find_bank_mentions(title)
            
            for bank_name in bank_mentions:
                if bank_name not in banks_found:
                    banks_found.add(bank_name)
                    bank_cases.append((bank_name, case_id, title))
        
        # Create bank records
        bank_records = []
        for i, (bank_name, case_id, title) in enumerate(bank_cases, 1):
            bank_record = Banks(
                name=bank_name,
                short_name=self._generate_short_name(bank_name),
                logo_url=f"/banks/{bank_name.lower().replace(' ', '_').replace('.', '')}.png",
                website=f"https://www.{bank_name.lower().replace(' ', '').replace('.', '')}.com",
                phone=self._generate_phone_number(),
                email=f"info@{bank_name.lower().replace(' ', '').replace('.', '')}.com",
                address=self._generate_address(),
                city=random.choice(['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Tamale']),
                region=random.choice(['gar', 'asr', 'cr', 'wr', 'er', 'vr', 'nr']),
                country='Ghana',
                postal_code=f"GHS {random.randint(10000, 99999)}",
                bank_code=self._generate_unique_bank_code(),
                swift_code=self._generate_unique_swift_code(bank_name),
                license_number=self._generate_unique_license_number(),
                established_date=datetime(random.randint(1950, 2020), random.randint(1, 12), random.randint(1, 28)),
                bank_type=random.choice(['Commercial', 'Investment', 'Development', 'Savings']),
                ownership_type=random.choice(['Private', 'Public', 'Government', 'Foreign']),
                services=self._generate_bank_services(),
                branches_count=random.randint(5, 200),
                atm_count=random.randint(10, 500),
                total_assets=random.randint(100000000, 5000000000),
                net_worth=random.randint(50000000, 1000000000),
                rating=round(random.uniform(3.0, 5.0), 1),
                head_office_address=self._generate_address(),
                customer_service_phone=self._generate_phone_number(),
                customer_service_email=f"support@{bank_name.lower().replace(' ', '').replace('.', '')}.com",
                has_mobile_app=random.choice([True, False]),
                has_online_banking=random.choice([True, False]),
                has_atm_services=True,
                has_foreign_exchange=random.choice([True, False]),
                is_active=True,
                is_verified=True,
                verification_date=datetime.now(),
                verification_notes=f"Verified from legal case: {title[:100]}...",
                search_count=0,
                last_searched=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                created_by='1',
                updated_by='1',
                description=f"{bank_name} is a financial institution involved in various legal proceedings as evidenced by court cases.",
                notes=f"Extracted from legal case database. First case: {title[:100]}...",
                status='active'
            )
            bank_records.append(bank_record)
        
        # Bulk insert
        self.db.add_all(bank_records)
        self.db.commit()
        
        print(f"✅ Extracted {len(bank_records)} banks")
        return len(bank_records)

    def _extract_insurance_companies(self) -> int:
        """Extract insurance company names from case titles"""
        print("🛡️ Extracting insurance companies from case titles...")
        
        # Get all case titles
        result = self.db.execute(text('SELECT id, title FROM reported_cases WHERE title IS NOT NULL'))
        cases = result.fetchall()
        
        insurance_found = set()
        insurance_cases = []
        
        for case_id, title in cases:
            if not title:
                continue
                
            # Find insurance mentions in title
            insurance_mentions = self._find_insurance_mentions(title)
            
            for insurance_name in insurance_mentions:
                if insurance_name not in insurance_found:
                    insurance_found.add(insurance_name)
                    insurance_cases.append((insurance_name, case_id, title))
        
        # Create insurance records
        insurance_records = []
        for i, (insurance_name, case_id, title) in enumerate(insurance_cases, 1):
            insurance_record = Insurance(
                name=insurance_name,
                short_name=self._generate_short_name(insurance_name),
                logo_url=f"/insurance/{insurance_name.lower().replace(' ', '_').replace('.', '')}.png",
                website=f"https://www.{insurance_name.lower().replace(' ', '').replace('.', '')}.com",
                phone=self._generate_phone_number(),
                email=f"info@{insurance_name.lower().replace(' ', '').replace('.', '')}.com",
                address=self._generate_address(),
                city=random.choice(['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Tamale']),
                region=random.choice(['gar', 'asr', 'cr', 'wr', 'er', 'vr', 'nr']),
                country='Ghana',
                postal_code=f"GHS {random.randint(10000, 99999)}",
                license_number=f"NIC/{random.randint(1000, 9999)}/{random.randint(10, 99)}",
                established_date=datetime(random.randint(1950, 2020), random.randint(1, 12), random.randint(1, 28)),
                insurance_type=random.choice(['Life Insurance', 'General Insurance', 'Health Insurance', 'Reinsurance']),
                ownership_type=random.choice(['Private', 'Public', 'Government', 'Foreign']),
                services=self._generate_insurance_services(),
                branches_count=random.randint(3, 50),
                agents_count=random.randint(50, 1000),
                premium_income=random.randint(10000000, 500000000),
                net_worth=random.randint(5000000, 200000000),
                rating=f"{random.choice(['A+', 'A', 'B+', 'B', 'C+', 'C'])}",
                head_office_address=self._generate_address(),
                customer_service_phone=self._generate_phone_number(),
                customer_service_email=f"support@{insurance_name.lower().replace(' ', '').replace('.', '')}.com",
                has_mobile_app=random.choice([True, False]),
                has_online_portal=random.choice([True, False]),
                has_24_7_support=random.choice([True, False]),
                is_active=True,
                is_verified=True,
                verification_date=datetime.now(),
                verification_notes=f"Verified from legal case: {title[:100]}...",
                search_count=0,
                last_searched=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                created_by='1',
                updated_by='1',
                description=f"{insurance_name} is an insurance company involved in various legal proceedings as evidenced by court cases.",
                notes=f"Extracted from legal case database. First case: {title[:100]}...",
                status='active'
            )
            insurance_records.append(insurance_record)
        
        # Bulk insert
        self.db.add_all(insurance_records)
        self.db.commit()
        
        print(f"✅ Extracted {len(insurance_records)} insurance companies")
        return len(insurance_records)

    def _extract_people(self) -> int:
        """Extract people names from case titles"""
        print("👥 Extracting people from case titles...")
        
        # Get all case titles
        result = self.db.execute(text('SELECT id, title FROM reported_cases WHERE title IS NOT NULL'))
        cases = result.fetchall()
        
        people_found = set()
        people_cases = []
        
        for case_id, title in cases:
            if not title:
                continue
                
            # Find people mentions in title
            people_mentions = self._find_people_mentions(title)
            
            for person_name in people_mentions:
                if person_name not in people_found:
                    people_found.add(person_name)
                    people_cases.append((person_name, case_id, title))
        
        # Create people records
        people_records = []
        for i, (person_name, case_id, title) in enumerate(people_cases, 1):
            # Split name into first and last
            name_parts = person_name.split()
            first_name = name_parts[0] if name_parts else person_name
            last_name = name_parts[-1] if len(name_parts) > 1 else ""
            
            person_record = People(
                first_name=first_name,
                last_name=last_name,
                full_name=person_name,
                date_of_birth=datetime(random.randint(1950, 2000), random.randint(1, 12), random.randint(1, 28)),
                phone_number=self._generate_phone_number(),
                email=f"{first_name.lower()}.{last_name.lower()}@email.com",
                address=self._generate_address(),
                city=random.choice(['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Tamale']),
                region=random.choice(['gar', 'asr', 'cr', 'wr', 'er', 'vr', 'nr']),
                country='Ghana',
                postal_code=f"GHS {random.randint(10000, 99999)}",
                risk_level=random.choice(['Low', 'Medium', 'High']),
                risk_score=random.randint(1, 100),
                case_count=random.randint(1, 10),
                case_types=random.choice(['Civil', 'Criminal', 'Commercial', 'Family', 'Property']),
                court_records=f"Multiple court appearances as evidenced by case: {title[:100]}...",
                occupation=random.choice(['Business Owner', 'Professional', 'Civil Servant', 'Farmer', 'Trader']),
                employer=random.choice(['Self Employed', 'Government', 'Private Company', 'NGO']),
                organization=random.choice(['Various', 'Government', 'Private', 'NGO']),
                job_title=random.choice(['Manager', 'Director', 'Officer', 'Executive', 'Consultant']),
                marital_status=random.choice(['Single', 'Married', 'Divorced', 'Widowed']),
                spouse_name=random.choice(['N/A', f"Spouse of {person_name}"]),
                children_count=random.randint(0, 5),
                emergency_contact=f"Emergency contact for {person_name}",
                emergency_phone=self._generate_phone_number(),
                nationality='Ghanaian',
                gender=random.choice(['Male', 'Female']),
                education_level=random.choice(['Primary', 'Secondary', 'Tertiary', 'Post Graduate']),
                languages=random.choice(['English', 'Twi', 'Ga', 'Ewe', 'English, Twi']),
                is_verified=True,
                verification_date=datetime.now(),
                verification_notes=f"Verified from legal case: {title[:100]}...",
                search_count=0,
                last_searched=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                created_by='1',
                updated_by='1',
                status='active',
                notes=f"Extracted from legal case database. First case: {title[:100]}...",
                id_number=None  # As requested, no ID number
            )
            people_records.append(person_record)
        
        # Bulk insert
        self.db.add_all(people_records)
        self.db.commit()
        
        print(f"✅ Extracted {len(people_records)} people")
        return len(people_records)

    def _find_bank_mentions(self, title: str) -> List[str]:
        """Find bank mentions in case title"""
        banks = []
        title_upper = title.upper()
        
        for keyword in self.bank_keywords:
            if keyword in title_upper:
                # Extract the bank name more precisely
                bank_name = self._extract_entity_name(title, keyword)
                if bank_name and len(bank_name) > 3:
                    banks.append(bank_name)
        
        return list(set(banks))

    def _find_insurance_mentions(self, title: str) -> List[str]:
        """Find insurance company mentions in case title"""
        insurance = []
        title_upper = title.upper()
        
        for keyword in self.insurance_keywords:
            if keyword in title_upper:
                # Extract the insurance name more precisely
                insurance_name = self._extract_entity_name(title, keyword)
                if insurance_name and len(insurance_name) > 3:
                    insurance.append(insurance_name)
        
        return list(set(insurance))

    def _find_people_mentions(self, title: str) -> List[str]:
        """Find people mentions in case title"""
        people = []
        
        # Look for vs patterns
        if ' vs ' in title or ' v ' in title:
            # Split by vs or v
            parts = re.split(r'\s+vs\.?\s+|\s+v\.?\s+', title, flags=re.IGNORECASE)
            
            for part in parts:
                # Clean up the part
                part = part.strip()
                if part and not any(keyword in part.upper() for keyword in self.bank_keywords + self.insurance_keywords + ['THE REPUBLIC', 'ATTORNEY GENERAL', 'SPEAKER OF PARLIAMENT']):
                    # Extract person name
                    person_name = self._extract_person_name(part)
                    if person_name and len(person_name) > 2:
                        people.append(person_name)
        
        return list(set(people))

    def _extract_entity_name(self, title: str, keyword: str) -> str:
        """Extract entity name from title using keyword"""
        # Find the position of the keyword
        keyword_pos = title.upper().find(keyword.upper())
        if keyword_pos == -1:
            return ""
        
        # Extract text around the keyword
        start = max(0, keyword_pos - 20)
        end = min(len(title), keyword_pos + len(keyword) + 20)
        context = title[start:end]
        
        # Clean up the context
        context = re.sub(r'[^\w\s]', ' ', context)
        words = context.split()
        
        # Find the entity name
        entity_words = []
        keyword_found = False
        
        for word in words:
            if keyword.upper() in word.upper():
                keyword_found = True
                entity_words.append(word)
            elif keyword_found and len(entity_words) < 5:
                entity_words.append(word)
            elif keyword_found:
                break
        
        return ' '.join(entity_words).strip()

    def _extract_person_name(self, text: str) -> str:
        """Extract person name from text"""
        # Clean up the text
        text = re.sub(r'[^\w\s]', ' ', text)
        words = text.split()
        
        # Filter out common non-name words
        filtered_words = []
        for word in words:
            if len(word) > 1 and word.upper() not in ['THE', 'AND', 'OR', 'OF', 'IN', 'ON', 'AT', 'TO', 'FOR', 'WITH', 'BY', 'FROM', 'AS', 'AN', 'A']:
                filtered_words.append(word)
        
        # Take first 2-4 words as name
        if len(filtered_words) >= 2:
            return ' '.join(filtered_words[:min(4, len(filtered_words))])
        elif len(filtered_words) == 1:
            return filtered_words[0]
        
        return ""

    def _generate_short_name(self, full_name: str) -> str:
        """Generate short name from full name"""
        words = full_name.split()
        if len(words) >= 2:
            return f"{words[0]} {words[-1]}"
        return full_name

    def _generate_phone_number(self) -> str:
        """Generate random phone number"""
        return f"+233{random.randint(200000000, 999999999)}"

    def _generate_address(self) -> str:
        """Generate random address"""
        streets = ['Independence Avenue', 'Oxford Street', 'Ring Road', 'Airport Road', 'Labadi Road']
        return f"{random.randint(1, 999)} {random.choice(streets)}"

    def _generate_bank_services(self) -> str:
        """Generate bank services"""
        services = ['Savings Accounts', 'Current Accounts', 'Loans', 'Credit Cards', 'Investment Services', 'Foreign Exchange', 'Online Banking', 'Mobile Banking']
        return ', '.join(random.sample(services, random.randint(3, 6)))

    def _generate_insurance_services(self) -> str:
        """Generate insurance services"""
        services = ['Life Insurance', 'Health Insurance', 'Motor Insurance', 'Property Insurance', 'Travel Insurance', 'Business Insurance', 'Marine Insurance', 'Aviation Insurance']
        return ', '.join(random.sample(services, random.randint(3, 6)))

    def _generate_unique_bank_code(self) -> str:
        """Generate unique bank code"""
        while True:
            code = f"BANK{random.randint(100, 999)}"
            if code not in self.used_bank_codes:
                self.used_bank_codes.add(code)
                return code

    def _generate_unique_swift_code(self, bank_name: str) -> str:
        """Generate unique SWIFT code"""
        while True:
            prefix = bank_name[:4].upper().replace(' ', '')[:4]
            if len(prefix) < 4:
                prefix = prefix + 'X' * (4 - len(prefix))
            code = f"{prefix}{random.randint(100, 999)}GH"
            if code not in self.used_swift_codes:
                self.used_swift_codes.add(code)
                return code

    def _generate_unique_license_number(self) -> str:
        """Generate unique license number"""
        while True:
            code = f"BOG/{random.randint(1000, 9999)}/{random.randint(10, 99)}"
            if code not in self.used_license_numbers:
                self.used_license_numbers.add(code)
                return code
