#!/usr/bin/env python3
"""
Enhanced Gazette Extractor Service
Implements comprehensive extraction according to requirements:
- Extract Item No. from actual text
- Create separate datasets for each name (New, Old, each Alias)
- Identify gender
- Extract page numbers
- Check for duplicates
- Link names across gazettes
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Tuple, Set
from datetime import datetime
import sys
from collections import defaultdict

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import pdfplumber
    import PyPDF2
    from pdf2image import convert_from_path
    import pytesseract
    from PIL import Image
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PDF processing libraries not installed.")

from database import get_db
from models.gazette import Gazette, GazetteType, GazetteStatus, GazettePriority
from models.people import People

try:
    from services.auto_analytics_generator import AutoAnalyticsGenerator
    ANALYTICS_AVAILABLE = True
except ImportError:
    ANALYTICS_AVAILABLE = False
    AutoAnalyticsGenerator = None

logger = logging.getLogger(__name__)


class EnhancedGazetteExtractor:
    """Enhanced service for extracting gazette information with comprehensive requirements"""
    
    def __init__(self):
        self.db = next(get_db())
        self.processed_item_numbers: Set[Tuple[str, str, str]] = set()  # (gazette_number, item_no, type)
        
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
            # Try pdfplumber first (better for structured text and page extraction)
            with pdfplumber.open(file_path) as pdf:
                result['total_pages'] = len(pdf.pages)
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text() or ""
                    result['pages'][page_num] = page_text
                    result['text'] += page_text + "\n"
                
                if len(result['text'].strip()) > 100:
                    return result
                    
            # Fallback to PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                result['total_pages'] = len(pdf_reader.pages)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text() or ""
                    result['pages'][page_num] = page_text
                    result['text'] += page_text + "\n"
                    
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            
        return result
    
    def extract_gazette_metadata(self, filename: str) -> Dict[str, Optional[str]]:
        """Extract gazette number, date, and other metadata from filename"""
        metadata = {
            'gazette_number': None,
            'gazette_date': None,
            'gazette_type_flag': None  # Premium, Premium Plus, etc.
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
        
        # Pattern 2: "GAZETTE NO. 101 (Premium Plus) 15-05-2025.pdf"
        pattern2 = r'GAZETTE\s+NO\.?\s*(\d+)\s*\(([^)]+)\)\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})'
        match = re.search(pattern2, filename, re.IGNORECASE)
        if match:
            metadata['gazette_number'] = match.group(1)
            metadata['gazette_type_flag'] = match.group(2)
            day, month, year = match.group(3), match.group(4), match.group(5)
            try:
                metadata['gazette_date'] = datetime.strptime(f"{day}/{month}/{year}", "%d/%m/%Y")
            except:
                pass
        
        # Pattern 3: "2025 Gazette_14th February.pdf"
        pattern3 = r'(\d{4})\s+Gazette[_\s]+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)'
        match = re.search(pattern3, filename, re.IGNORECASE)
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
        
        return metadata
    
    def extract_item_number(self, text: str) -> Optional[str]:
        """Extract Item Number from text (e.g., 24024)"""
        # Pattern: Item No. followed by numbers, or just numbers at start of line
        patterns = [
            r'Item\s*No\.?\s*[:\-]?\s*(\d{4,6})',  # Item No.: 24024
            r'Item\s*[:\-]?\s*(\d{4,6})',  # Item 24024
            r'^(\d{4,6})\s+[A-Z]',  # 24024 Name (at start of line)
            r'\n(\d{4,6})\s+[A-Z]',  # Newline followed by 24024 Name
            r'\b(\d{4,6})\b(?=\s+[A-Z][a-z]+)',  # 24024 followed by name
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            if matches:
                # Return the first valid match (4-6 digits)
                item_no = matches[0]
                if 4 <= len(item_no) <= 6 and item_no.isdigit():
                    return item_no
        
        return None
    
    def extract_page_number(self, text: str, page_num: int, all_pages: Dict) -> Optional[int]:
        """Determine page number where this entry appears"""
        # If we have page context, return it
        return page_num if page_num else None
    
    def identify_gender(self, text: str, name: str) -> Optional[str]:
        """Identify gender from text context"""
        text_lower = text.lower()
        
        # Male indicators
        male_indicators = ['mr.', 'mr ', 'male', 'son of', 'son', 'brother']
        # Female indicators
        female_indicators = ['mrs.', 'mrs ', 'miss', 'ms.', 'ms ', 'female', 'daughter of', 'daughter', 'sister']
        
        # Check for explicit gender indicators
        if any(indicator in text_lower for indicator in male_indicators):
            return 'Male'
        elif any(indicator in text_lower for indicator in female_indicators):
            return 'Female'
        
        # Check name patterns (common Ghanaian names)
        # This is a basic implementation - can be enhanced with name databases
        return None
    
    def extract_names_with_aliases(self, text: str) -> Dict[str, any]:
        """Extract new name, old name, and all aliases from change of name notice"""
        result = {
            'new_name': '',
            'old_name': '',
            'aliases': [],
            'profession': '',
            'effective_date': None,
            'denomination': None,
            'church': None
        }
        
        # Pattern 1: "formerly known as [old name]"
        former_patterns = [
            r'formerly\s+known\s+as\s+([^,\n]+)',
            r'formerly\s+called\s+([^,\n]+)',
            r'was\s+known\s+as\s+([^,\n]+)',
            r'changed\s+from\s+([^,\n]+)',
        ]
        
        for pattern in former_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                old_name = match.group(1).strip()
                # Remove common suffixes
                old_name = re.sub(r'\s*(\(formerly\)|\(known as\)|,.*?$)', '', old_name, flags=re.IGNORECASE)
                result['old_name'] = old_name.strip()
                break
        
        # Pattern 2: Extract new name (usually appears first or after "to")
        new_name_patterns = [
            r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+(?:formerly|was|to)',
            r'changed\s+(?:to|name\s+to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+\(formerly',
            r'(?:to|as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        ]
        
        for pattern in new_name_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                new_name = match.group(1).strip()
                if new_name and len(new_name.split()) >= 2:  # At least first and last name
                    result['new_name'] = new_name
                    break
        
        # If new name not found, try extracting first capitalized name sequence
        if not result['new_name']:
            name_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})', text)
            if name_match:
                result['new_name'] = name_match.group(1).strip()
        
        # Extract aliases (comma-separated or in parentheses)
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
                if isinstance(match, tuple):
                    alias_str = match[0]
                else:
                    alias_str = match
                
                # Split comma-separated aliases
                aliases = [a.strip() for a in alias_str.split(',') if a.strip() and a.strip().upper() != 'N/A']
                result['aliases'].extend(aliases)
        
        # Remove duplicates and filter out N/A
        result['aliases'] = list(set([a for a in result['aliases'] if a and a.upper() != 'N/A']))
        
        # Extract profession
        profession_patterns = [
            r'profession[:\-]?\s*([^,\n]+)',
            r'occupation[:\-]?\s*([^,\n]+)',
            r'(\w+)\s+by\s+profession',
        ]
        for pattern in profession_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                profession = match.group(1).strip()
                if profession.upper() != 'N/A':
                    result['profession'] = profession
                break
        
        # Extract effective date
        date_patterns = [
            r'effective\s+date[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            r'date\s+of\s+change[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            r'with\s+effect\s+from\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
        ]
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result['effective_date'] = self._parse_date(match.group(1))
                break
        
        return result
    
    def check_duplicate(self, gazette_number: str, item_number: str, gazette_type) -> bool:
        """Check if this item number already exists for this gazette"""
        # Convert to enum value string for key
        if isinstance(gazette_type, GazetteType):
            gazette_type_str = gazette_type.value
            gazette_type_enum = gazette_type
        elif isinstance(gazette_type, str):
            # Try to convert string to enum
            try:
                if gazette_type.startswith('GazetteType.'):
                    # Handle "GazetteType.CHANGE_OF_NAME" format
                    gazette_type = gazette_type.replace('GazetteType.', '')
                gazette_type_enum = GazetteType[gazette_type]
                gazette_type_str = gazette_type_enum.value
            except (KeyError, ValueError):
                # If it's already a value string like "CHANGE_OF_NAME", use it directly
                gazette_type_str = gazette_type
                try:
                    gazette_type_enum = GazetteType[gazette_type]
                except:
                    return False  # Invalid type
        else:
            return False  # Invalid type
        
        key = (gazette_number or '', item_number or '', gazette_type_str)
        if key in self.processed_item_numbers:
            return True
        
        # Also check database
        existing = self.db.query(Gazette).filter(
            Gazette.gazette_number == gazette_number,
            Gazette.item_number == item_number,
            Gazette.gazette_type == gazette_type_enum
        ).first()
        
        return existing is not None
    
    def find_or_create_person(self, full_name: str, gender: Optional[str] = None, **kwargs) -> People:
        """Find existing person or create new one, handling name variations"""
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
            
            # Add additional fields from kwargs
            for key, value in kwargs.items():
                if hasattr(person, key) and value:
                    setattr(person, key, value)
            
            self.db.add(person)
            self.db.commit()
            self.db.refresh(person)
            
            # Generate analytics for new person
            if ANALYTICS_AVAILABLE and AutoAnalyticsGenerator:
                try:
                    generator = AutoAnalyticsGenerator(self.db)
                    generator.generate_analytics_for_person(person.id)
                    logger.info(f"Analytics generated for new person {person.id}")
                except Exception as analytics_error:
                    logger.warning(f"Failed to generate analytics for person {person.id}: {analytics_error}")
        else:
            # Update gender if provided and not set
            if gender and not person.gender:
                person.gender = gender
                self.db.commit()
                self.db.refresh(person)
            
            # Update previous names if this is an alias
            if 'previous_names' not in kwargs or kwargs.get('previous_names'):
                if not person.previous_names:
                    person.previous_names = []
                if full_name not in person.previous_names and full_name != person.full_name:
                    person.previous_names.append(full_name)
                    self.db.commit()
                    self.db.refresh(person)
        
        return person
    
    def create_name_datasets(self, name_data: Dict, gazette_metadata: Dict, item_number: str, 
                            page_number: int, text: str) -> List[Dict]:
        """Create separate datasets for each name (New, Old, each Alias)"""
        datasets = []
        gazette_type = GazetteType.CHANGE_OF_NAME
        
        # Extract gender
        gender = self.identify_gender(text, name_data.get('new_name', ''))
        
        # Dataset 1: New Name
        if name_data.get('new_name'):
            new_name = name_data['new_name'].strip()
            datasets.append({
                'name': new_name,
                'name_type': 'new_name',
                'gender': gender,
                'gazette_type': gazette_type,
                'item_number': item_number,
                'gazette_number': gazette_metadata.get('gazette_number'),
                'gazette_date': gazette_metadata.get('gazette_date'),
                'page_number': page_number,
                'profession': name_data.get('profession') or 'N/A',
                'effective_date': name_data.get('effective_date'),
                'text_content': text
            })
        
        # Dataset 2: Old Name
        if name_data.get('old_name') and name_data['old_name'] != name_data.get('new_name'):
            old_name = name_data['old_name'].strip()
            datasets.append({
                'name': old_name,
                'name_type': 'old_name',
                'gender': gender,  # Same gender
                'gazette_type': gazette_type,
                'item_number': item_number,
                'gazette_number': gazette_metadata.get('gazette_number'),
                'gazette_date': gazette_metadata.get('gazette_date'),
                'page_number': page_number,
                'profession': name_data.get('profession') or 'N/A',
                'effective_date': name_data.get('effective_date'),
                'text_content': text
            })
        
        # Dataset 3-N: Each Alias
        for alias in name_data.get('aliases', []):
            if alias and alias.upper() != 'N/A' and alias != name_data.get('new_name') and alias != name_data.get('old_name'):
                datasets.append({
                    'name': alias.strip(),
                    'name_type': 'alias',
                    'gender': gender,
                    'gazette_type': gazette_type,
                    'item_number': item_number,
                    'gazette_number': gazette_metadata.get('gazette_number'),
                'gazette_date': gazette_metadata.get('gazette_date'),
                    'page_number': page_number,
                    'profession': name_data.get('profession') or 'N/A',
                    'effective_date': name_data.get('effective_date'),
                    'text_content': text
                })
        
        return datasets
    
    def save_gazette_entry(self, dataset: Dict, person: People) -> Optional[Gazette]:
        """Save gazette entry to database"""
        try:
            # Check for duplicate
            gazette_type_for_check = dataset.get('gazette_type')
            if isinstance(gazette_type_for_check, str) and gazette_type_for_check.startswith('GazetteType.'):
                # Convert string representation to enum
                try:
                    gazette_type_for_check = GazetteType[gazette_type_for_check.replace('GazetteType.', '')]
                except:
                    pass
            
            if self.check_duplicate(
                dataset.get('gazette_number') or '',
                dataset.get('item_number') or '',
                gazette_type_for_check
            ):
                logger.info(f"Skipping duplicate: Item {dataset.get('item_number')} in Gazette {dataset.get('gazette_number')}")
                return None
            
            # Mark as processed
            gazette_type = dataset.get('gazette_type')
            if isinstance(gazette_type, GazetteType):
                gazette_type_str = gazette_type.value
            elif isinstance(gazette_type, str):
                if gazette_type.startswith('GazetteType.'):
                    gazette_type_str = gazette_type.replace('GazetteType.', '')
                else:
                    gazette_type_str = gazette_type
            else:
                gazette_type_str = str(gazette_type)
            
            self.processed_item_numbers.add((
                dataset.get('gazette_number') or '',
                dataset.get('item_number') or '',
                gazette_type_str
            ))
            
            # Convert gazette_type to enum if needed
            gazette_type = dataset.get('gazette_type')
            if isinstance(gazette_type, str):
                try:
                    gazette_type = GazetteType[gazette_type]
                except (KeyError, ValueError):
                    logger.warning(f"Invalid gazette_type: {gazette_type}")
                    return None
            elif not isinstance(gazette_type, GazetteType):
                logger.warning(f"Invalid gazette_type format: {type(gazette_type)}")
                return None
            
            # Create gazette entry
            entry_data = {
                'title': f"{gazette_type.value.replace('_', ' ').title()} - {dataset.get('name')}",
                'content': dataset.get('text_content', '')[:1000],
                'gazette_type': gazette_type,
                'status': GazetteStatus.PUBLISHED,
                'priority': GazettePriority.MEDIUM,
                'publication_date': dataset.get('gazette_date') or datetime.now(),
                'gazette_date': dataset.get('gazette_date'),
                'gazette_number': dataset.get('gazette_number'),
                'item_number': dataset.get('item_number'),
                'source_item_number': dataset.get('item_number'),
                'gazette_page': dataset.get('page_number'),
                'jurisdiction': "Ghana",
                'person_id': person.id,
                'is_public': True,
                'created_by': None
            }
            
            # Add type-specific fields
            if gazette_type == GazetteType.CHANGE_OF_NAME:
                if dataset.get('name_type') == 'new_name':
                    entry_data['new_name'] = dataset.get('name')
                elif dataset.get('name_type') == 'old_name':
                    entry_data['old_name'] = dataset.get('name')
                elif dataset.get('name_type') == 'alias':
                    # Store single alias in array
                    entry_data['alias_names'] = [dataset.get('name')]
                
                entry_data['profession'] = dataset.get('profession') if dataset.get('profession') and dataset.get('profession') != 'N/A' else None
                entry_data['effective_date_of_change'] = dataset.get('effective_date')
            
            gazette = Gazette(**entry_data)
            self.db.add(gazette)
            self.db.commit()
            self.db.refresh(gazette)
            
            logger.info(f"Saved gazette entry: {gazette.title} (Item {dataset.get('item_number')})")
            return gazette
            
        except Exception as e:
            logger.error(f"Error saving gazette entry: {e}")
            self.db.rollback()
            return None
    
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
    
    def process_change_of_name_section(self, text: str, page_num: int, gazette_metadata: Dict) -> List[Gazette]:
        """Process a change of name section and create all name datasets"""
        saved_entries = []
        
        # Multiple patterns to try for extracting entries
        # Pattern 1: Item No. followed by number and name
        pattern1 = r'Item\s+No\.?\s*[:\-]?\s*(\d{4,6})\s+([^\d]+?)(?=Item\s+No\.?\s*[:\-]?\s*\d{4,6}|$)'
        # Pattern 2: Item number in typical range (24000-25999) followed by name (capital letters or mixed case)
        pattern2 = r'\b(24\d{3}|25\d{3})\s+([A-Z][a-zA-Z\s]{10,200}?)(?=\b(?:24\d{3}|25\d{3})\s+|$)'
        # Pattern 3: Any 4-6 digit number (excluding years) followed by name pattern
        pattern3 = r'\b(?!20\d{2})(\d{4,6})\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,5})(?=\b\d{4,6}\s+|$)'
        # Pattern 4: Look for "formerly known as" or "changed from" patterns with preceding numbers
        pattern4 = r'(\d{4,6})\s+([A-Z][a-zA-Z\s]+?(?:formerly\s+known\s+as|changed\s+from|was\s+known\s+as)[A-Za-z\s]{50,500}?)(?=\d{4,6}\s+|$)'
        
        all_entries = []
        
        # Try each pattern
        for pattern in [pattern1, pattern2, pattern3, pattern4]:
            matches = re.finditer(pattern, text, re.MULTILINE | re.DOTALL | re.IGNORECASE)
            for match in matches:
                item_no_str = match.group(1)
                entry_text = match.group(2) if len(match.groups()) > 1 else match.group(0)
                
                # Filter out years and invalid item numbers
                if not item_no_str or not item_no_str.isdigit():
                    continue
                    
                item_no = int(item_no_str)
                # Skip if it looks like a year (2020-2099)
                if 2020 <= item_no <= 2099 and len(item_no_str) == 4:
                    # Check if there's "Item" context
                    text_before = text[max(0, match.start()-30):match.start()]
                    if 'Item' not in text_before and 'No' not in text_before:
                        continue
                
                # Skip if it's likely a page number (2800-3000 range)
                if 2800 <= item_no <= 3000:
                    continue
                
                # Valid item numbers are typically 24000+ or specific ranges
                # Accept if it's in a reasonable range or has context indicating it's an item number
                if (24000 <= item_no <= 26000) or 'Item' in text[max(0, match.start()-30):match.start()] or 'No' in text[max(0, match.start()-30):match.start()]:
                    all_entries.append((item_no_str, entry_text.strip()))
        
        # Remove duplicates based on item number
        seen_items = set()
        entries = []
        for item_no_str, entry_text in all_entries:
            if item_no_str not in seen_items:
                seen_items.add(item_no_str)
                entries.append((item_no_str, entry_text))
        
        logger.info(f"Found {len(entries)} potential entries on page {page_num}")
        
        # If no entries found with standard patterns, try a more aggressive approach
        # Look for any sequence of numbers followed by name-like text
        if len(entries) == 0:
            logger.info(f"No entries found with standard patterns, trying alternative approach...")
            # Try splitting by lines and looking for patterns
            lines = text.split('\n')
            for i, line in enumerate(lines):
                # Look for lines starting with numbers that might be item numbers
                num_match = re.match(r'^\s*(\d{4,6})\s+(.+)$', line.strip())
                if num_match:
                    item_no_str = num_match.group(1)
                    item_no = int(item_no_str) if item_no_str.isdigit() else 0
                    # Check if it's likely an item number (not a year or page number)
                    if 24000 <= item_no <= 26000:
                        # Get context from surrounding lines
                        context_lines = lines[max(0, i-2):min(len(lines), i+10)]
                        entry_text = ' '.join(context_lines)
                        entries.append((item_no_str, entry_text))
        
        for item_no_str, entry_text in entries:
            item_number = item_no_str.strip()
            
            # Check for duplicate
            if self.check_duplicate(
                gazette_metadata.get('gazette_number') or '',
                item_number,
                GazetteType.CHANGE_OF_NAME
            ):
                continue
            
            # Extract name data
            name_data = self.extract_names_with_aliases(entry_text)
            
            if not name_data.get('new_name'):
                logger.warning(f"No name found for Item {item_number}")
                continue
            
            # Create datasets for each name (New, Old, each Alias)
            datasets = self.create_name_datasets(
                name_data,
                gazette_metadata,
                item_number,
                page_num,
                entry_text
            )
            
            # Save each dataset as a separate entry
            for dataset in datasets:
                # Find or create person
                gender = dataset.get('gender')
                person = self.find_or_create_person(
                    dataset.get('name'),
                    gender=gender
                )
                
                # Save gazette entry
                gazette = self.save_gazette_entry(dataset, person)
                if gazette:
                    saved_entries.append(gazette)
        
        return saved_entries
    
    def process_change_of_dob_section(self, text: str, page_num: int, gazette_metadata: Dict) -> List[Gazette]:
        """Process a change of date of birth section"""
        saved_entries = []
        
        # Split into individual entries by Item Number
        entry_pattern = r'(\d{4,6})\s+([^\d]+?)(?=\d{4,6}\s+|$)'
        entries = re.findall(entry_pattern, text, re.MULTILINE | re.DOTALL)
        
        for item_no_str, entry_text in entries:
            item_number = item_no_str.strip()
            
            # Check for duplicate
            if self.check_duplicate(
                gazette_metadata.get('gazette_number') or '',
                item_number,
                GazetteType.CHANGE_OF_DATE_OF_BIRTH
            ):
                continue
            
            # Extract name
            name_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})', entry_text)
            if not name_match:
                continue
            
            name = name_match.group(1).strip()
            gender = self.identify_gender(entry_text, name)
            
            # Extract dates
            date_patterns = [
                r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
                r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
            ]
            
            dates = []
            for pattern in date_patterns:
                matches = re.findall(pattern, entry_text)
                dates.extend(matches)
            
            old_dob = None
            new_dob = None
            
            if len(dates) >= 2:
                old_dob = self._parse_date(dates[0])
                new_dob = self._parse_date(dates[1])
            elif len(dates) == 1:
                new_dob = self._parse_date(dates[0])
            
            # Extract effective date
            effective_date = None
            eff_patterns = [
                r'effective\s+date[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
                r'date\s+of\s+change[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            ]
            for pattern in eff_patterns:
                match = re.search(pattern, entry_text, re.IGNORECASE)
                if match:
                    effective_date = self._parse_date(match.group(1))
                    break
            
            # Find or create person
            person = self.find_or_create_person(name, gender=gender)
            
            # Create and save entry
            entry_data = {
                'title': f"Change of Date of Birth - {name}",
                'content': entry_text[:1000],
                'gazette_type': GazetteType.CHANGE_OF_DATE_OF_BIRTH,
                'status': GazetteStatus.PUBLISHED,
                'priority': GazettePriority.MEDIUM,
                'publication_date': gazette_metadata.get('gazette_date') or datetime.now(),
                'gazette_date': gazette_metadata.get('gazette_date'),
                'gazette_number': gazette_metadata.get('gazette_number'),
                'item_number': item_number,
                'source_item_number': item_number,
                'page_number': page_num,
                'gazette_page': page_num,
                'jurisdiction': "Ghana",
                'person_id': person.id,
                'old_date_of_birth': old_dob,
                'new_date_of_birth': new_dob,
                'effective_date_of_change': effective_date,
                'is_public': True,
                'created_by': None
            }
            
            gazette = Gazette(**entry_data)
            self.db.add(gazette)
            self.db.commit()
            self.db.refresh(gazette)
            
            saved_entries.append(gazette)
            logger.info(f"Saved DOB change: {name} (Item {item_number})")
        
        return saved_entries
    
    def process_change_of_pob_section(self, text: str, page_num: int, gazette_metadata: Dict) -> List[Gazette]:
        """Process a change of place of birth section"""
        saved_entries = []
        
        # Split into individual entries by Item Number
        entry_pattern = r'(\d{4,6})\s+([^\d]+?)(?=\d{4,6}\s+|$)'
        entries = re.findall(entry_pattern, text, re.MULTILINE | re.DOTALL)
        
        for item_no_str, entry_text in entries:
            item_number = item_no_str.strip()
            
            # Check for duplicate
            if self.check_duplicate(
                gazette_metadata.get('gazette_number') or '',
                item_number,
                GazetteType.CHANGE_OF_PLACE_OF_BIRTH
            ):
                continue
            
            # Extract name
            name_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})', entry_text)
            if not name_match:
                continue
            
            name = name_match.group(1).strip()
            gender = self.identify_gender(entry_text, name)
            
            # Extract places
            place_patterns = [
                r'(?:born at|place of birth|from)\s+([^,\n]+)',
                r'from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            ]
            
            old_pob = "N/A"
            new_pob = "N/A"
            
            for pattern in place_patterns:
                matches = re.findall(pattern, entry_text, re.IGNORECASE)
                if matches:
                    if isinstance(matches[0], tuple):
                        old_pob = matches[0][0].strip() if len(matches[0]) > 0 else "N/A"
                        if len(matches[0]) > 1:
                            new_pob = matches[0][1].strip() if matches[0][1].strip() else "N/A"
                    else:
                        old_pob = matches[0].strip() if matches[0].strip() else "N/A"
                    break
            
            # Extract effective date
            effective_date = None
            eff_patterns = [
                r'effective\s+date[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
                r'date\s+of\s+change[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            ]
            for pattern in eff_patterns:
                match = re.search(pattern, entry_text, re.IGNORECASE)
                if match:
                    effective_date = self._parse_date(match.group(1))
                    break
            
            # Find or create person
            person = self.find_or_create_person(name, gender=gender)
            
            # Create and save entry
            entry_data = {
                'title': f"Change of Place of Birth - {name}",
                'content': entry_text[:1000],
                'gazette_type': GazetteType.CHANGE_OF_PLACE_OF_BIRTH,
                'status': GazetteStatus.PUBLISHED,
                'priority': GazettePriority.MEDIUM,
                'publication_date': gazette_metadata.get('gazette_date') or datetime.now(),
                'gazette_date': gazette_metadata.get('gazette_date'),
                'gazette_number': gazette_metadata.get('gazette_number'),
                'item_number': item_number,
                'source_item_number': item_number,
                'page_number': page_num,
                'gazette_page': page_num,
                'jurisdiction': "Ghana",
                'person_id': person.id,
                'old_place_of_birth': old_pob if old_pob != 'N/A' else None,
                'new_place_of_birth': new_pob if new_pob != 'N/A' else None,
                'effective_date_of_change': effective_date,
                'is_public': True,
                'created_by': None
            }
            
            gazette = Gazette(**entry_data)
            self.db.add(gazette)
            self.db.commit()
            self.db.refresh(gazette)
            
            saved_entries.append(gazette)
            logger.info(f"Saved POB change: {name} (Item {item_number})")
        
        return saved_entries
    
    def verify_item_sequence(self, item_numbers: List[str], gazette_number: str) -> List[Tuple[str, str]]:
        """Verify Item Number sequence continuity and return missing ranges"""
        missing_ranges = []
        
        if not item_numbers or len(item_numbers) < 2:
            return missing_ranges
        
        # Convert to integers and sort
        try:
            nums = sorted([int(n) for n in item_numbers if n and n.isdigit()])
        except:
            return missing_ranges
        
        # Check for gaps
        for i in range(len(nums) - 1):
            if nums[i+1] - nums[i] > 1:
                start = nums[i] + 1
                end = nums[i+1] - 1
                missing_ranges.append((str(start), str(end)))
        
        return missing_ranges
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'db'):
            self.db.close()

