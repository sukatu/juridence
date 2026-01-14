#!/usr/bin/env python3
"""
Production-Grade Change of Name Extractor
Extracts ONLY "Change of Name" notices and creates master + variant rows
"""

import os
import re
import json
import hashlib
import logging
from typing import Dict, List, Optional, Tuple, Set
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

logger = logging.getLogger(__name__)


class ChangeOfNameExtractor:
    """Production-grade extractor for Change of Name notices only"""
    
    def __init__(self):
        self.db = next(get_db())
        self.processed_name_sets: Set[str] = set()  # Track processed name_set_ids
        
    def extract_text_from_pdf(self, file_path: str) -> Dict[str, any]:
        """Extract text from PDF with page numbers"""
        result = {
            'text': '',
            'pages': {},  # page_num: text
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
            'gazette_type_flag': None
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
        
        # Pattern 2: "2025 Gazette_14th February.pdf"
        pattern2 = r'(\d{4})\s+Gazette[_\s]+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)'
        match = re.search(pattern2, filename, re.IGNORECASE)
        if match:
            year, day, month = match.group(1), match.group(2), match.group(3)
            try:
                month_map = {
                    'january': 1, 'february': 2, 'march': 3, 'april': 4,
                    'may': 5, 'june': 6, 'july': 7, 'august': 8,
                    'september': 9, 'october': 10, 'november': 11, 'december': 12
                }
                month_num = month_map.get(month.lower())
                if month_num:
                    metadata['gazette_date'] = datetime(int(year), month_num, int(day))
            except:
                pass
        
        # Pattern 3: "Ghana Government Gazette dated 2009-01-09 number 4.pdf"
        pattern3 = r'dated\s+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2}).*?number\s+(\d+)'
        match = re.search(pattern3, filename, re.IGNORECASE)
        if match:
            year, month, day, gaz_num = match.group(1), match.group(2), match.group(3), match.group(4)
            metadata['gazette_number'] = gaz_num
            try:
                metadata['gazette_date'] = datetime(int(year), int(month), int(day))
            except:
                pass
        
        # Pattern 4: "Ghana Government Gazette dated YYYY-MM-DD number X.pdf" (alternative format)
        pattern4 = r'(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2}).*?number\s+(\d+)'
        if not metadata['gazette_number']:
            match = re.search(pattern4, filename, re.IGNORECASE)
            if match:
                year, month, day, gaz_num = match.group(1), match.group(2), match.group(3), match.group(4)
                metadata['gazette_number'] = gaz_num
                try:
                    metadata['gazette_date'] = datetime(int(year), int(month), int(day))
                except:
                    pass
        
        return metadata
    
    def extract_item_number(self, text: str) -> Optional[str]:
        """Extract Item Number from text"""
        patterns = [
            r'Item\s+No\.?\s*[:\-]?\s*(\d{4,6})',
            r'Item\s*[:\-]?\s*(\d{4,6})',
            r'^(\d{4,6})\s+[A-Z]',
            r'\n(\d{4,6})\s+[A-Z]',
            r'\b(24\d{3}|25\d{3})\b',  # Typical item number ranges
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            if matches:
                item_no = matches[0]
                if 4 <= len(item_no) <= 6 and item_no.isdigit():
                    item_num = int(item_no)
                    # Filter out years (2020-2099) and page numbers (2800-3000)
                    if not (2020 <= item_num <= 2099 or 2800 <= item_num <= 3000):
                        return item_no
        
        return None
    
    def identify_gender(self, text: str, name: str = "") -> Optional[str]:
        """Identify gender from text context and names
        
        Uses salutations (Mr., Mrs., Miss, Ms.) and name patterns to determine gender.
        Returns 'Male' or 'Female' or None if uncertain.
        """
        text_lower = text.lower()
        
        # Check for explicit salutations first (most reliable)
        if re.search(r'\bmr\.|\bmr\s', text_lower):
            return 'Male'
        elif re.search(r'\bmrs\.|\bmrs\s|\bmiss\s|\bms\.|\bms\s', text_lower):
            return 'Female'
        
        # Check for other indicators
        male_indicators = ['male', 'son of', 'son', 'brother', 'he ', 'his ', 'him ']
        female_indicators = ['female', 'daughter of', 'daughter', 'sister', 'she ', 'her ']
        
        if any(indicator in text_lower for indicator in male_indicators):
            return 'Male'
        elif any(indicator in text_lower for indicator in female_indicators):
            return 'Female'
        
        # If still uncertain, return None (will be stored as NULL)
        return None
    
    def remove_salutations(self, name: str) -> str:
        """Remove all salutations (Mr., Mrs., Miss, Ms., Dr., Rev., etc.) from name"""
        if not name:
            return name
        # Remove common salutations (using raw strings)
        salutations = [r'Mr\.', r'Mrs\.', 'Miss', r'Ms\.', r'Dr\.', r'Rev\.', r'Prof\.', r'Hon\.', 'Chief', 'Alhaji', 'Alhaja']
        for salutation in salutations:
            # Escape properly for regex
            salutation_pattern = salutation.replace('.', r'\.') if '.' in salutation else salutation
            name = re.sub(rf'^{salutation_pattern}\s+', '', name, flags=re.IGNORECASE)
        return name.strip()
    
    def extract_names_with_aliases(self, text: str) -> Dict[str, any]:
        """Extract current name, old name, and all aliases from change of name notice
        
        Format: "21278. Old Name, a.k.a. Alias1, a.k.a. Alias2, [profession]... wishes to be known and called New Name"
        - OLD NAME: Name at the start (after item number) - NO SALUTATIONS
        - NEW NAME: Name after "wishes to be known and called" - NO SALUTATIONS
        - ALIASES: Names marked with "a.k.a." - NO SALUTATIONS, each as separate entry
        """
        result = {
            'current_name': '',
            'old_name': '',
            'aliases': [],
            'other_names': [],
            'profession': None,
            'address': None,
            'effective_date': None,
            'remarks': None
        }
        
        # Normalize whitespace - replace newlines with spaces for easier regex matching
        normalized_text = re.sub(r'\s+', ' ', text).strip()
        
        # Extract NEW NAME: "wishes to be known and called [New Name]"
        # Handle multiline: the name might be on the next line or same line
        new_name_pattern = r'wishes\s+to\s+be\s+known\s+and\s+called\s+(?:Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Rev\.|Prof\.)?\s*([A-Z][^,\n\.]{5,100}?)(?:\s+with\s+effect|\.|All\s+documents|$)'
        new_name_match = re.search(new_name_pattern, normalized_text, re.IGNORECASE | re.DOTALL)
        if new_name_match:
            new_name = new_name_match.group(1).strip()
            # Remove ALL salutations
            new_name = self.remove_salutations(new_name)
            # Clean up trailing punctuation
            new_name = re.sub(r'[,\s\.]+$', '', new_name)
            if new_name and len(new_name.split()) >= 2:
                result['current_name'] = new_name
        
        # Extract OLD NAME: Name at the start (after item number and period, before first comma or "a.k.a.")
        # Format: "21278. Mr. Old Name, a.k.a. ..." or "21278. Old Name, a.k.a. ..."
        # Get text before "wishes to be known" - this contains the old name and aliases
        before_wishes_match = re.search(r'^\d+\.\s*(.*?)\s+wishes\s+to\s+be\s+known', normalized_text, re.IGNORECASE | re.DOTALL)
        if before_wishes_match:
            before_wishes = before_wishes_match.group(1).strip()
        else:
            # Fallback: take everything before "wishes"
            before_wishes = normalized_text.split('wishes')[0] if 'wishes' in normalized_text.lower() else normalized_text
            # Remove item number prefix if still present
            before_wishes = re.sub(r'^\d+\.\s*', '', before_wishes, flags=re.IGNORECASE).strip()
        
        # Extract the first name (old name) - everything before first comma (but not if followed by "a.k.a.")
        # Pattern: Start of string, optional title, then name (up to first comma that's not part of "a.k.a.")
        old_name_pattern = r'^(?:Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Rev\.|Prof\.)?\s*([A-Z][A-Za-z\s]{5,100}?)(?:\s*,\s*(?:a\.k\.a\.|[A-Z])|$)'
        old_name_match = re.match(old_name_pattern, before_wishes, re.IGNORECASE)
        if old_name_match:
            old_name = old_name_match.group(1).strip()
            # Remove ALL salutations
            old_name = self.remove_salutations(old_name)
            # Clean up trailing punctuation and spaces
            old_name = re.sub(r'[,\s\.]+$', '', old_name)
            # Validate it's a proper name (at least 2 words)
            if old_name and len(old_name.split()) >= 2:
                result['old_name'] = old_name
        else:
            # Fallback: try to get everything before the first comma
            first_comma_idx = before_wishes.find(',')
            if first_comma_idx > 0:
                potential_old = before_wishes[:first_comma_idx].strip()
                # Remove ALL salutations
                potential_old = self.remove_salutations(potential_old)
                # Check it's not an "a.k.a." pattern
                if 'a.k.a.' not in potential_old.lower() and len(potential_old.split()) >= 2:
                    result['old_name'] = potential_old
        
        # Extract aliases using "a.k.a." or "alias" pattern (all occurrences before "wishes to be known")
        # Pattern to match: "a.k.a. [Name]" or "alias [Name]" where Name can be followed by comma, another "a.k.a.", or end
        alias_patterns = [
            r'a\.k\.a\.\s+(?:Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Rev\.|Prof\.)?\s*([A-Z][A-Za-z\s]{5,100}?)(?=\s*,\s*(?:a\.k\.a\.|[A-Z])|,\s+wishes|$)',
            r'alias\s+(?:Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Rev\.|Prof\.)?\s*([A-Z][A-Za-z\s]{5,100}?)(?=\s*,\s*(?:alias|a\.k\.a\.|[A-Z])|,\s+wishes|$)',
        ]
        
        for alias_pattern in alias_patterns:
            alias_matches = re.findall(alias_pattern, before_wishes, re.IGNORECASE | re.DOTALL)
            for alias in alias_matches:
                alias_clean = alias.strip()
                # Remove ALL salutations
                alias_clean = self.remove_salutations(alias_clean)
                # Clean up trailing punctuation
                alias_clean = re.sub(r'[,\s\.]+$', '', alias_clean)
                # Only add if it's different from old and new names, and valid (at least 2 words)
                if alias_clean and len(alias_clean.split()) >= 2 and alias_clean.upper() != 'N/A':
                    # Don't add if it's the same as old name or new name
                    if (result['old_name'] and alias_clean.lower() != result['old_name'].lower()) and \
                       (result['current_name'] and alias_clean.lower() != result['current_name'].lower()):
                        result['aliases'].append(alias_clean)
        
        # Remove duplicates from aliases (preserves order)
        result['aliases'] = list(dict.fromkeys(result['aliases']))
        
        # If no aliases found, set to empty list (not None) for consistency
        if not result['aliases']:
            result['aliases'] = []
        
        # If no current name found, try fallback (should not happen with proper format)
        if not result['current_name']:
            # Try extracting name after "to be known as" or "changed to"
            fallback_match = re.search(r'(?:to be known as|changed to|now known as)\s+(?:Mr\.|Mrs\.|Miss|Ms\.|Dr\.)?\s*([A-Z][^,\n\.]{5,100}?)', normalized_text, re.IGNORECASE | re.DOTALL)
            if fallback_match:
                result['current_name'] = fallback_match.group(1).strip()
        
        # Extract old name
        old_name_patterns = [
            r'formerly\s+known\s+as\s+([^,\n]+)',
            r'formerly\s+called\s+([^,\n]+)',
            r'was\s+known\s+as\s+([^,\n]+)',
            r'changed\s+from\s+([^,\n]+)',
            r'old\s+name[:\-]?\s*([^,\n]+)',
        ]
        
        for pattern in old_name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                old_name = match.group(1).strip()
                old_name = re.sub(r'\s*(\(formerly\)|\(known as\)|,.*?$)', '', old_name, flags=re.IGNORECASE)
                if old_name and old_name.upper() != 'N/A':
                    result['old_name'] = old_name.strip()
                    break
        
        # Extract aliases
        alias_patterns = [
            r'alias\s+([^,\n]+)',
            r'aka\s+([^,\n]+)',
            r'also\s+known\s+as\s+([^,\n]+)',
            r'\(alias\s*[:\-]?\s*([^)]+)\)',
            r'\(aka\s*[:\-]?\s*([^)]+)\)',
        ]
        
        for pattern in alias_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                alias_str = match if isinstance(match, str) else match[0] if isinstance(match, tuple) else str(match)
                aliases = [a.strip() for a in alias_str.split(',') if a.strip() and a.strip().upper() != 'N/A']
                result['aliases'].extend(aliases)
        
        # Remove duplicates
        result['aliases'] = list(set([a for a in result['aliases'] if a and a.upper() != 'N/A']))
        
        # Extract PROFESSION: Full occupation with place of work or registration number
        # Look for patterns like "a Student of Yilo Krobo Senior High School, Somanya" or "an Anaesthetist with Reg. No. MDC/PA/PN/24219 of St. Francis Xavier Catholic Hospital"
        # The profession stops at " and of" or ", and of" (which starts the address section)
        
        # Split at " and of" or ", and of" first if it exists
        split_pattern = r',\s+and\s+of|\s+and\s+of'
        if re.search(split_pattern, before_wishes, re.IGNORECASE):
            parts = re.split(split_pattern, before_wishes, 1, flags=re.IGNORECASE)
            profession_part = parts[0]
            
            # Pattern 1: "a/an [Profession] with Reg. No. [Number] of [Place]"
            reg_no_pattern = r'(?:a|an)\s+([A-Z][A-Za-z\s]+?)\s+with\s+Reg\.?\s+No\.?\s+([^,]+?)\s+of\s+(.+)$'
            reg_match = re.search(reg_no_pattern, profession_part, re.IGNORECASE | re.DOTALL)
            if reg_match:
                profession = f"{reg_match.group(1).strip()} with Reg. No. {reg_match.group(2).strip()} of {reg_match.group(3).strip()}"
                profession = re.sub(r'[,\s\.]+$', '', profession)
                if profession and profession.upper() != 'N/A':
                    result['profession'] = profession
            
            # Pattern 2: "a/an [Profession] of [Place]"
            if not result.get('profession'):
                profession_pattern = r'(?:a|an)\s+([A-Z][A-Za-z\s]+?)\s+of\s+(.+)$'
                prof_match = re.search(profession_pattern, profession_part, re.IGNORECASE | re.DOTALL)
                if prof_match:
                    profession = f"{prof_match.group(1).strip()} of {prof_match.group(2).strip()}"
                    profession = re.sub(r'[,\s\.]+$', '', profession)
                    if profession and profession.upper() != 'N/A' and len(profession) > 5:
                        result['profession'] = profession
        else:
            # No "and of" found, try patterns without splitting
            reg_no_pattern = r'(?:a|an)\s+([A-Z][A-Za-z\s]+?)\s+with\s+Reg\.?\s+No\.?\s+([^,]+?)\s+of\s+((?:(?!,\s+and\s+of).)+?)(?=,\s+and\s+of|,\s+wishes|$)'
            reg_match = re.search(reg_no_pattern, before_wishes, re.IGNORECASE | re.DOTALL)
            if reg_match:
                profession = f"{reg_match.group(1).strip()} with Reg. No. {reg_match.group(2).strip()} of {reg_match.group(3).strip()}"
                profession = re.sub(r'[,\s\.]+$', '', profession)
                if profession and profession.upper() != 'N/A':
                    result['profession'] = profession
            
            if not result.get('profession'):
                profession_pattern = r'(?:a|an)\s+([A-Z][A-Za-z\s]+?)\s+of\s+((?:(?!,\s+and\s+of).)+?)(?=,\s+and\s+of|,\s+wishes|$)'
                prof_match = re.search(profession_pattern, before_wishes, re.IGNORECASE | re.DOTALL)
                if prof_match:
                    profession = f"{prof_match.group(1).strip()} of {prof_match.group(2).strip()}"
                    profession = re.sub(r'[,\s\.]+$', '', profession)
                    if profession and profession.upper() != 'N/A' and len(profession) > 5:
                        result['profession'] = profession
        
        if not result.get('profession'):
            # Pattern 3: "a/an [Profession]" (just profession, no place) - before "and of" or "wishes"
            simple_prof_pattern = r'(?:a|an)\s+([A-Z][A-Za-z\s]{5,80}?)(?=,\s+(?:and\s+of|wishes)|$)'
            simple_match = re.search(simple_prof_pattern, before_wishes, re.IGNORECASE)
            if simple_match:
                profession = simple_match.group(1).strip()
                profession = re.sub(r'[,\s\.]+$', '', profession)
                if profession and profession.upper() != 'N/A' and len(profession) > 3:
                    result['profession'] = profession
        
        # Extract ADDRESS: Physical address or P.O. Box
        # Look for "and of P.O. Box" or "and of H/No." patterns
        # The address typically comes after profession and before "wishes"
        # Capture everything after "and of" until "wishes"
        and_of_match = re.search(r'and\s+of\s+(.+?)(?=,\s+wishes|$)', before_wishes, re.IGNORECASE | re.DOTALL)
        if and_of_match:
            address = and_of_match.group(1).strip()
            # Clean up trailing punctuation
            address = re.sub(r'[,\s\.]+$', '', address)
            if address and address.upper() != 'N/A' and len(address) > 5:
                result['address'] = address.strip()
        
        # Extract REMARKS: "All documents bearing his/her former names are still valid"
        remarks_pattern = r'(All\s+documents\s+bearing\s+(?:his|her|their)\s+(?:former\s+)?names?\s+are\s+still\s+valid[^\.]*)'
        remarks_match = re.search(remarks_pattern, normalized_text, re.IGNORECASE)
        if remarks_match:
            result['remarks'] = remarks_match.group(1).strip()
        else:
            result['remarks'] = 'N/A'
        
        # Extract EFFECTIVE DATE: "with effect from [date]" format
        # Standardize to "Day Month Year" format
        # Handle formats like "with effect from 16th November, 2023" or "with effect from 29th April, 2025"
        date_patterns = [
            r'with\s+effect\s+from\s+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})',
            r'with\s+effect\s+from\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            r'effective\s+date[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            r'date\s+of\s+change[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
        ]
        for pattern in date_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 3:  # Format: day, month_name, year
                    day, month_name, year = match.groups()
                    month_map = {
                        'january': 1, 'february': 2, 'march': 3, 'april': 4,
                        'may': 5, 'june': 6, 'july': 7, 'august': 8,
                        'september': 9, 'october': 10, 'november': 11, 'december': 12
                    }
                    month_num = month_map.get(month_name.lower())
                    if month_num:
                        try:
                            from datetime import date
                            result['effective_date'] = date(int(year), month_num, int(day))
                            break
                        except:
                            pass
                else:  # Format: dd/mm/yyyy or dd-mm-yyyy - convert to date object
                    parsed_date = self._parse_date(match.group(1))
                    if parsed_date:
                        result['effective_date'] = parsed_date
                        break
        
        return result
    
    def generate_name_set_id(self, gazette_number: str, item_number: str, document_filename: str, sequence: int = 0) -> str:
        """Generate name_set_id: "2025-{filename}-{item_number}-{sequence}" """
        # Clean filename
        filename_clean = document_filename.replace('.pdf', '').replace(' ', '_')[:50]
        return f"2025-{filename_clean}-{item_number}-{sequence}"
    
    def generate_reference_number(self, source: str, item_number: str, document_filename: str, page_number: int, new_name: str) -> str:
        """Generate reference number hash for linking"""
        hash_input = f"{source}:{item_number}:{document_filename}:{page_number}:{new_name}"
        return hashlib.md5(hash_input.encode()).hexdigest()
    
    def find_or_create_person(self, full_name: str, gender: Optional[str] = None) -> Optional[People]:
        """Find existing person or create new one"""
        try:
            # Try exact match first
            person = self.db.query(People).filter(
                People.full_name.ilike(full_name)
            ).first()
            
            if not person:
                # Try searching by first and last name separately
                name_parts = full_name.split()
                if len(name_parts) >= 2:
                    first_name = name_parts[0]
                    last_name = ' '.join(name_parts[1:])
                    
                    person = self.db.query(People).filter(
                        People.first_name.ilike(first_name),
                        People.last_name.ilike(last_name)
                    ).first()
            
            if not person:
                # Create new person
                logger.info(f"Creating new person: {full_name}")
                name_parts = full_name.split()
                first_name = name_parts[0] if name_parts else full_name
                last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                
                person = People(
                    full_name=full_name,
                    first_name=first_name,
                    last_name=last_name,
                    gender=gender,
                    created_by=None
                )
                
                self.db.add(person)
                self.db.commit()
                self.db.refresh(person)
            else:
                # Update gender if provided and not set
                if gender and not person.gender:
                    person.gender = gender
                    self.db.commit()
                    self.db.refresh(person)
            
            return person
        except Exception as e:
            logger.error(f"Error finding/creating person {full_name}: {e}")
            self.db.rollback()
            # Try to find existing person again after rollback
            try:
                person = self.db.query(People).filter(
                    People.full_name.ilike(full_name)
                ).first()
                if person:
                    return person
            except:
                pass
            return None
    
    def check_duplicate_name_set(self, name_set_id: str) -> bool:
        """Check if this name_set_id already exists"""
        if name_set_id in self.processed_name_sets:
            return True
        
        existing = self.db.query(Gazette).filter(
            Gazette.name_set_id == name_set_id
        ).first()
        
        if existing:
            self.processed_name_sets.add(name_set_id)
            return True
        
        return False
    
    def check_duplicate_fallback(self, source: str, item_number: str, document_filename: str, 
                                   page_number: int, current_name: str, name_role: str, name_value: str) -> bool:
        """Fallback duplicate check if name_set_id is not available"""
        existing = self.db.query(Gazette).filter(
            Gazette.source == source,
            Gazette.item_number == item_number,
            Gazette.document_filename == document_filename,
            Gazette.gazette_page == page_number,
            Gazette.current_name == current_name,
            Gazette.name_role == name_role,
            Gazette.name_value == name_value
        ).first()
        
        return existing is not None
    
    def save_gazette_entry(self, entry_data: Dict, name_set_id: Optional[str] = None) -> Optional[Gazette]:
        """Save a single gazette entry (master or variant)"""
        try:
            # Check for duplicate using name_set_id if available
            name_set_id_check = entry_data.get('name_set_id')
            if name_set_id_check:
                if self.check_duplicate_name_set(name_set_id_check):
                    logger.info(f"Skipping duplicate name_set_id: {name_set_id_check}")
                    return None
            else:
                # Fallback duplicate check
                if self.check_duplicate_fallback(
                    entry_data.get('source') or '',
                    entry_data.get('item_number') or '',
                    entry_data.get('document_filename') or '',
                    entry_data.get('gazette_page') or entry_data.get('page_number') or 0,
                    entry_data.get('current_name') or entry_data.get('new_name') or '',
                    entry_data.get('name_role') or '',
                    entry_data.get('name_value') or ''
                ):
                    logger.info(f"Skipping duplicate entry: {entry_data.get('item_number')}")
                    return None
            
            # Mark as processed
            name_set_id_check = entry_data.get('name_set_id')
            if name_set_id_check:
                self.processed_name_sets.add(name_set_id_check)
            
            # Ensure alias_names is properly formatted (list to JSONB)
            if 'alias_names' in entry_data and entry_data['alias_names']:
                if isinstance(entry_data['alias_names'], list):
                    # Keep as list - SQLAlchemy will handle JSONB conversion
                    pass
                elif isinstance(entry_data['alias_names'], str):
                    # Convert string to list
                    try:
                        entry_data['alias_names'] = json.loads(entry_data['alias_names'])
                    except:
                        entry_data['alias_names'] = [entry_data['alias_names']]
            else:
                entry_data['alias_names'] = None
            
            # Ensure gazette_metadata is properly formatted (metadata is reserved in SQLAlchemy)
            if 'gazette_metadata' in entry_data and entry_data['gazette_metadata']:
                if isinstance(entry_data['gazette_metadata'], str):
                    try:
                        entry_data['gazette_metadata'] = json.loads(entry_data['gazette_metadata'])
                    except:
                        entry_data['gazette_metadata'] = {}
            else:
                entry_data['gazette_metadata'] = None
            
            # Create gazette entry
            gazette = Gazette(**entry_data)
            self.db.add(gazette)
            self.db.commit()
            self.db.refresh(gazette)
            
            logger.info(f"Saved gazette entry: {gazette.title} (Item {entry_data.get('item_number')}, Role: {entry_data.get('name_role')})")
            return gazette
            
        except Exception as e:
            logger.error(f"Error saving gazette entry: {e}", exc_info=True)
            self.db.rollback()
            return None
    
    def process_change_of_name_entry(self, entry_text: str, item_number: str, page_num: int,
                                     gazette_metadata: Dict, document_filename: str, sequence: int = 0) -> List[Gazette]:
        """Process a single change of name entry and create master + variant rows"""
        saved_entries = []
        
        # Extract name data
        name_data = self.extract_names_with_aliases(entry_text)
        
        if not name_data.get('current_name'):
            logger.warning(f"No current name found for Item {item_number}")
            return saved_entries
        
        current_name = name_data['current_name']
        old_name = name_data.get('old_name') or None
        aliases = name_data.get('aliases', [])
        other_names = name_data.get('other_names', [])
        profession = name_data.get('profession') or 'N/A' if not name_data.get('profession') else name_data.get('profession')
        address = name_data.get('address') or 'N/A' if not name_data.get('address') else name_data.get('address')
        effective_date = name_data.get('effective_date')
        remarks = name_data.get('remarks') or 'N/A'
        gender = self.identify_gender(entry_text, current_name)
        
        # Find or create person
        person = self.find_or_create_person(current_name, gender=gender)
        person_id = person.id if person else None
        
        # Generate name_set_id
        gazette_number = gazette_metadata.get('gazette_number') or 'unknown'
        name_set_id = self.generate_name_set_id(gazette_number, item_number, document_filename, sequence)
        
        # Generate reference number
        source = gazette_metadata.get('source') or f"Gazette {gazette_number}"
        reference_number = self.generate_reference_number(
            source, item_number, document_filename, page_num, current_name
        )
        
        # Common entry data
        common_data = {
                'gazette_type': GazetteType.CHANGE_OF_NAME,
                'status': GazetteStatus.PUBLISHED,
                'priority': GazettePriority.MEDIUM,
                'publication_date': gazette_metadata.get('gazette_date') or datetime.now(),
                'gazette_date': gazette_metadata.get('gazette_date'),
                'gazette_number': gazette_number,
                'gazette_page': page_num,
                'page_number': page_num,
                'item_number': item_number,
                'source_item_number': item_number,
                'source': source,
                'reference_number': reference_number,
                'document_filename': document_filename,
                'jurisdiction': "Ghana",
                'person_id': person_id,
                'effective_date': effective_date,
                'effective_date_of_change': effective_date,
                'profession': profession if profession and profession.upper() != 'N/A' else None,
                'address': address if address and address.upper() != 'N/A' else None,  # Store address if available
                'remarks': remarks if remarks and remarks.upper() != 'N/A' else None,
                'content': entry_text[:1000],
                'description': entry_text[:500],
                'is_public': True,
                'created_by': None,
                'name_set_id': name_set_id,
                'gender': gender,
                'current_name': current_name,  # Same in all rows for reporting
                'new_name': current_name,  # Legacy compatibility
            }
            
        # 1. MASTER ROW
        master_entry = {
            **common_data,
            'title': f"Change of Name: {current_name}",
            'summary': f"{current_name} - Change of Name Notice" if current_name else "Change of Name Notice",
            'old_name': old_name if old_name and old_name.upper() != 'N/A' else None,
            'alias_names': aliases if aliases else None,  # Store all aliases in master as JSONB
            'name_role': 'master',
            'name_value': current_name,
        }
        
        master_gazette = self.save_gazette_entry(master_entry, name_set_id)
        if master_gazette:
            saved_entries.append(master_gazette)
        
        # 2. VARIANT ROWS
        
        # Old name variant
        if old_name and old_name.upper() != 'N/A' and old_name != current_name:
            old_entry = {
                **common_data,
                'title': f"Change of Name: {current_name} (Old Name: {old_name})",
                'summary': f"Old name variant: {old_name}",
                'old_name': old_name,
                'name_role': 'old',
                'name_value': old_name,
            }
            old_gazette = self.save_gazette_entry(old_entry, name_set_id)
            if old_gazette:
                saved_entries.append(old_gazette)
        
        # Alias variants (one row per alias)
        for alias in aliases:
            if alias and alias.upper() != 'N/A' and alias != current_name and alias != old_name:
                alias_entry = {
                    **common_data,
                    'title': f"Change of Name: {current_name} (Alias: {alias})",
                    'summary': f"Alias variant: {alias}",
                    'alias_names': [alias],  # Single alias in this row
                    'name_role': 'alias',
                    'name_value': alias,
                }
                alias_gazette = self.save_gazette_entry(alias_entry, name_set_id)
                if alias_gazette:
                    saved_entries.append(alias_gazette)
        
        # Other names variants
        for other_name in other_names:
            if other_name and other_name.upper() != 'N/A' and other_name not in [current_name, old_name] and other_name not in aliases:
                other_entry = {
                    **common_data,
                    'title': f"Change of Name: {current_name} (Other Name: {other_name})",
                    'summary': f"Other name variant: {other_name}",
                    'other_names': other_name,
                    'name_role': 'other',
                    'name_value': other_name,
                }
                other_gazette = self.save_gazette_entry(other_entry, name_set_id)
                if other_gazette:
                    saved_entries.append(other_gazette)
        
        return saved_entries
    
    def process_change_of_name_section(self, text: str, page_num: int, gazette_metadata: Dict,
                                       document_filename: str) -> List[Gazette]:
        """Process a change of name section and create all master + variant rows"""
        saved_entries = []
        
        # Extract entries by Item Number
        # Strategy: Split text by item numbers, then extract each entry
        # This handles multiline entries better than regex lookahead
        
        all_entries = []
        seen_items = set()
        
        # Split text by item number pattern at start of line
        # Handle 1-5 digit item numbers (e.g., "15.", "15000.")
        # This creates segments where each segment starts with an item number
        parts = re.split(r'(?=^\d{1,5}\.\s+)', text, flags=re.MULTILINE)
        
        for part in parts:
            # Match item number at start (1-5 digits)
            match = re.match(r'^(\d{1,5})\.\s+(.+)$', part, re.MULTILINE | re.DOTALL)
            if not match:
                continue
            
            item_no_str = match.group(1)
            entry_text = match.group(2).strip()
            
            if not item_no_str.isdigit():
                continue
                
            item_no = int(item_no_str)
            
            # Exclude years (1900-2099) to avoid matching dates
            # Exclude page numbers in range 2800-3000
            if (1900 <= item_no <= 2099) or (2800 <= item_no <= 3000):
                continue
            
            # For 1-3 digit numbers, accept 1-999 (typical for older gazettes)
            # But exclude single digits that might be list numbers in tables of contents
            if len(item_no_str) <= 3:
                if item_no < 1 or item_no > 999:
                    continue
            
            # For 4-digit numbers, only accept ranges that are reasonable for item numbers
            # Typical item numbers in older gazettes are 1-9999, but we'll be more restrictive
            # to avoid matching dates: accept 1-1999 and 2100-2799
            if len(item_no_str) == 4:
                if not ((1 <= item_no <= 1999) or (2100 <= item_no <= 2799)):
                    continue
            
            # For 5-digit numbers, accept typical gazette ranges (10000-30000)
            # but exclude years and page numbers
            if len(item_no_str) == 5:
                if not (10000 <= item_no <= 30000):
                    continue
            
            # Skip if already seen
            if item_no_str in seen_items:
                continue
            
            # Validate entry has reasonable length (at least 50 chars, at most 3000)
            if len(entry_text) < 50 or len(entry_text) > 3000:
                continue
            
            # Check if it's a change of name entry (contains key phrases)
            # Must have "wishes to be known" or "wishes to be called" to be valid
            # This filters out entries like "1. GS 831-1: 2008..." which are not Change of Name entries
            if not re.search(r'wishes to be known|wishes to be called', entry_text, re.IGNORECASE):
                continue
            
            seen_items.add(item_no_str)
            all_entries.append((item_no_str, entry_text))
        
        logger.info(f"Found {len(all_entries)} potential entries on page {page_num}")
        
        # Process each entry
        for sequence, (item_no_str, entry_text) in enumerate(all_entries):
            try:
                entries = self.process_change_of_name_entry(
                    entry_text, item_no_str, page_num, gazette_metadata, document_filename, sequence
                )
                saved_entries.extend(entries)
            except Exception as e:
                logger.error(f"Error processing entry {item_no_str} on page {page_num}: {e}")
                continue
        
        return saved_entries
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats"""
        if not date_str or date_str.upper() == 'N/A':
            return None
            
        formats = [
            '%d/%m/%Y',
            '%d-%m-%Y',
            '%m/%d/%Y',
            '%Y-%m-%d',
            '%d %B %Y',
            '%B %d, %Y',
            '%d-%B-%Y',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        
        return None
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'db'):
            self.db.close()

