"""
Service for generating case summaries from judgment text.
Analyzes judgment text like a legal assistant and extracts key information,
especially monetary values.
"""

import re
from decimal import Decimal
from typing import Optional, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from models.case_summary import CaseSummary
from models.reported_cases import ReportedCases


class CaseSummaryService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_summary(self, case_id: int) -> Optional[CaseSummary]:
        """Generate a case summary for a given case."""
        case = self.db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
        if not case:
            return None
        
        # Initialize variables
        monetary_value = None
        currency = "GHS"
        has_monetary_value = False
        summary = None
        
        # Get judgment text
        judgment_text = self._get_judgment_text(case)
        
        if judgment_text and len(judgment_text.strip()) >= 50:
            # Extract monetary value from judgment text
            monetary_value, currency = self._extract_monetary_value(judgment_text)
            has_monetary_value = monetary_value is not None and monetary_value > 0
            
            # Generate comprehensive summary from judgment text
            summary = self._generate_summary_text(case, judgment_text, monetary_value, currency)
        
        # If no summary from judgment text, try basic summary
        if not summary:
            summary = self._generate_basic_summary(case)
            if not summary:
                return None
        
        # Extract monetary value from summary text if not already found
        if not has_monetary_value:
            extracted_value, extracted_currency = self._extract_monetary_value(summary)
            if extracted_value:
                monetary_value = extracted_value
                currency = extracted_currency or "GHS"
                has_monetary_value = True
        
        # Create or update case summary
        existing_summary = self.db.query(CaseSummary).filter(CaseSummary.case_id == case_id).first()
        
        if existing_summary:
            existing_summary.summary = summary
            existing_summary.monetary_value = monetary_value
            existing_summary.monetary_currency = currency
            existing_summary.has_monetary_value = has_monetary_value
            self.db.commit()
            self.db.refresh(existing_summary)
            return existing_summary
        else:
            new_summary = CaseSummary(
                case_id=case_id,
                summary=summary,
                monetary_value=monetary_value,
                monetary_currency=currency,
                has_monetary_value=has_monetary_value
            )
            self.db.add(new_summary)
            self.db.commit()
            self.db.refresh(new_summary)
            return new_summary
    
    def _get_judgment_text(self, case: ReportedCases) -> str:
        """Extract judgment text from case."""
        text_parts = []
        
        if case.summernote:
            text_parts.append(case.summernote)
        if case.judgement:
            text_parts.append(case.judgement)
        if case.decision:
            text_parts.append(case.decision)
        if case.case_summary:
            text_parts.append(case.case_summary)
        if case.headnotes:
            text_parts.append(case.headnotes)
        if case.commentary:
            text_parts.append(case.commentary)
        if case.conclusion:
            text_parts.append(case.conclusion)
        
        return " ".join(text_parts)
    
    def _extract_monetary_value(self, text: str) -> Tuple[Optional[float], Optional[str]]:
        """Extract monetary value from judgment text."""
        if not text:
            return None, None
        
        # Patterns for monetary values
        patterns = [
            # GHS/₵ patterns
            r'[₵GHS]\s*([\d,]+(?:\.\d+)?)\s*(?:million|thousand|billion|M|K|B)?',
            r'([\d,]+(?:\.\d+)?)\s*(?:million|thousand|billion|M|K|B)?\s*[₵GHS]',
            # Dollar patterns
            r'[\$USD]\s*([\d,]+(?:\.\d+)?)\s*(?:million|thousand|billion|M|K|B)?',
            r'([\d,]+(?:\.\d+)?)\s*(?:million|thousand|billion|M|K|B)?\s*[\$USD]',
            # Generic patterns with keywords
            r'(?:amount|sum|value|award|damages|compensation|payment|cost)[\s:]*of[\s:]*[₵$GHSUSD]*\s*([\d,]+(?:\.\d+)?)\s*(?:million|thousand|billion|M|K|B)?',
            r'[₵$GHSUSD]*\s*([\d,]+(?:\.\d+)?)\s*(?:million|thousand|billion|M|K|B)?\s*(?:cedis|ghana|dollars|dollar)',
        ]
        
        amounts = []
        currencies = []
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    amount_str = match.group(1).replace(',', '')
                    amount = float(amount_str)
                    
                    # Check for multipliers
                    full_match = match.group(0).upper()
                    if 'MILLION' in full_match or 'M' in full_match:
                        amount *= 1000000
                    elif 'THOUSAND' in full_match or 'K' in full_match:
                        amount *= 1000
                    elif 'BILLION' in full_match or 'B' in full_match:
                        amount *= 1000000000
                    
                    amounts.append(amount)
                    
                    # Determine currency
                    if '₵' in full_match or 'GHS' in full_match or 'CEDIS' in full_match or 'GHANA' in full_match:
                        currencies.append('GHS')
                    elif '$' in full_match or 'USD' in full_match or 'DOLLAR' in full_match:
                        currencies.append('USD')
                    else:
                        currencies.append('GHS')  # Default to GHS
                        
                except (ValueError, IndexError):
                    continue
        
        if amounts:
            # Return the largest amount (likely the main award/decision)
            max_amount = max(amounts)
            max_index = amounts.index(max_amount)
            return max_amount, currencies[max_index] if max_index < len(currencies) else 'GHS'
        
        return None, None
    
    def _generate_basic_summary(self, case: ReportedCases) -> Optional[str]:
        """Generate a basic summary from case metadata when judgment text is not available."""
        summary_parts = []
        
        plaintiff = case.protagonist or "Plaintiff"
        defendant = case.antagonist or "Defendant"
        title = case.title or "Unknown Case"
        
        summary_parts.append(f"This case involves {plaintiff} (Plaintiff) against {defendant} (Defendant).")
        
        if case.area_of_law:
            summary_parts.append(f"The case relates to {case.area_of_law} law.")
        
        if case.court_type:
            summary_parts.append(f"The case was heard in the {case.court_type}.")
        
        if case.case_summary:
            # Use existing case summary if available
            clean_summary = re.sub(r'<[^>]+>', '', case.case_summary)
            clean_summary = re.sub(r'\s+', ' ', clean_summary).strip()
            if len(clean_summary) > 100:
                summary_parts.append(clean_summary[:500] + ("..." if len(clean_summary) > 500 else ""))
        
        if case.headnotes:
            clean_headnotes = re.sub(r'<[^>]+>', '', case.headnotes)
            clean_headnotes = re.sub(r'\s+', ' ', clean_headnotes).strip()
            if len(clean_headnotes) > 50:
                summary_parts.append(f"Key points: {clean_headnotes[:300]}" + ("..." if len(clean_headnotes) > 300 else ""))
        
        return " ".join(summary_parts) if summary_parts else None
    
    def _generate_summary_text(self, case: ReportedCases, judgment_text: str, 
                              monetary_value: Optional[float], currency: Optional[str]) -> str:
        """Generate comprehensive summary text from judgment, analyzing it like a legal assistant."""
        summary_parts = []
        
        # Clean judgment text
        judgment_clean = re.sub(r'<[^>]+>', '', judgment_text)  # Remove HTML tags
        judgment_clean = re.sub(r'\s+', ' ', judgment_clean).strip()
        
        # Extract key parties
        plaintiff = case.protagonist or "Plaintiff"
        defendant = case.antagonist or "Defendant"
        
        # Start with case overview
        summary_parts.append(f"This case involves {plaintiff} (Plaintiff) against {defendant} (Defendant).")
        
        # Extract and analyze key facts from judgment
        sentences = [s.strip() for s in judgment_clean.split('.') if s.strip()]
        
        if len(sentences) > 0:
            # Identify key factual sections (usually after introductory statements)
            # Look for sentences that contain key legal terms or facts
            key_sentences = []
            skip_patterns = [
                r'^\s*(PLAINTIFF|DEFENDANT|JUDGE|COURT|CASE NO|SUIT NO)',
                r'^\s*\[',
                r'^\s*\d+\s+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)',
            ]
            
            factual_keywords = ['alleged', 'claimed', 'breach', 'contract', 'damages', 'injury', 'loss', 
                              'violation', 'failed', 'agreement', 'dispute', 'payment', 'property', 'rights']
            
            # Find substantive factual sentences (skip headers and dates)
            for i, sentence in enumerate(sentences[2:min(len(sentences), 30)], start=2):  # Skip first 2, check up to 30
                if any(re.match(pattern, sentence, re.IGNORECASE) for pattern in skip_patterns):
                    continue
                if any(keyword in sentence.lower() for keyword in factual_keywords):
                    key_sentences.append(sentence)
                    if len(key_sentences) >= 5:  # Get up to 5 key sentences
                        break
            
            # If we found key sentences, use them; otherwise use middle section
            if key_sentences:
                summary_parts.append(' '.join(key_sentences[:5]) + '.')
            elif len(sentences) > 5:
                # Use sentences 3-10 for context
                summary_parts.append('. '.join(sentences[3:10]) + '.')
            else:
                summary_parts.append('. '.join(sentences[1:]) + '.')
        
        # Add monetary value information prominently if present
        if monetary_value and monetary_value > 0:
            formatted_value = self._format_currency(monetary_value, currency or 'GHS')
            summary_parts.append(f"The case involves a significant monetary value of {formatted_value}.")
        
        # Extract and analyze outcome
        text_lower = judgment_clean.lower()
        outcome_keywords = {
            'won': ['granted', 'allowed', 'upheld', 'succeeded', 'successful', 'judgment for', 'in favor of'],
            'lost': ['dismissed', 'rejected', 'denied', 'unsuccessful', 'failed', 'struck out'],
            'partially': ['partially', 'in part', 'some claims', 'part of the']
        }
        
        outcome = "resolved"
        outcome_details = []
        for keyword_type, keywords in outcome_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if keyword_type == 'won':
                        outcome = "decided in favor of the plaintiff"
                    elif keyword_type == 'lost':
                        outcome = "decided in favor of the defendant"
                    elif keyword_type == 'partially':
                        outcome = "partially resolved with mixed outcomes"
                    outcome_details.append(keyword)
                    break
            if outcome != "resolved":
                break
        
        summary_parts.append(f"The court {outcome}.")
        
        return ' '.join(summary_parts)
    
    def _format_currency(self, value: float, currency: str) -> str:
        """Format monetary value with currency symbol."""
        if value >= 1000000:
            formatted = f"{value / 1000000:.2f} million"
        elif value >= 1000:
            formatted = f"{value / 1000:.2f} thousand"
        else:
            formatted = f"{value:,.2f}"
        
        if currency == 'GHS':
            return f"₵{formatted}"
        elif currency == 'USD':
            return f"${formatted}"
        else:
            return f"{currency} {formatted}"
    
    def get_summary(self, case_id: int) -> Optional[CaseSummary]:
        """Get existing case summary."""
        return self.db.query(CaseSummary).filter(
            CaseSummary.case_id == case_id,
            CaseSummary.is_active == True
        ).first()
