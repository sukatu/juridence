import os
import openai
import re
from typing import Dict, List, Any, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from models.people import People
from models.reported_cases import ReportedCases
from models.person_analytics import PersonAnalytics
import json

class PersonAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Risk assessment keywords and weights
        self.risk_keywords = {
            'criminal': {'weight': 10, 'keywords': ['criminal', 'fraud', 'theft', 'murder', 'assault', 'robbery', 'drug', 'money laundering']},
            'financial': {'weight': 8, 'keywords': ['fraud', 'embezzlement', 'money laundering', 'tax evasion', 'financial crime']},
            'violence': {'weight': 9, 'keywords': ['assault', 'battery', 'domestic violence', 'murder', 'manslaughter', 'violence']},
            'corruption': {'weight': 7, 'keywords': ['corruption', 'bribery', 'kickback', 'misappropriation', 'abuse of office']},
            'business_dispute': {'weight': 3, 'keywords': ['contract', 'breach', 'business', 'commercial', 'partnership']},
            'family': {'weight': 2, 'keywords': ['divorce', 'custody', 'alimony', 'family', 'domestic']},
            'property': {'weight': 4, 'keywords': ['property', 'land', 'real estate', 'boundary', 'ownership']}
        }
        
        # Subject matter categories
        self.subject_categories = {
            'Contract Dispute': ['contract', 'agreement', 'breach', 'specific performance', 'damages'],
            'Property Dispute': ['land', 'property', 'title', 'ownership', 'boundary', 'lease'],
            'Fraud': ['fraud', 'deception', 'misrepresentation', 'embezzlement', 'forgery'],
            'Family Law': ['divorce', 'marriage', 'child custody', 'alimony', 'adoption'],
            'Criminal': ['murder', 'theft', 'assault', 'robbery', 'homicide', 'manslaughter'],
            'Commercial': ['company', 'corporate', 'business', 'merger', 'acquisition', 'shareholder'],
            'Employment': ['employment', 'dismissal', 'termination', 'harassment', 'discrimination'],
            'Tort': ['negligence', 'defamation', 'slander', 'libel', 'personal injury'],
            'Constitutional': ['constitution', 'human rights', 'fundamental rights', 'election'],
            'Administrative': ['administrative', 'public body', 'government', 'permit', 'license']
        }

    def calculate_risk_score(self, cases: List[ReportedCases]) -> Tuple[int, str, List[str]]:
        """Calculate risk score based on case analysis"""
        if not cases:
            return 0, "Low", []
        
        total_score = 0
        risk_factors = []
        
        for case in cases:
            case_text = self._get_case_text(case)
            case_score = 0
            case_risk_factors = []
            
            # Analyze case text for risk indicators
            for category, data in self.risk_keywords.items():
                weight = data['weight']
                keywords = data['keywords']
                
                for keyword in keywords:
                    if keyword.lower() in case_text.lower():
                        case_score += weight
                        case_risk_factors.append(f"{category}: {keyword}")
            
            # Additional factors
            if case.area_of_law and 'criminal' in case.area_of_law.lower():
                case_score += 5
                case_risk_factors.append("criminal case type")
            
            if case.status and 'convicted' in case.status.lower():
                case_score += 10
                case_risk_factors.append("conviction")
            
            total_score += case_score
            risk_factors.extend(case_risk_factors)
        
        # Normalize score to 0-100
        max_possible_score = len(cases) * 50  # Maximum possible score per case
        normalized_score = min(int((total_score / max_possible_score) * 100), 100)
        
        # Determine risk level
        if normalized_score >= 80:
            risk_level = "Critical"
        elif normalized_score >= 60:
            risk_level = "High"
        elif normalized_score >= 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return normalized_score, risk_level, list(set(risk_factors))

    def calculate_financial_impact(self, cases: List[ReportedCases]) -> Tuple[Decimal, Decimal, str]:
        """Calculate financial impact metrics"""
        monetary_amounts = []
        
        for case in cases:
            # Extract monetary amounts from case text
            case_text = self._get_case_text(case)
            amounts = self._extract_monetary_amounts(case_text)
            monetary_amounts.extend(amounts)
        
        if not monetary_amounts:
            return Decimal('0.00'), Decimal('0.00'), "Low"
        
        total_amount = sum(monetary_amounts)
        average_amount = total_amount / len(monetary_amounts)
        
        # Determine financial risk level
        if total_amount >= 1000000:
            financial_risk_level = "Critical"
        elif total_amount >= 500000:
            financial_risk_level = "High"
        elif total_amount >= 100000:
            financial_risk_level = "Medium"
        else:
            financial_risk_level = "Low"
        
        return total_amount, average_amount, financial_risk_level

    def analyze_subject_matter(self, cases: List[ReportedCases]) -> Tuple[str, List[str], List[str], List[str]]:
        """Analyze subject matter and legal issues"""
        if not cases:
            return "N/A", [], [], []
        
        all_text = " ".join([self._get_case_text(case) for case in cases])
        
        # Analyze subject matter categories
        category_scores = {}
        for category, keywords in self.subject_categories.items():
            score = sum(1 for keyword in keywords if keyword.lower() in all_text.lower())
            if score > 0:
                category_scores[category] = score
        
        primary_subject = max(category_scores.items(), key=lambda x: x[1])[0] if category_scores else "Other"
        subject_categories = list(category_scores.keys())
        
        # Extract legal issues and financial terms
        legal_issues = self._extract_legal_issues(all_text)
        financial_terms = self._extract_financial_terms(all_text)
        
        return primary_subject, subject_categories, legal_issues, financial_terms

    def calculate_case_complexity(self, cases: List[ReportedCases]) -> int:
        """Calculate case complexity score"""
        if not cases:
            return 0
        
        complexity_factors = 0
        for case in cases:
            case_text = self._get_case_text(case)
            
            # Complexity indicators
            if len(case_text) > 5000:
                complexity_factors += 2
            if 'appeal' in case_text.lower():
                complexity_factors += 3
            if 'supreme court' in case_text.lower():
                complexity_factors += 2
            if 'multiple' in case_text.lower() or 'several' in case_text.lower():
                complexity_factors += 1
            if case.area_of_law and 'constitutional' in case.area_of_law.lower():
                complexity_factors += 2
        
        return min(complexity_factors, 100)

    def calculate_success_rate(self, cases: List[ReportedCases]) -> Decimal:
        """Calculate success rate based on case outcomes"""
        if not cases:
            return Decimal('0.00')
        
        resolved_cases = [case for case in cases if case.status and 'resolved' in case.status.lower()]
        if not resolved_cases:
            return Decimal('0.00')
        
        favorable_outcomes = 0
        for case in resolved_cases:
            case_text = self._get_case_text(case)
            if any(word in case_text.lower() for word in ['dismissed', 'acquitted', 'favorable', 'won', 'successful']):
                favorable_outcomes += 1
        
        success_rate = (favorable_outcomes / len(resolved_cases)) * 100
        return Decimal(str(round(success_rate, 2)))

    def _get_case_text(self, case: ReportedCases) -> str:
        """Extract all relevant text from a case"""
        text_parts = []
        if case.title:
            text_parts.append(case.title)
        if case.case_summary:
            text_parts.append(case.case_summary)
        if case.decision:
            text_parts.append(case.decision)
        if case.judgement:
            text_parts.append(case.judgement)
        if case.conclusion:
            text_parts.append(case.conclusion)
        if case.keywords_phrases:
            text_parts.append(case.keywords_phrases)
        if case.area_of_law:
            text_parts.append(case.area_of_law)
        
        return " ".join(text_parts)

    def _extract_monetary_amounts(self, text: str) -> List[Decimal]:
        """Extract monetary amounts from text"""
        amounts = []
        # Pattern for monetary amounts (e.g., $100,000, GHS 50,000, etc.)
        patterns = [
            r'\$[\d,]+(?:\.\d{2})?',
            r'GHS\s*[\d,]+(?:\.\d{2})?',
            r'GH₵\s*[\d,]+(?:\.\d{2})?',
            r'[\d,]+(?:\.\d{2})?\s*(?:dollars?|cedis?)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean and convert to decimal
                clean_amount = re.sub(r'[^\d.,]', '', match)
                if clean_amount:
                    try:
                        amount = Decimal(clean_amount.replace(',', ''))
                        amounts.append(amount)
                    except:
                        continue
        
        return amounts

    def _extract_legal_issues(self, text: str) -> List[str]:
        """Extract legal issues from text"""
        legal_issues = []
        issue_keywords = [
            'constitutional', 'human rights', 'due process', 'equal protection',
            'contract breach', 'negligence', 'fraud', 'misrepresentation',
            'employment law', 'discrimination', 'harassment', 'wrongful termination',
            'property rights', 'intellectual property', 'patent', 'copyright',
            'criminal law', 'evidence', 'procedure', 'jurisdiction'
        ]
        
        for keyword in issue_keywords:
            if keyword.lower() in text.lower():
                legal_issues.append(keyword.title())
        
        return list(set(legal_issues))

    def _extract_financial_terms(self, text: str) -> List[str]:
        """Extract financial terms from text"""
        financial_terms = []
        term_keywords = [
            'interest rate', 'compound interest', 'penalty', 'fine',
            'damages', 'compensation', 'restitution', 'remedy',
            'injunction', 'specific performance', 'liquidated damages',
            'breach of contract', 'unjust enrichment', 'quantum meruit'
        ]
        
        for keyword in term_keywords:
            if keyword.lower() in text.lower():
                financial_terms.append(keyword.title())
        
        return list(set(financial_terms))

    async def generate_analytics_for_person(self, person_id: int) -> Optional[PersonAnalytics]:
        """Generate comprehensive analytics for a person"""
        # Check if analytics already exist
        existing_analytics = self.db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first()
        if existing_analytics:
            return existing_analytics
        
        # Get person
        person = self.db.query(People).filter(People.id == person_id).first()
        if not person:
            print(f"Person with ID {person_id} not found in database")
            # Let's also check if there are any people in the database
            all_people = self.db.query(People).limit(5).all()
            print(f"Found {len(all_people)} people in database")
            if all_people:
                print(f"First person ID: {all_people[0].id}")
            return None
        
        # Get related cases
        cases = self.db.query(ReportedCases).filter(
            ReportedCases.title.contains(person.full_name)
        ).all()
        
        try:
            if not cases:
                # Create minimal analytics for person with no cases
                analytics = PersonAnalytics(
                    person_id=person_id,
                    risk_score=0,
                    risk_level="Low",
                    risk_factors=[],
                    total_monetary_amount=Decimal('0.00'),
                    average_case_value=Decimal('0.00'),
                    financial_risk_level="Low",
                    primary_subject_matter="N/A",
                    subject_matter_categories=[],
                    legal_issues=[],
                    financial_terms=[],
                    case_complexity_score=0,
                    success_rate=Decimal('0.00')
                )
            else:
                # Calculate all analytics
                risk_score, risk_level, risk_factors = self.calculate_risk_score(cases)
                total_amount, avg_amount, financial_risk = self.calculate_financial_impact(cases)
                primary_subject, subject_categories, legal_issues, financial_terms = self.analyze_subject_matter(cases)
                complexity_score = self.calculate_case_complexity(cases)
                success_rate = self.calculate_success_rate(cases)
                
                analytics = PersonAnalytics(
                    person_id=person_id,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    risk_factors=risk_factors,
                    total_monetary_amount=total_amount,
                    average_case_value=avg_amount,
                    financial_risk_level=financial_risk,
                    primary_subject_matter=primary_subject,
                    subject_matter_categories=subject_categories,
                    legal_issues=legal_issues,
                    financial_terms=financial_terms,
                    case_complexity_score=complexity_score,
                    success_rate=success_rate
                )
            
            # Save analytics
            self.db.add(analytics)
            self.db.commit()
            self.db.refresh(analytics)
            return analytics
            
        except Exception as e:
            # If there's a unique constraint violation, try to get the existing record
            self.db.rollback()
            existing_analytics = self.db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first()
            if existing_analytics:
                return existing_analytics
            else:
                # If still no record, return None
                return None
