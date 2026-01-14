import os
import openai
import re
from typing import Dict, List, Any, Optional, Tuple
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from models.people import People
from models.reported_cases import ReportedCases
from models.person_analytics import PersonAnalytics
from models.person_case_statistics import PersonCaseStatistics
from models.gazette import Gazette
import json
import logging

class AutoAnalyticsGenerator:
    def __init__(self, db: Session):
        self.db = db
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Risk assessment keywords and weights
        self.risk_keywords = {
            'criminal': {'weight': 10, 'keywords': ['criminal', 'fraud', 'theft', 'murder', 'assault', 'robbery', 'drug', 'money laundering', 'homicide', 'manslaughter']},
            'financial': {'weight': 8, 'keywords': ['fraud', 'embezzlement', 'money laundering', 'tax evasion', 'financial crime', 'forgery', 'counterfeit']},
            'violence': {'weight': 9, 'keywords': ['assault', 'battery', 'domestic violence', 'murder', 'manslaughter', 'violence', 'threat', 'intimidation']},
            'corruption': {'weight': 7, 'keywords': ['corruption', 'bribery', 'kickback', 'misappropriation', 'abuse of office', 'graft']},
            'business_dispute': {'weight': 3, 'keywords': ['contract', 'breach', 'business', 'commercial', 'partnership', 'agreement']},
            'family': {'weight': 2, 'keywords': ['divorce', 'custody', 'alimony', 'family', 'domestic', 'marriage', 'adoption']},
            'property': {'weight': 4, 'keywords': ['property', 'land', 'real estate', 'boundary', 'ownership', 'title', 'lease']},
            'employment': {'weight': 5, 'keywords': ['employment', 'dismissal', 'termination', 'harassment', 'discrimination', 'workplace']},
            'tort': {'weight': 6, 'keywords': ['negligence', 'defamation', 'slander', 'libel', 'personal injury', 'tort']}
        }
        
        # Subject matter categories
        self.subject_categories = {
            'Contract Dispute': ['contract', 'agreement', 'breach', 'specific performance', 'damages', 'obligation'],
            'Property Dispute': ['land', 'property', 'title', 'ownership', 'boundary', 'lease', 'real estate'],
            'Fraud': ['fraud', 'deception', 'misrepresentation', 'embezzlement', 'forgery', 'counterfeit'],
            'Family Law': ['divorce', 'marriage', 'child custody', 'alimony', 'adoption', 'family'],
            'Criminal': ['murder', 'theft', 'assault', 'robbery', 'homicide', 'manslaughter', 'criminal'],
            'Commercial': ['company', 'corporate', 'business', 'merger', 'acquisition', 'shareholder', 'commercial'],
            'Employment': ['employment', 'dismissal', 'termination', 'harassment', 'discrimination', 'workplace'],
            'Tort': ['negligence', 'defamation', 'slander', 'libel', 'personal injury', 'tort'],
            'Constitutional': ['constitution', 'human rights', 'fundamental rights', 'election', 'constitutional'],
            'Administrative': ['administrative', 'public body', 'government', 'permit', 'license', 'administrative']
        }

    def generate_analytics_for_person(self, person_id: int) -> Dict[str, Any]:
        """Generate comprehensive analytics for a person based on their cases"""
        try:
            # Get person data
            person = self.db.query(People).filter(People.id == person_id).first()
            if not person:
                raise ValueError(f"Person with ID {person_id} not found")
            
            # Get all cases for this person
            cases = self.get_person_cases(person_id)
            
            # Generate analytics
            analytics_data = self.calculate_comprehensive_analytics(person, cases)
            
            # Save analytics to database
            self.save_person_analytics(person_id, analytics_data)
            
            # Generate case statistics
            case_stats = self.calculate_case_statistics(cases)
            self.save_person_case_statistics(person_id, case_stats)
            
            # Update person record with basic stats
            self.update_person_basic_stats(person_id, case_stats)
            
            logging.info(f"Successfully generated analytics for person {person_id}")
            return analytics_data
            
        except Exception as e:
            logging.error(f"Error generating analytics for person {person_id}: {str(e)}")
            raise

    def get_person_cases(self, person_id: int) -> List[ReportedCases]:
        """Get all cases related to a person"""
        # Search for cases by person name in various fields
        person = self.db.query(People).filter(People.id == person_id).first()
        if not person:
            return []
        
        # Search in case titles, parties, and other relevant fields
        search_terms = [person.full_name]
        if person.first_name and person.last_name:
            search_terms.extend([person.first_name, person.last_name])
        
        cases = []
        for term in search_terms:
            if term:
                case_results = self.db.query(ReportedCases).filter(
                    or_(
                        ReportedCases.title.ilike(f"%{term}%"),
                        ReportedCases.antagonist.ilike(f"%{term}%"),
                        ReportedCases.protagonist.ilike(f"%{term}%"),
                        ReportedCases.presiding_judge.ilike(f"%{term}%"),
                        ReportedCases.decision.ilike(f"%{term}%")
                    )
                ).all()
                cases.extend(case_results)
        
        # Remove duplicates
        unique_cases = list({case.id: case for case in cases}.values())
        return unique_cases

    def calculate_comprehensive_analytics(self, person: People, cases: List[ReportedCases]) -> Dict[str, Any]:
        """Calculate comprehensive analytics for a person"""
        if not cases:
            return self.get_default_analytics(person.id)
        
        # Calculate risk score and factors
        risk_score, risk_level, risk_factors = self.calculate_risk_score(cases)
        
        # Calculate financial metrics
        total_monetary, average_value, financial_terms = self.calculate_financial_metrics(cases)
        
        # Calculate subject matter analysis
        primary_subject, subject_categories, legal_issues = self.analyze_subject_matter(cases)
        
        # Calculate case complexity
        complexity_score = self.calculate_case_complexity(cases)
        
        # Calculate success rate
        success_rate = self.calculate_success_rate(cases)
        
        # Determine financial risk level
        financial_risk_level = self.determine_financial_risk_level(total_monetary, risk_score)
        
        return {
            'person_id': person.id,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'total_monetary_amount': total_monetary,
            'average_case_value': average_value,
            'financial_risk_level': financial_risk_level,
            'primary_subject_matter': primary_subject,
            'subject_matter_categories': subject_categories,
            'legal_issues': legal_issues,
            'financial_terms': financial_terms,
            'case_complexity_score': complexity_score,
            'success_rate': success_rate,
            'total_cases': len(cases),
            'resolved_cases': len([c for c in cases if c.status and 'resolved' in c.status.lower()]),
            'unresolved_cases': len([c for c in cases if c.status and 'pending' in c.status.lower()]),
            'favorable_cases': len([c for c in cases if c.ai_case_outcome and 'favorable' in c.ai_case_outcome.lower()]),
            'unfavorable_cases': len([c for c in cases if c.ai_case_outcome and 'unfavorable' in c.ai_case_outcome.lower()]),
            'mixed_cases': len([c for c in cases if c.ai_case_outcome and 'mixed' in c.ai_case_outcome.lower()]),
            'last_updated': datetime.utcnow(),
            'created_at': datetime.utcnow()
        }

    def calculate_risk_score(self, cases: List[ReportedCases]) -> Tuple[int, str, List[str]]:
        """Calculate risk score based on case analysis"""
        if not cases:
            return 0, "Low", []
        
        total_score = 0
        risk_factors = []
        
        for case in cases:
            case_text = f"{case.title or ''} {case.antagonist or ''} {case.protagonist or ''} {case.decision or ''}".lower()
            
            for category, data in self.risk_keywords.items():
                for keyword in data['keywords']:
                    if keyword in case_text:
                        total_score += data['weight']
                        if category not in risk_factors:
                            risk_factors.append(category)
        
        # Normalize score to 0-100
        max_possible_score = len(cases) * 10  # Assuming max weight is 10
        normalized_score = min(100, int((total_score / max_possible_score) * 100)) if max_possible_score > 0 else 0
        
        # Determine risk level
        if normalized_score >= 70:
            risk_level = "Critical"
        elif normalized_score >= 50:
            risk_level = "High"
        elif normalized_score >= 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return normalized_score, risk_level, risk_factors

    def calculate_financial_metrics(self, cases: List[ReportedCases]) -> Tuple[Decimal, Decimal, List[str]]:
        """Calculate financial metrics from cases"""
        total_amount = Decimal('0.00')
        financial_terms = []
        
        for case in cases:
            case_text = f"{case.title or ''} {case.antagonist or ''} {case.protagonist or ''} {case.decision or ''}"
            
            # Extract monetary amounts using regex
            monetary_patterns = [
                r'GHS\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                r'GH¢\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
                r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*GHS',
                r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*GH¢',
                r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*cedis',
                r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*Ghana\s*cedis'
            ]
            
            for pattern in monetary_patterns:
                matches = re.findall(pattern, case_text, re.IGNORECASE)
                for match in matches:
                    try:
                        amount_str = match.replace(',', '')
                        amount = Decimal(amount_str)
                        total_amount += amount
                    except:
                        continue
            
            # Extract financial terms
            financial_keywords = ['damages', 'compensation', 'fine', 'penalty', 'costs', 'fees', 'restitution', 'recovery']
            for keyword in financial_keywords:
                if keyword.lower() in case_text.lower():
                    if keyword not in financial_terms:
                        financial_terms.append(keyword)
        
        average_value = total_amount / len(cases) if cases else Decimal('0.00')
        return total_amount, average_value, financial_terms

    def analyze_subject_matter(self, cases: List[ReportedCases]) -> Tuple[str, List[str], List[str]]:
        """Analyze subject matter of cases"""
        category_scores = {}
        legal_issues = []
        
        for case in cases:
            case_text = f"{case.title or ''} {case.antagonist or ''} {case.protagonist or ''} {case.decision or ''}".lower()
            
            for category, keywords in self.subject_categories.items():
                score = 0
                for keyword in keywords:
                    if keyword in case_text:
                        score += 1
                
                if score > 0:
                    category_scores[category] = category_scores.get(category, 0) + score
                    
                    # Extract specific legal issues
                    if category == 'Criminal' and any(k in case_text for k in ['murder', 'theft', 'assault']):
                        legal_issues.extend(['Criminal Offense', 'Legal Violation'])
                    elif category == 'Fraud' and any(k in case_text for k in ['fraud', 'deception']):
                        legal_issues.extend(['Fraud', 'Deception'])
                    elif category == 'Contract Dispute':
                        legal_issues.extend(['Contract Breach', 'Commercial Dispute'])
        
        # Determine primary subject matter
        primary_subject = max(category_scores.items(), key=lambda x: x[1])[0] if category_scores else "General"
        
        # Get top categories
        subject_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        subject_categories = [cat[0] for cat in subject_categories]
        
        return primary_subject, subject_categories, list(set(legal_issues))

    def calculate_case_complexity(self, cases: List[ReportedCases]) -> int:
        """Calculate case complexity score"""
        if not cases:
            return 0
        
        complexity_factors = 0
        
        for case in cases:
            # Factors that increase complexity
            if case.decision and len(case.decision) > 1000:
                complexity_factors += 2
            if (case.antagonist and len(case.antagonist.split(',')) > 3) or (case.protagonist and len(case.protagonist.split(',')) > 3):
                complexity_factors += 1
            if case.title and any(word in case.title.lower() for word in ['appeal', 'supreme', 'constitutional']):
                complexity_factors += 3
            if case.court_type and 'supreme' in case.court_type.lower():
                complexity_factors += 2
        
        # Normalize to 0-100
        max_complexity = len(cases) * 5
        return min(100, int((complexity_factors / max_complexity) * 100)) if max_complexity > 0 else 0

    def calculate_success_rate(self, cases: List[ReportedCases]) -> Decimal:
        """Calculate success rate based on case outcomes"""
        if not cases:
            return Decimal('0.00')
        
        favorable_count = 0
        total_with_outcome = 0
        
        for case in cases:
            if case.ai_case_outcome:
                total_with_outcome += 1
                if 'favorable' in case.ai_case_outcome.lower() or 'success' in case.ai_case_outcome.lower():
                    favorable_count += 1
        
        if total_with_outcome == 0:
            return Decimal('0.00')
        
        return Decimal(str(round((favorable_count / total_with_outcome) * 100, 2)))

    def determine_financial_risk_level(self, total_amount: Decimal, risk_score: int) -> str:
        """Determine financial risk level based on monetary amount and risk score"""
        if total_amount > Decimal('1000000') or risk_score >= 70:
            return "Critical"
        elif total_amount > Decimal('100000') or risk_score >= 50:
            return "High"
        elif total_amount > Decimal('10000') or risk_score >= 30:
            return "Medium"
        else:
            return "Low"

    def calculate_case_statistics(self, cases: List[ReportedCases]) -> Dict[str, Any]:
        """Calculate case statistics for a person"""
        if not cases:
            return {
                'total_cases': 0,
                'resolved_cases': 0,
                'unresolved_cases': 0,
                'favorable_cases': 0,
                'unfavorable_cases': 0,
                'mixed_cases': 0,
                'case_outcome': 'N/A'
            }
        
        total_cases = len(cases)
        resolved_cases = len([c for c in cases if c.status and 'resolved' in c.status.lower()])
        unresolved_cases = total_cases - resolved_cases
        favorable_cases = len([c for c in cases if c.ai_case_outcome and 'favorable' in c.ai_case_outcome.lower()])
        unfavorable_cases = len([c for c in cases if c.ai_case_outcome and 'unfavorable' in c.ai_case_outcome.lower()])
        mixed_cases = len([c for c in cases if c.ai_case_outcome and 'mixed' in c.ai_case_outcome.lower()])
        
        # Determine overall case outcome
        if favorable_cases > unfavorable_cases and favorable_cases > mixed_cases:
            case_outcome = 'Favorable'
        elif unfavorable_cases > favorable_cases and unfavorable_cases > mixed_cases:
            case_outcome = 'Unfavorable'
        elif mixed_cases > 0:
            case_outcome = 'Mixed'
        else:
            case_outcome = 'N/A'
        
        return {
            'total_cases': total_cases,
            'resolved_cases': resolved_cases,
            'unresolved_cases': unresolved_cases,
            'favorable_cases': favorable_cases,
            'unfavorable_cases': unfavorable_cases,
            'mixed_cases': mixed_cases,
            'case_outcome': case_outcome
        }

    def save_person_analytics(self, person_id: int, analytics_data: Dict[str, Any]):
        """Save person analytics to database"""
        # Check if analytics already exist
        existing = self.db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first()
        
        if existing:
            # Update existing analytics
            for key, value in analytics_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            existing.last_updated = datetime.utcnow()
        else:
            # Create new analytics
            analytics = PersonAnalytics(**analytics_data)
            self.db.add(analytics)
        
        self.db.commit()

    def save_person_case_statistics(self, person_id: int, case_stats: Dict[str, Any]):
        """Save person case statistics to database"""
        from models.person_case_statistics import PersonCaseStatistics
        
        # Check if statistics already exist
        existing = self.db.query(PersonCaseStatistics).filter(PersonCaseStatistics.person_id == person_id).first()
        
        if existing:
            # Update existing statistics
            for key, value in case_stats.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
        else:
            # Create new statistics
            case_stats['person_id'] = person_id
            statistics = PersonCaseStatistics(**case_stats)
            self.db.add(statistics)
        
        self.db.commit()

    def update_person_basic_stats(self, person_id: int, case_stats: Dict[str, Any]):
        """Update person record with basic statistics"""
        person = self.db.query(People).filter(People.id == person_id).first()
        if person:
            person.total_cases = case_stats.get('total_cases', 0)
            person.resolved_cases = case_stats.get('resolved_cases', 0)
            person.unresolved_cases = case_stats.get('unresolved_cases', 0)
            person.favorable_cases = case_stats.get('favorable_cases', 0)
            person.unfavorable_cases = case_stats.get('unfavorable_cases', 0)
            person.mixed_cases = case_stats.get('mixed_cases', 0)
            person.case_outcome = case_stats.get('case_outcome', 'N/A')
            person.updated_at = datetime.utcnow()
            self.db.commit()

    def get_default_analytics(self, person_id: int) -> Dict[str, Any]:
        """Get default analytics for a person with no cases"""
        return {
            'person_id': person_id,
            'risk_score': 0,
            'risk_level': 'Low',
            'risk_factors': [],
            'total_monetary_amount': Decimal('0.00'),
            'average_case_value': Decimal('0.00'),
            'financial_risk_level': 'Low',
            'primary_subject_matter': 'N/A',
            'subject_matter_categories': [],
            'legal_issues': [],
            'financial_terms': [],
            'case_complexity_score': 0,
            'success_rate': Decimal('0.00'),
            'total_cases': 0,
            'resolved_cases': 0,
            'unresolved_cases': 0,
            'favorable_cases': 0,
            'unfavorable_cases': 0,
            'mixed_cases': 0,
            'last_updated': datetime.utcnow(),
            'created_at': datetime.utcnow()
        }

    def generate_analytics_for_gazette_person(self, gazette_id: int) -> Dict[str, Any]:
        """Generate analytics for a person created from gazette entry"""
        try:
            # Get gazette entry
            gazette = self.db.query(Gazette).filter(Gazette.id == gazette_id).first()
            if not gazette or not gazette.person_id:
                raise ValueError(f"Gazette {gazette_id} not found or not linked to person")
            
            # Generate analytics for the linked person
            return self.generate_analytics_for_person(gazette.person_id)
            
        except Exception as e:
            logging.error(f"Error generating analytics for gazette person {gazette_id}: {str(e)}")
            raise

    def regenerate_all_analytics(self) -> Dict[str, Any]:
        """Regenerate analytics for all people in the database"""
        try:
            people = self.db.query(People).all()
            results = {
                'total_people': len(people),
                'successful': 0,
                'failed': 0,
                'errors': []
            }
            
            for person in people:
                try:
                    self.generate_analytics_for_person(person.id)
                    results['successful'] += 1
                except Exception as e:
                    results['failed'] += 1
                    results['errors'].append(f"Person {person.id}: {str(e)}")
            
            logging.info(f"Regenerated analytics for {results['successful']} people, {results['failed']} failed")
            return results
            
        except Exception as e:
            logging.error(f"Error regenerating all analytics: {str(e)}")
            raise
