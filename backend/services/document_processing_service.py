#!/usr/bin/env python3
"""
Document Processing Service for Case Documents
Extracts text from PDF/DOC files and analyzes content using AI
"""

import os
import re
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging

# Document processing libraries
try:
    import PyPDF2
    import docx
    from PIL import Image
    import pytesseract
    import pdf2image
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PDF processing libraries not installed. Install with: pip install PyPDF2 python-docx pillow pytesseract pdf2image")

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_service import AIService

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    """Service for processing case documents and extracting information"""
    
    def __init__(self):
        self.ai_service = AIService()
        
    def extract_text_from_document(self, file_path: str) -> str:
        """Extract text from PDF or DOCX document"""
        try:
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                return self._extract_text_from_pdf(file_path)
            elif file_extension in ['.docx', '.doc']:
                return self._extract_text_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            raise
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using multiple methods"""
        text = ""
        
        try:
            # Method 1: Try PyPDF2 first (faster for text-based PDFs)
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            
            # If text extraction is poor, try OCR
            if len(text.strip()) < 100:  # If very little text extracted
                logger.info("PDF text extraction poor, trying OCR...")
                text = self._extract_text_with_ocr(file_path)
                
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}, trying OCR...")
            text = self._extract_text_with_ocr(file_path)
        
        return text.strip()
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX document"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            raise
    
    def _extract_text_with_ocr(self, file_path: str) -> str:
        """Extract text using OCR (for scanned PDFs)"""
        if not PDF_AVAILABLE:
            raise ImportError("OCR libraries not available")
        
        try:
            # Convert PDF to images
            images = pdf2image.convert_from_path(file_path)
            text = ""
            
            for image in images:
                # Use OCR to extract text from image
                page_text = pytesseract.image_to_string(image)
                text += page_text + "\n"
            
            return text.strip()
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise
    
    def analyze_case_document(self, text: str, filename: str = "") -> Dict:
        """Analyze case document text and extract structured information"""
        try:
            # Clean and prepare text
            cleaned_text = self._clean_text(text)
            
            # Extract basic information using regex patterns
            basic_info = self._extract_basic_info(cleaned_text, filename)
            
            # Use AI to extract detailed information
            ai_analysis = self._analyze_with_ai(cleaned_text, basic_info)
            
            # Combine basic and AI analysis
            case_data = {**basic_info, **ai_analysis}
            
            # Clean and validate the extracted data
            case_data = self._clean_case_data(case_data)
            
            return case_data
            
        except Exception as e:
            logger.error(f"Error analyzing case document: {e}")
            raise
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters that might interfere with analysis
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\(\)\[\]\{\}\-\'\"\/]', '', text)
        return text.strip()
    
    def _extract_basic_info(self, text: str, filename: str) -> Dict:
        """Extract basic information using regex patterns"""
        info = {
            'title': '',
            'suit_reference_number': '',
            'court_type': 'Unknown',
            'court_division': 'Unknown',
            'presiding_judge': 'Unknown',
            'protagonist': 'Unknown',
            'antagonist': 'Unknown',
            'lawyers': '',
            'statutes_cited': '',
            'cases_cited': '',
            'date': datetime.now().date(),
            'year': datetime.now().year,
            'town': 'Unknown',
            'region': 'Unknown',
            'commentary': '',
            'headnotes': '',
            'judgement': '',
            'type': 'document_upload'
        }
        
        # Extract title from filename or text
        if filename:
            info['title'] = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
        
        # Extract suit reference number
        suit_patterns = [
            r'SUIT NO[\.\s]*:?\s*([A-Z0-9\/\-]+)',
            r'CASE NO[\.\s]*:?\s*([A-Z0-9\/\-]+)',
            r'REF[\.\s]*:?\s*([A-Z0-9\/\-]+)',
            r'([A-Z]{2,4}\/\d{4}\/\d+)',  # Pattern like SU/2024/123
            r'([A-Z]{2,4}\/\d{3}\/\d+)',  # Pattern like HI/182/2021
            r'([A-Z]{1,3}\/\d{2,4}\/\d+)',  # Pattern like FAL/2021/123
        ]
        
        for pattern in suit_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['suit_reference_number'] = match.group(1).strip()
                break
        
        # Extract court information
        court_patterns = [
            r'(HIGH COURT|SUPREME COURT|COURT OF APPEAL|DISTRICT COURT|CIRCUIT COURT)',
            r'(COMMERCIAL COURT|FAMILY COURT|LAND COURT)',
        ]
        
        for pattern in court_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['court_type'] = match.group(1).title()
                break
        
        # Extract judge information
        judge_patterns = [
            r'JUDGE[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'JUSTICE[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'PRESIDING[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in judge_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['presiding_judge'] = match.group(1).strip()
                break
        
        # Extract parties (Plaintiff vs Defendant)
        party_patterns = [
            r'([A-Z][A-Za-z\s]+)\s+VS?\.?\s+([A-Z][A-Za-z\s]+)',
            r'([A-Z][A-Za-z\s]+)\s+V\.?\s+([A-Z][A-Za-z\s]+)',
            r'PLAINTIFF[:\s]*([A-Z][A-Za-z\s]+).*?DEFENDANT[:\s]*([A-Z][A-Za-z\s]+)',
        ]
        
        for pattern in party_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                info['protagonist'] = match.group(1).strip()
                info['antagonist'] = match.group(2).strip()
                break
        
        # Extract date information
        date_patterns = [
            r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'(\d{1,2}\s+(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{2,4})',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    date_str = match.group(1)
                    # Try to parse the date
                    if '/' in date_str or '-' in date_str:
                        parts = re.split(r'[\/\-]', date_str)
                        if len(parts) == 3:
                            day, month, year = parts
                            if len(year) == 2:
                                year = '20' + year
                            info['date'] = datetime(int(year), int(month), int(day)).date()
                            info['year'] = int(year)
                except:
                    pass
                break
        
        return info
    
    def _analyze_with_ai(self, text: str, basic_info: Dict) -> Dict:
        """Use AI to extract detailed case information"""
        try:
            # Prepare prompt for AI analysis
            prompt = f"""
            Analyze the following legal case document and extract structured information. 
            Return a JSON object with the following fields:
            
            {{
                "title": "Case title (if not already extracted)",
                "suit_reference_number": "Case/suit reference number",
                "court_type": "Type of court (High Court, Supreme Court, etc.)",
                "court_division": "Court division or jurisdiction",
                "presiding_judge": "Name of presiding judge",
                "protagonist": "Plaintiff/applicant name",
                "antagonist": "Defendant/respondent name",
                "lawyers": "Names of lawyers involved (comma-separated)",
                "statutes_cited": "Statutes or laws cited (comma-separated)",
                "cases_cited": "Previous cases cited (comma-separated)",
                "area_of_law": "Area of law (Contract, Tort, Property, etc.)",
                "case_summary": "Brief summary of the case",
                "headnotes": "Key legal points or headnotes",
                "judgement": "Court's decision or judgement",
                "commentary": "Legal commentary or analysis",
                "town": "Town or city where case was heard",
                "region": "Region or state",
                "keywords_phrases": "Key legal terms and phrases (comma-separated)",
                "conclusion": "Case conclusion or outcome"
            }}
            
            Document text:
            {text[:4000]}  # Limit text to avoid token limits
            
            Current basic info: {json.dumps(basic_info, default=str)}
            
            Extract and return only the JSON object with the extracted information.
            """
            
            # Get AI analysis
            ai_response = self.ai_service.generate_text(prompt)
            
            # Parse AI response
            try:
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    ai_data = json.loads(json_match.group())
                    return ai_data
            except json.JSONDecodeError:
                logger.warning("Failed to parse AI response as JSON")
            
            return {}
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return {}
    
    def _clean_case_data(self, case_data: Dict) -> Dict:
        """Clean and validate extracted case data"""
        # Clean string fields
        string_fields = [
            'title', 'suit_reference_number', 'court_type', 'court_division',
            'presiding_judge', 'protagonist', 'antagonist', 'lawyers',
            'statutes_cited', 'cases_cited', 'area_of_law', 'case_summary',
            'headnotes', 'judgement', 'commentary', 'town', 'region',
            'keywords_phrases', 'conclusion'
        ]
        
        for field in string_fields:
            if field in case_data:
                # Clean the string
                value = str(case_data[field]).strip()
                # Remove excessive whitespace
                value = re.sub(r'\s+', ' ', value)
                # Limit length
                if len(value) > 1000:
                    value = value[:1000] + "..."
                case_data[field] = value
        
        # Ensure required fields have values
        if not case_data.get('title'):
            case_data['title'] = 'Document Upload Case'
        
        if not case_data.get('suit_reference_number'):
            case_data['suit_reference_number'] = f"DOC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Convert date if it's a string
        if isinstance(case_data.get('date'), str):
            try:
                case_data['date'] = datetime.strptime(case_data['date'], '%Y-%m-%d').date()
            except:
                case_data['date'] = datetime.now().date()
        
        # Ensure year is integer
        if 'year' in case_data:
            try:
                case_data['year'] = int(case_data['year'])
            except:
                case_data['year'] = datetime.now().year
        
        return case_data
    
    def process_document(self, file_path: str, filename: str = "") -> Dict:
        """Main method to process a case document"""
        try:
            logger.info(f"Processing document: {filename}")
            
            # Extract text from document
            text = self.extract_text_from_document(file_path)
            logger.info(f"Extracted {len(text)} characters from document")
            
            # Analyze the document
            case_data = self.analyze_case_document(text, filename)
            logger.info(f"Extracted case data: {case_data.get('title', 'Unknown')}")
            
            return case_data
            
        except Exception as e:
            logger.error(f"Error processing document {filename}: {e}")
            raise

# Example usage and testing
if __name__ == "__main__":
    # Test with sample documents
    service = DocumentProcessingService()
    sample_dir = "cases_documents"
    
    if os.path.exists(sample_dir):
        for filename in os.listdir(sample_dir):
            if filename.endswith(('.pdf', '.docx', '.doc')):
                file_path = os.path.join(sample_dir, filename)
                try:
                    print(f"\nProcessing: {filename}")
                    case_data = service.process_document(file_path, filename)
                    print(f"Title: {case_data.get('title')}")
                    print(f"Suit No: {case_data.get('suit_reference_number')}")
                    print(f"Parties: {case_data.get('protagonist')} vs {case_data.get('antagonist')}")
                    print(f"Court: {case_data.get('court_type')}")
                    print(f"Judge: {case_data.get('presiding_judge')}")
                    print(f"Area of Law: {case_data.get('area_of_law')}")
                    print("-" * 50)
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
