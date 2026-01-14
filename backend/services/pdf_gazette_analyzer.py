#!/usr/bin/env python3
"""
PDF Gazette Analyzer Service
Extracts gazette information from PDF documents and inserts into database
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# PDF processing libraries
try:
    import PyPDF2
    import pdfplumber
    from pdf2image import convert_from_path
    import pytesseract
    from PIL import Image
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PDF processing libraries not installed. Install with: pip install PyPDF2 pdfplumber pdf2image pytesseract pillow")

from database import get_db
from models.gazette import Gazette, GazetteType, GazetteStatus, GazettePriority
from models.people import People
from services.auto_analytics_generator import AutoAnalyticsGenerator

logger = logging.getLogger(__name__)

class PDFGazetteAnalyzer:
    """Service for analyzing PDF gazette documents and extracting structured information"""
    
    def __init__(self):
        self.db = next(get_db())
        
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using multiple methods for better accuracy"""
        try:
            # Method 1: Try pdfplumber first (better for structured text)
            text = self._extract_with_pdfplumber(file_path)
            if text and len(text.strip()) > 100:
                return text
                
            # Method 2: Fallback to PyPDF2
            text = self._extract_with_pypdf2(file_path)
            if text and len(text.strip()) > 100:
                return text
                
            # Method 3: OCR as last resort
            text = self._extract_with_ocr(file_path)
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            raise
    
    def _extract_with_pdfplumber(self, file_path: str) -> str:
        """Extract text using pdfplumber"""
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")
            return ""
    
    def _extract_with_pypdf2(self, file_path: str) -> str:
        """Extract text using PyPDF2"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}")
            return ""
    
    def _extract_with_ocr(self, file_path: str) -> str:
        """Extract text using OCR (for scanned PDFs)"""
        try:
            # Convert PDF to images
            images = convert_from_path(file_path, dpi=300)
            text = ""
            
            for image in images:
                # Use OCR to extract text from image
                page_text = pytesseract.image_to_string(image, config='--psm 6')
                text += page_text + "\n"
            
            return text.strip()
        except Exception as e:
            logger.warning(f"OCR extraction failed: {e}")
            return ""
    
    def analyze_gazette_pdf(self, file_path: str) -> List[Dict]:
        """Analyze PDF and extract gazette entries"""
        try:
            logger.info(f"Analyzing PDF: {file_path}")
            
            # Extract text
            text = self.extract_text_from_pdf(file_path)
            if not text:
                logger.warning(f"No text extracted from {file_path}")
                return []
            
            # Clean and normalize text
            cleaned_text = self._clean_text(text)
            
            # Extract gazette entries based on content patterns
            gazette_entries = self._extract_gazette_entries(cleaned_text, file_path)
            
            logger.info(f"Extracted {len(gazette_entries)} gazette entries from {file_path}")
            return gazette_entries
            
        except Exception as e:
            logger.error(f"Error analyzing PDF {file_path}: {e}")
            return []
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters that might interfere with analysis
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\(\)\[\]\{\}\-\'\"\/\n]', '', text)
        return text.strip()
    
    def _extract_gazette_entries(self, text: str, file_path: str) -> List[Dict]:
        """Extract gazette entries from text using pattern matching"""
        entries = []
        
        # Extract filename information
        filename = os.path.basename(file_path)
        gazette_date = self._extract_date_from_filename(filename)
        gazette_number = self._extract_number_from_filename(filename)
        
        # Split text into sections (look for common gazette patterns)
        sections = self._split_into_sections(text)
        
        for i, section in enumerate(sections):
            # Determine gazette type and extract relevant information
            gazette_type = self._determine_gazette_type(section)
            
            if gazette_type:
                entry = self._extract_entry_data(section, gazette_type, gazette_date, gazette_number, i + 1)
                if entry:
                    entries.append(entry)
        
        return entries
    
    def _extract_date_from_filename(self, filename: str) -> Optional[datetime]:
        """Extract date from filename"""
        # Pattern: "Ghana Government Gazette dated 2004-05-21 number 21.pdf"
        date_pattern = r'dated\s+(\d{4}-\d{2}-\d{2})'
        match = re.search(date_pattern, filename)
        if match:
            try:
                return datetime.strptime(match.group(1), '%Y-%m-%d')
            except:
                pass
        return None
    
    def _extract_number_from_filename(self, filename: str) -> Optional[str]:
        """Extract gazette number from filename"""
        # Pattern: "number 21.pdf"
        number_pattern = r'number\s+(\d+)'
        match = re.search(number_pattern, filename)
        if match:
            return match.group(1)
        return None
    
    def _split_into_sections(self, text: str) -> List[str]:
        """Split text into logical sections for analysis"""
        # Common patterns that indicate new entries
        split_patterns = [
            r'\n\s*\d+\s*\.\s*',  # Numbered items
            r'\n\s*CHANGE\s+OF\s+NAME',  # Change of name headers
            r'\n\s*CHANGE\s+OF\s+DATE\s+OF\s+BIRTH',  # Change of DOB headers
            r'\n\s*CHANGE\s+OF\s+PLACE\s+OF\s+BIRTH',  # Change of POB headers
            r'\n\s*APPOINTMENT\s+OF\s+MARRIAGE\s+OFFICERS',  # Marriage officers headers
            r'\n\s*MARRIAGE\s+OFFICER',  # Marriage officer entries
        ]
        
        sections = [text]  # Start with full text
        
        for pattern in split_patterns:
            new_sections = []
            for section in sections:
                parts = re.split(pattern, section, flags=re.IGNORECASE)
                new_sections.extend([part.strip() for part in parts if part.strip()])
            sections = new_sections
        
        return sections
    
    def _determine_gazette_type(self, text: str) -> Optional[GazetteType]:
        """Determine the type of gazette entry"""
        text_upper = text.upper()
        
        if any(keyword in text_upper for keyword in ['CHANGE OF NAME', 'NAME CHANGE', 'FORMERLY KNOWN AS']):
            return GazetteType.CHANGE_OF_NAME
        elif any(keyword in text_upper for keyword in ['CHANGE OF DATE OF BIRTH', 'DATE OF BIRTH', 'BIRTH DATE']):
            return GazetteType.CHANGE_OF_DATE_OF_BIRTH
        elif any(keyword in text_upper for keyword in ['CHANGE OF PLACE OF BIRTH', 'PLACE OF BIRTH', 'BORN AT']):
            return GazetteType.CHANGE_OF_PLACE_OF_BIRTH
        elif any(keyword in text_upper for keyword in ['MARRIAGE OFFICER', 'APPOINTMENT', 'OFFICER']):
            return GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS
        
        return None
    
    def _extract_entry_data(self, text: str, gazette_type: GazetteType, gazette_date: Optional[datetime], gazette_number: Optional[str], item_number: int) -> Optional[Dict]:
        """Extract specific data based on gazette type"""
        try:
            if gazette_type == GazetteType.CHANGE_OF_NAME:
                return self._extract_change_of_name_data(text, gazette_date, gazette_number, item_number)
            elif gazette_type == GazetteType.CHANGE_OF_DATE_OF_BIRTH:
                return self._extract_change_of_dob_data(text, gazette_date, gazette_number, item_number)
            elif gazette_type == GazetteType.CHANGE_OF_PLACE_OF_BIRTH:
                return self._extract_change_of_pob_data(text, gazette_date, gazette_number, item_number)
            elif gazette_type == GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS:
                return self._extract_marriage_officer_data(text, gazette_date, gazette_number, item_number)
        except Exception as e:
            logger.error(f"Error extracting entry data: {e}")
        
        return None
    
    def _extract_change_of_name_data(self, text: str, gazette_date: Optional[datetime], gazette_number: Optional[str], item_number: int) -> Optional[Dict]:
        """Extract change of name data"""
        # Patterns for name extraction
        name_patterns = [
            r'(?:formerly known as|formerly called|was known as|changed from)\s+([^,\n]+)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:formerly|was known as)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        old_name = ""
        new_name = ""
        
        for pattern in name_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if isinstance(matches[0], tuple):
                    old_name = matches[0][0].strip()
                    if len(matches[0]) > 1:
                        new_name = matches[0][1].strip()
                else:
                    old_name = matches[0].strip()
        
        # If no clear old/new name pattern, try to extract names from the text
        if not old_name and not new_name:
            names = re.findall(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', text)
            if len(names) >= 2:
                old_name = names[0]
                new_name = names[1]
            elif len(names) == 1:
                new_name = names[0]
        
        if not new_name:
            return None
        
        return {
            'gazette_type': GazetteType.CHANGE_OF_NAME,
            'title': f"Change of Name - {new_name}",
            'content': text[:500] + "..." if len(text) > 500 else text,
            'old_name': old_name,
            'new_name': new_name,
            'alias_names': [old_name] if old_name and old_name != new_name else [],
            'gazette_date': gazette_date,
            'gazette_number': gazette_number,
            'item_number': str(item_number),
            'publication_date': gazette_date or datetime.now(),
            'status': GazetteStatus.PUBLISHED,
            'priority': GazettePriority.MEDIUM,
            'jurisdiction': "Ghana",
            'is_public': True
        }
    
    def _extract_change_of_dob_data(self, text: str, gazette_date: Optional[datetime], gazette_number: Optional[str], item_number: int) -> Optional[Dict]:
        """Extract change of date of birth data"""
        # Extract name
        name_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', text)
        if not name_match:
            return None
        
        name = name_match.group(1)
        
        # Extract dates
        date_patterns = [
            r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
            r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            dates.extend(matches)
        
        old_dob = None
        new_dob = None
        
        if len(dates) >= 2:
            old_dob = self._parse_date(dates[0])
            new_dob = self._parse_date(dates[1])
        elif len(dates) == 1:
            new_dob = self._parse_date(dates[0])
        
        return {
            'gazette_type': GazetteType.CHANGE_OF_DATE_OF_BIRTH,
            'title': f"Change of Date of Birth - {name}",
            'content': text[:500] + "..." if len(text) > 500 else text,
            'name': name,
            'old_date_of_birth': old_dob,
            'new_date_of_birth': new_dob,
            'gazette_date': gazette_date,
            'gazette_number': gazette_number,
            'item_number': str(item_number),
            'publication_date': gazette_date or datetime.now(),
            'status': GazetteStatus.PUBLISHED,
            'priority': GazettePriority.MEDIUM,
            'jurisdiction': "Ghana",
            'is_public': True
        }
    
    def _extract_change_of_pob_data(self, text: str, gazette_date: Optional[datetime], gazette_number: Optional[str], item_number: int) -> Optional[Dict]:
        """Extract change of place of birth data"""
        # Extract name
        name_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', text)
        if not name_match:
            return None
        
        name = name_match.group(1)
        
        # Extract places
        place_patterns = [
            r'(?:born at|place of birth|from)\s+([^,\n]+)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:to|changed to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        old_pob = ""
        new_pob = ""
        
        for pattern in place_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if isinstance(matches[0], tuple):
                    old_pob = matches[0][0].strip()
                    if len(matches[0]) > 1:
                        new_pob = matches[0][1].strip()
                else:
                    old_pob = matches[0].strip()
        
        return {
            'gazette_type': GazetteType.CHANGE_OF_PLACE_OF_BIRTH,
            'title': f"Change of Place of Birth - {name}",
            'content': text[:500] + "..." if len(text) > 500 else text,
            'name': name,
            'old_place_of_birth': old_pob,
            'new_place_of_birth': new_pob,
            'gazette_date': gazette_date,
            'gazette_number': gazette_number,
            'item_number': str(item_number),
            'publication_date': gazette_date or datetime.now(),
            'status': GazetteStatus.PUBLISHED,
            'priority': GazettePriority.MEDIUM,
            'jurisdiction': "Ghana",
            'is_public': True
        }
    
    def _extract_marriage_officer_data(self, text: str, gazette_date: Optional[datetime], gazette_number: Optional[str], item_number: int) -> Optional[Dict]:
        """Extract marriage officer appointment data"""
        # Extract officer name
        name_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', text)
        if not name_match:
            return None
        
        officer_name = name_match.group(1)
        
        # Extract additional details
        church_match = re.search(r'(?:church|parish|ministry)\s+([^,\n]+)', text, re.IGNORECASE)
        location_match = re.search(r'(?:location|address|at)\s+([^,\n]+)', text, re.IGNORECASE)
        
        church = church_match.group(1).strip() if church_match else ""
        location = location_match.group(1).strip() if location_match else ""
        
        return {
            'gazette_type': GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS,
            'title': f"Appointment of Marriage Officer - {officer_name}",
            'content': text[:500] + "..." if len(text) > 500 else text,
            'officer_name': officer_name,
            'officer_title': "Marriage Officer",
            'appointment_authority': "Ghana Government",
            'jurisdiction_area': location,
            'gazette_date': gazette_date,
            'gazette_number': gazette_number,
            'item_number': str(item_number),
            'publication_date': gazette_date or datetime.now(),
            'status': GazetteStatus.PUBLISHED,
            'priority': GazettePriority.MEDIUM,
            'jurisdiction': "Ghana",
            'is_public': True
        }
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats"""
        formats = [
            '%d/%m/%Y',
            '%m/%d/%Y',
            '%Y-%m-%d',
            '%d %B %Y',
            '%B %d, %Y',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        
        return None
    
    def find_or_create_person(self, name: str, **kwargs) -> People:
        """Find existing person or create new one"""
        person = self.db.query(People).filter(People.full_name.ilike(name)).first()
        
        if not person:
            logger.info(f"Creating new person: {name}")
            first_name = name.split(' ')[0] if name else None
            last_name = ' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else None
            
            person = People(
                full_name=name,
                first_name=first_name,
                last_name=last_name,
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
            try:
                generator = AutoAnalyticsGenerator(self.db)
                generator.generate_analytics_for_person(person.id)
                logger.info(f"Analytics generated for new person {person.id}")
            except Exception as analytics_error:
                logger.warning(f"Failed to generate analytics for new person {person.id}: {analytics_error}")
        
        return person
    
    def save_gazette_entry(self, entry_data: Dict) -> Optional[Gazette]:
        """Save gazette entry to database"""
        try:
            # Extract person name based on gazette type
            person_name = None
            if entry_data['gazette_type'] == GazetteType.CHANGE_OF_NAME:
                person_name = entry_data.get('new_name')
            elif entry_data['gazette_type'] == GazetteType.CHANGE_OF_DATE_OF_BIRTH:
                person_name = entry_data.get('name')
            elif entry_data['gazette_type'] == GazetteType.CHANGE_OF_PLACE_OF_BIRTH:
                person_name = entry_data.get('name')
            elif entry_data['gazette_type'] == GazetteType.APPOINTMENT_OF_MARRIAGE_OFFICERS:
                person_name = entry_data.get('officer_name')
            
            if not person_name:
                logger.warning("No person name found for gazette entry")
                return None
            
            # Find or create person
            person = self.find_or_create_person(person_name)
            
            # Create gazette entry
            gazette = Gazette(
                title=entry_data['title'],
                content=entry_data['content'],
                gazette_type=entry_data['gazette_type'],
                status=entry_data['status'],
                priority=entry_data['priority'],
                publication_date=entry_data['publication_date'],
                gazette_date=entry_data.get('gazette_date'),
                gazette_number=entry_data.get('gazette_number'),
                item_number=entry_data.get('item_number'),
                jurisdiction=entry_data['jurisdiction'],
                person_id=person.id,
                is_public=entry_data['is_public'],
                created_by=None,
                **{k: v for k, v in entry_data.items() if k not in ['title', 'content', 'gazette_type', 'status', 'priority', 'publication_date', 'gazette_date', 'gazette_number', 'item_number', 'jurisdiction', 'is_public', 'name', 'officer_name']}
            )
            
            self.db.add(gazette)
            self.db.commit()
            self.db.refresh(gazette)
            
            logger.info(f"Saved gazette entry: {gazette.title}")
            return gazette
            
        except Exception as e:
            logger.error(f"Error saving gazette entry: {e}")
            self.db.rollback()
            return None
    
    def process_pdf_file(self, file_path: str) -> Dict:
        """Process a single PDF file and return results"""
        try:
            logger.info(f"Processing PDF file: {file_path}")
            
            # Analyze PDF
            entries = self.analyze_gazette_pdf(file_path)
            
            if not entries:
                return {
                    'file_path': file_path,
                    'success': False,
                    'message': 'No gazette entries found',
                    'entries_processed': 0,
                    'entries_saved': 0
                }
            
            # Save entries to database
            saved_count = 0
            for entry in entries:
                gazette = self.save_gazette_entry(entry)
                if gazette:
                    saved_count += 1
            
            return {
                'file_path': file_path,
                'success': True,
                'message': f'Processed {len(entries)} entries, saved {saved_count}',
                'entries_processed': len(entries),
                'entries_saved': saved_count
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {e}")
            return {
                'file_path': file_path,
                'success': False,
                'message': f'Error: {str(e)}',
                'entries_processed': 0,
                'entries_saved': 0
            }
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'db'):
            self.db.close()

# Example usage
if __name__ == "__main__":
    analyzer = PDFGazetteAnalyzer()
    
    # Process a single PDF
    result = analyzer.process_pdf_file("/path/to/gazette.pdf")
    print(f"Result: {result}")
    
    analyzer.close()
