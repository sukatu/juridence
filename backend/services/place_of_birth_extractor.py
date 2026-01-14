#!/usr/bin/env python3
"""
Production-Grade Place of Birth Correction Extractor
Extracts "Correction of Places of Birth" or "Change of Place of Birth" notices
"""

import os
import re
import logging
from typing import Dict, List, Optional
from datetime import datetime
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import pdfplumber
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PDF processing libraries not installed.")

from database import get_db
from models.gazette import Gazette, GazetteType, GazetteStatus, GazettePriority
from models.people import People
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)


class PlaceOfBirthExtractor:
    """Production-grade extractor for Place of Birth correction notices"""
    
    def __init__(self):
        self.db = next(get_db())
        
    def extract_text_from_pdf(self, file_path: str) -> Dict[str, any]:
        """Extract text from PDF with page numbers"""
        result = {
            'text': '',
            'pages': {},
            'total_pages': 0
        }
        
        if not PDF_AVAILABLE:
            logger.error("PDF libraries not available")
            return result
            
        try:
            with pdfplumber.open(file_path) as pdf:
                result['total_pages'] = len(pdf.pages)
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text() or ""
                    result['pages'][str(page_num)] = page_text
                    result['text'] += page_text + "\n"
                    
                if len(result['text'].strip()) > 100:
                    return result
                    
            # Fallback to PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                result['total_pages'] = len(pdf_reader.pages)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text() or ""
                    result['pages'][str(page_num)] = page_text
                    result['text'] += page_text + "\n"
                    
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            
        return result
    
    def extract_gazette_metadata(self, filename: str) -> Dict[str, Optional[str]]:
        """Extract gazette number, date, and other metadata from filename"""
        metadata = {
            'gazette_number': None,
            'gazette_date': None,
        }
        
        # Pattern 1: "GAZETTE NO. 94 09-05-2025 Friday.pdf"
        pattern1 = r'GAZETTE\s+NO\.?\s*(\d+)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})'
        match = re.search(pattern1, filename, re.IGNORECASE)
        if match:
            metadata['gazette_number'] = match.group(1)
            day, month, year = match.group(2), match.group(3), match.group(4)
            try:
                metadata['gazette_date'] = datetime.strptime(f"{day}/{month}/{year}", "%d/%m/%Y")
            except:
                pass
        
        # Pattern 2: "Ghana Government Gazette dated 2009-01-09 number 4.pdf"
        pattern2 = r'Ghana\s+Government\s+Gazette\s+dated\s+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+number\s+(\d+)'
        match = re.search(pattern2, filename, re.IGNORECASE)
        if match:
            year, month, day, number = match.group(1), match.group(2), match.group(3), match.group(4)
            metadata['gazette_number'] = number
            try:
                metadata['gazette_date'] = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")
            except:
                pass
        
        return metadata
    
    def remove_salutations(self, name: str) -> str:
        """Remove salutations from names"""
        salutations = [
            r'^Mr\.?\s+', r'^Mrs\.?\s+', r'^Miss\.?\s+', r'^Ms\.?\s+',
            r'^Rev\.?\s+', r'^Dr\.?\s+', r'^Prof\.?\s+', r'^Hon\.?\s+',
            r'^Chief\.?\s+', r'^Nana\.?\s+', r'^Opanin\.?\s+', r'^Maame\.?\s+'
        ]
        
        cleaned = name
        for salutation in salutations:
            cleaned = re.sub(salutation, '', cleaned, flags=re.IGNORECASE)
        
        return cleaned.strip()
    
    def extract_place_of_birth_data(self, text: str) -> Dict[str, any]:
        """Extract place of birth correction data from text"""
        data = {
            'person_name': None,
            'profession': None,
            'address': None,
            'new_place_of_birth': None,
            'old_place_of_birth': None,
            'gender': None,
            'effective_date': None,
            'remarks': None
        }
        
        # Normalize whitespace
        normalized_text = re.sub(r'\s+', ' ', text).strip()
        
        # Extract person name (usually at the start, after item number)
        # Pattern: Name at start, possibly with salutation, before profession or comma
        # Remove item number prefix if present
        text_without_item = re.sub(r'^\d+\.\s*', '', normalized_text, flags=re.IGNORECASE)
        
        # Extract name - everything before first comma (but check if it's a valid name)
        name_patterns = [
            r'^([A-Z][a-zA-Z\s\-\']{3,80}?)(?:\s*,\s*(?:a|an|of|and|resident)|$)',
            r'^([A-Z][a-zA-Z\s\-\']{3,80}?)(?:\s+(?:a|an|of|and|resident|wishes))',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text_without_item)
            if match:
                name = match.group(1).strip()
                # Remove salutations
                name = self.remove_salutations(name)
                # Validate it's a proper name (at least 2 words, reasonable length)
                if name and len(name.split()) >= 2 and len(name) > 5:
                    data['person_name'] = name
                    break
        
        # Extract gender from "his" or "her" pronouns in the text
        if re.search(r'\bhis\s+place\s+of\s+birth', normalized_text, re.IGNORECASE):
            data['gender'] = 'Male'
        elif re.search(r'\bher\s+place\s+of\s+birth', normalized_text, re.IGNORECASE):
            data['gender'] = 'Female'
        elif re.search(r'\bhis\b', normalized_text, re.IGNORECASE):
            data['gender'] = 'Male'
        elif re.search(r'\bher\b', normalized_text, re.IGNORECASE):
            data['gender'] = 'Female'
        
        # Extract new place of birth - "wishes all to know that her/his place of birth is"
        new_pob_patterns = [
            r'wishes\s+all\s+to\s+know\s+that\s+(?:her|his)\s+place\s+of\s+birth\s+is\s+([^,\.]+?)(?:\s+and\s+not|,|\.|with\s+effect|$)',
            r'place\s+of\s+birth\s+is\s+([^,\.]+?)(?:\s+and\s+not|,|\.|with\s+effect|$)',
            r'correct\s+place\s+of\s+birth\s+is\s+([^,\.]+?)(?:\s+and\s+not|,|\.|with\s+effect|$)',
        ]
        
        for pattern in new_pob_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                pob = match.group(1).strip()
                # Clean up
                pob = re.sub(r'^\s*(?:is|was|are)\s+', '', pob, flags=re.IGNORECASE)
                if pob and len(pob) > 3:
                    data['new_place_of_birth'] = pob
                    break
        
        # Extract old place of birth - usually comes after new place of birth
        # Pattern: "and not [old place]" or "formerly [old place]"
        old_pob_patterns = [
            r'and\s+not\s+([^,\.]+?)(?:\s+with\s+effect|,|\.|All\s+documents|$)',
            r'formerly\s+([^,\.]+?)(?:\s+with\s+effect|,|\.|All\s+documents|$)',
            r'previous\s+place\s+of\s+birth\s+was\s+([^,\.]+?)(?:\s+with\s+effect|,|\.|All\s+documents|$)',
        ]
        
        for pattern in old_pob_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                pob = match.group(1).strip()
                if pob and len(pob) > 3:
                    data['old_place_of_birth'] = pob
                    break
        
        # Extract profession - usually between name and address
        # Look for patterns like "a Student", "an Engineer", etc. before "and of" or "resident"
        profession_patterns = [
            r'(?:^|,\s*)(?:a|an)\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)*?)\s+(?:and\s+of|resident|address|of\s+[A-Z])',
            r'(?:^|,\s*)([A-Z][a-zA-Z\s]+(?:with\s+Reg\.?\s+No\.?|of\s+[A-Z])[^,]+?)\s+(?:and\s+of|resident|address)',
        ]
        
        for pattern in profession_patterns:
            match = re.search(pattern, normalized_text)
            if match:
                profession_text = match.group(1).strip()
                # Filter out common false positives
                if len(profession_text) > 5 and not re.match(r'^(and|of|the|a|an|wishes)\s+', profession_text, re.IGNORECASE):
                    # Stop at "and of" if present
                    profession_text = re.split(r'\s+and\s+of\s+', profession_text, 1, flags=re.IGNORECASE)[0]
                    data['profession'] = profession_text.strip()
                    break
        
        # Extract address - usually after "and of" or "resident"
        address_patterns = [
            r'and\s+of\s+([^\.]+?)(?:\s+wishes\s+all|\.|with\s+effect|$)',
            r'resident\s+(?:at|of)\s+([^\.]+?)(?:\s+wishes\s+all|\.|with\s+effect|$)',
            r'address[:\s]+([^\.]+?)(?:\s+wishes\s+all|\.|with\s+effect|$)',
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                address_text = match.group(1).strip()
                # Clean up
                address_text = re.sub(r'^\s*(?:at|of|is|was)\s+', '', address_text, flags=re.IGNORECASE)
                if len(address_text) > 10:  # Reasonable address length
                    data['address'] = address_text
                    break
        
        # Extract effective date - "with effect from"
        date_patterns = [
            r'with\s+effect\s+from\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})',
            r'with\s+effect\s+from\s+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) == 3:
                        if match.group(2).isdigit():
                            # Format: DD/MM/YYYY
                            day, month, year = match.group(1), match.group(2), match.group(3)
                            data['effective_date'] = datetime.strptime(f"{day}/{month}/{year}", "%d/%m/%Y")
                        else:
                            # Format: DD Month YYYY
                            day, month_name, year = match.group(1), match.group(2), match.group(3)
                            data['effective_date'] = datetime.strptime(f"{day} {month_name} {year}", "%d %B %Y")
                except:
                    pass
                break
        
        # Extract remarks - "all documents bearing his/her former name/place of birth are still valid"
        remarks_patterns = [
            r'(all\s+documents\s+bearing\s+(?:his|her)\s+(?:former\s+)?(?:name|place\s+of\s+birth)\s+are\s+still\s+valid)',
            r'(all\s+documents\s+bearing\s+(?:his|her)\s+former\s+name\s+are\s+still\s+valid)',
        ]
        
        for pattern in remarks_patterns:
            remarks_match = re.search(pattern, normalized_text, re.IGNORECASE)
            if remarks_match:
                data['remarks'] = remarks_match.group(1)
                break
        
        return data
    
    def process_place_of_birth_section(self, text: str, page_num: int, gazette_metadata: Dict, document_filename: str) -> List[Gazette]:
        """Process a section of text containing Place of Birth correction notices"""
        saved_entries = []
        
        # Split entries by item numbers (1-5 digits followed by period)
        entries = re.split(r'(?=^\d{1,5}\.\s+)', text, flags=re.MULTILINE)
        
        for entry_text in entries:
            entry_text = entry_text.strip()
            
            # Skip if entry is too short or too long (likely invalid)
            if len(entry_text) < 50 or len(entry_text) > 3000:
                continue
            
            # Must contain place of birth related phrases
            if not re.search(r'place\s+of\s+birth|wishes\s+all\s+to\s+know', entry_text, re.IGNORECASE):
                continue
            
            # Extract item number
            item_match = re.search(r'^(\d{1,5})\.', entry_text, re.MULTILINE)
            if not item_match:
                continue
            
            item_number = item_match.group(1)
            
            # Extract data
            entry_data = self.extract_place_of_birth_data(entry_text)
            
            if not entry_data['person_name']:
                logger.warning(f"Could not extract person name from entry {item_number} on page {page_num}")
                continue
            
            # Prepare gazette entry data
            gazette_data = {
                'item_number': item_number,
                'person_name': entry_data['person_name'],
                'profession': entry_data['profession'] or 'N/A',
                'address': entry_data['address'] or 'N/A',
                'new_place_of_birth': entry_data['new_place_of_birth'],
                'old_place_of_birth': entry_data['old_place_of_birth'],
                'gender': entry_data['gender'],
                'effective_date': entry_data['effective_date'],
                'remarks': entry_data['remarks'],
                'gazette_number': gazette_metadata.get('gazette_number'),
                'gazette_date': gazette_metadata.get('gazette_date'),
                'gazette_page': page_num,
                'document_filename': document_filename,
            }
            
            # Save entry
            saved_entry = self.save_gazette_entry(gazette_data)
            if saved_entry:
                saved_entries.append(saved_entry)
        
        return saved_entries
    
    def find_or_create_person(self, full_name: str, gender: Optional[str] = None) -> Optional[People]:
        """Find or create a person entry"""
        try:
            # Try to find existing person
            person = self.db.query(People).filter(
                People.full_name.ilike(full_name)
            ).first()
            
            if person:
                return person
            
            # Split full name into first and last name
            name_parts = full_name.strip().split()
            first_name = name_parts[0] if name_parts else full_name
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else full_name
            
            # Create new person
            person = People(
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                gender=gender,
                status='active',
                country='Ghana',
                nationality='Ghanaian'
            )
            
            self.db.add(person)
            self.db.commit()
            self.db.refresh(person)
            return person
            
        except IntegrityError as e:
            self.db.rollback()
            logger.warning(f"Unique violation creating person {full_name}: {e}")
            # Try to find again after rollback
            person = self.db.query(People).filter(
                People.full_name.ilike(full_name)
            ).first()
            return person
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating person {full_name}: {e}")
            return None
    
    def save_gazette_entry(self, entry_data: Dict) -> Optional[Gazette]:
        """Save a place of birth correction entry to the database"""
        try:
            # Check if entry already exists
            existing = self.db.query(Gazette).filter(
                Gazette.gazette_type == GazetteType.CHANGE_OF_PLACE_OF_BIRTH,
                Gazette.item_number == entry_data['item_number'],
                Gazette.document_filename == entry_data['document_filename']
            ).first()
            
            if existing:
                logger.debug(f"Entry {entry_data['item_number']} already exists, skipping")
                return existing
            
            # Find or create person
            person = self.find_or_create_person(
                entry_data['person_name'],
                entry_data.get('gender')
            )
            
            # Create source details
            source_parts = []
            if entry_data.get('gazette_number'):
                source_parts.append(f"Gazette No. {entry_data['gazette_number']}")
            if entry_data.get('gazette_date'):
                source_parts.append(f"Gazette Date: {entry_data['gazette_date'].strftime('%d %B %Y')}")
            source_details = " | ".join(source_parts) if source_parts else 'N/A'
            
            # Create gazette entry
            gazette = Gazette(
                gazette_type=GazetteType.CHANGE_OF_PLACE_OF_BIRTH,
                status=GazetteStatus.PUBLISHED,
                priority=GazettePriority.MEDIUM,
                
                # Source identification
                gazette_number=str(entry_data.get('gazette_number', '')),
                gazette_date=entry_data.get('gazette_date'),
                gazette_page=entry_data.get('gazette_page'),
                item_number=entry_data['item_number'],
                document_filename=entry_data['document_filename'],
                
                # Person information
                current_name=entry_data['person_name'],  # Using current_name for person name
                gender=entry_data.get('gender'),
                profession=entry_data.get('profession'),
                address=entry_data.get('address'),
                
                # Place of birth information
                new_place_of_birth=entry_data.get('new_place_of_birth'),
                old_place_of_birth=entry_data.get('old_place_of_birth'),
                
                # Dates
                effective_date=entry_data.get('effective_date'),
                effective_date_of_change=entry_data.get('effective_date'),
                
                # Additional details
                remarks=entry_data.get('remarks'),
                source=source_details,
                
                # Links
                person_id=person.id if person else None,
                
                # Metadata
                publication_date=datetime.now(),
                is_public=True,
            )
            
            self.db.add(gazette)
            self.db.commit()
            self.db.refresh(gazette)
            
            logger.info(f"Saved Place of Birth entry: Item {entry_data['item_number']} - {entry_data['person_name']}")
            return gazette
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error saving entry {entry_data.get('item_number', 'unknown')}: {e}")
            return None
    
    def close(self):
        """Close database connection"""
        if self.db:
            self.db.close()

