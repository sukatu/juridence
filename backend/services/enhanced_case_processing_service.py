import os
import openai
import re
from typing import Dict, List, Any, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from datetime import datetime
from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from models.companies import Companies
from models.reported_cases import ReportedCases
from models.person_analytics import PersonAnalytics
from models.bank_analytics import BankAnalytics
from models.insurance_analytics import InsuranceAnalytics
from models.company_analytics import CompanyAnalytics
from models.case_metadata import CaseMetadata, CaseSearchIndex
from services.person_analytics_service import PersonAnalyticsService
from services.bank_analytics_service import BankAnalyticsService
from services.ai_service import AIService
import json

class EnhancedCaseProcessingService:
    def __init__(self, db: Session):
        self.db = db
        self.person_analytics = PersonAnalyticsService(db)
        self.bank_analytics = BankAnalyticsService(db)
        self.ai_service = AIService()
        
        # Entity recognition patterns
        self.person_patterns = [
            r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Justice|Judge|Esq\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*',
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:v\.|vs\.|and|&)',
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:for|representing)',
            r'\b(?:Plaintiff|Defendant|Appellant|Respondent|Petitioner|Applicant)\s*:?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*'
        ]
        
        self.bank_patterns = [
            r'\b(?:Bank|Banking|Financial|Credit|Union|Savings|Trust|Investment|Merchant|Commercial)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*',
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Bank|Banking|Financial|Credit|Union|Savings|Trust)',
            r'\b(?:Ghana|Ghanaian|National|International|Universal|Standard|First|Second|Third|Fourth|Fifth)\s+(?:Bank|Banking|Financial|Credit|Union)'
        ]
        
        self.insurance_patterns = [
            r'\b(?:Insurance|Assurance|Life|General|Health|Motor|Property|Fire|Marine|Aviation)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*',
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Insurance|Assurance|Life|General|Health|Motor|Property)',
            r'\b(?:Ghana|Ghanaian|National|International|Universal|Standard|First|Second|Third|Fourth|Fifth)\s+(?:Insurance|Assurance)'
        ]
        
        self.company_patterns = [
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Ltd|Limited|Inc|Incorporated|Corp|Corporation|Co|Company|Ghana|Group|Holdings|Enterprises|Industries|Services|Trading|International|Global)',
            r'\b(?:Ghana|Ghanaian|National|International|Universal|Standard|First|Second|Third|Fourth|Fifth)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Ltd|Limited|Inc|Incorporated|Corp|Corporation|Co|Company)'
        ]

    def process_case_with_analytics(self, case_id: int) -> Dict[str, Any]:
        """Process case with comprehensive analytics and entity extraction"""
        try:
            # Get the case
            case = self.db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
            if not case:
                return {"error": "Case not found"}
            
            # Extract entities from case content
            entities = self._extract_entities_from_case(case)
            
            # Process people entities with analytics
            people_processed = self._process_people_with_analytics(entities.get('people', []), case_id)
            
            # Process bank entities with analytics
            banks_processed = self._process_banks_with_analytics(entities.get('banks', []), case_id)
            
            # Process insurance entities with analytics
            insurance_processed = self._process_insurance_with_analytics(entities.get('insurance', []), case_id)
            
            # Process company entities with analytics
            companies_processed = self._process_companies_with_analytics(entities.get('companies', []), case_id)
            
            # Generate AI case analysis
            ai_analysis = self._generate_ai_case_analysis(case)
            
            # Update case with AI analysis
            case.ai_case_outcome = ai_analysis.get('ai_case_outcome', '')
            case.ai_court_orders = ai_analysis.get('ai_court_orders', '')
            case.ai_financial_impact = ai_analysis.get('ai_financial_impact', '')
            case.ai_detailed_outcome = ai_analysis.get('ai_detailed_outcome', '')
            case.ai_summary_generated_at = datetime.now()
            case.ai_summary_version = "2.0"
            
            # Create or update case metadata
            self._create_case_metadata(case_id, case, entities, ai_analysis)
            
            # Create search index
            self._create_search_index(case_id, case, entities)
            
            self.db.commit()
            
            return {
                "success": True,
                "case_id": case_id,
                "ai_analysis_generated": True,
                "people_processed": people_processed,
                "banks_processed": banks_processed,
                "insurance_processed": insurance_processed,
                "companies_processed": companies_processed,
                "metadata_created": True,
                "search_index_created": True
            }
            
        except Exception as e:
            self.db.rollback()
            return {"error": f"Error processing case: {str(e)}"}

    def _extract_entities_from_case(self, case: ReportedCases) -> Dict[str, List[str]]:
        """Extract entities from case content using pattern matching and AI"""
        # Combine all case text
        case_text = f"""
        {case.title or ''}
        {case.protagonist or ''}
        {case.antagonist or ''}
        {case.lawyers or ''}
        {case.presiding_judge or ''}
        {case.judgement_by or ''}
        {case.opinion_by or ''}
        {case.case_summary or ''}
        {case.commentary or ''}
        {case.headnotes or ''}
        """
        
        # Extract people using patterns
        people = self._extract_people_from_text(case_text)
        
        # Extract banks using patterns
        banks = self._extract_banks_from_text(case_text)
        
        # Extract insurance using patterns
        insurance = self._extract_insurance_from_text(case_text)
        
        # Extract companies using patterns
        companies = self._extract_companies_from_text(case_text)
        
        # Use AI for additional entity extraction
        ai_entities = self.ai_service.extract_entities_from_case({
            'title': case.title,
            'protagonist': case.protagonist,
            'antagonist': case.antagonist,
            'lawyers': case.lawyers,
            'presiding_judge': case.presiding_judge,
            'case_summary': case.case_summary
        })
        
        # Combine pattern-based and AI-based extraction
        all_people = list(set(people + ai_entities.get('people', [])))
        all_banks = list(set(banks + ai_entities.get('banks', [])))
        all_insurance = list(set(insurance + ai_entities.get('insurance', [])))
        all_companies = list(set(companies + ai_entities.get('companies', [])))
        
        return {
            'people': all_people,
            'banks': all_banks,
            'insurance': all_insurance,
            'companies': all_companies
        }

    def _extract_people_from_text(self, text: str) -> List[str]:
        """Extract people names from text using regex patterns"""
        people = []
        for pattern in self.person_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up the match
                name = re.sub(r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Justice|Judge|Esq\.|for|representing|Plaintiff|Defendant|Appellant|Respondent|Petitioner|Applicant)\s*:?\s*', '', match, flags=re.IGNORECASE)
                name = re.sub(r'\s+(?:v\.|vs\.|and|&)\s+.*', '', name)
                name = name.strip()
                if len(name) > 2 and name not in people:
                    people.append(name)
        return people

    def _extract_banks_from_text(self, text: str) -> List[str]:
        """Extract bank names from text using regex patterns"""
        banks = []
        for pattern in self.bank_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.strip()
                if len(name) > 2 and name not in banks:
                    banks.append(name)
        return banks

    def _extract_insurance_from_text(self, text: str) -> List[str]:
        """Extract insurance company names from text using regex patterns"""
        insurance = []
        for pattern in self.insurance_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.strip()
                if len(name) > 2 and name not in insurance:
                    insurance.append(name)
        return insurance

    def _extract_companies_from_text(self, text: str) -> List[str]:
        """Extract company names from text using regex patterns"""
        companies = []
        for pattern in self.company_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.strip()
                if len(name) > 2 and name not in companies:
                    companies.append(name)
        return companies

    def _process_people_with_analytics(self, people_names: List[str], case_id: int) -> int:
        """Process people entities with risk assessment and analytics"""
        processed_count = 0
        
        for name in people_names:
            if not name or len(name.strip()) < 2:
                continue
                
            # Check if person already exists
            person = self.db.query(People).filter(People.full_name.ilike(f"%{str(name).strip()}%")).first()
            
            if not person:
                # Create new person
                person = People(
                    first_name=name.strip().split()[0] if name.strip().split() else name.strip(),
                    last_name=name.strip().split()[-1] if len(name.strip().split()) > 1 else "",
                    full_name=name.strip(),
                    case_count=1,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                self.db.add(person)
                self.db.flush()
            
            # Get all cases for this person
            person_cases = self.db.query(ReportedCases).filter(
                ReportedCases.protagonist.ilike(f"%{str(person.full_name)}%")
                | ReportedCases.antagonist.ilike(f"%{str(person.full_name)}%")
                | ReportedCases.lawyers.ilike(f"%{str(person.full_name)}%")
                | ReportedCases.presiding_judge.ilike(f"%{str(person.full_name)}%")
            ).all()
            
            # Calculate risk assessment
            risk_score, risk_level, risk_factors = self.person_analytics.calculate_risk_score(person_cases)
            
            # Calculate basic analytics
            analytics = self._calculate_basic_analytics(person_cases)
            
            # Update person with analytics
            person.risk_score = risk_score
            person.risk_level = risk_level
            person.case_count = len(person_cases)
            person.updated_at = datetime.now()
            
            # Create or update person analytics
            person_analytics = self.db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person.id).first()
            if not person_analytics:
                person_analytics = PersonAnalytics(
                    person_id=person.id,
                    total_cases=analytics['total_cases'],
                    resolved_cases=analytics['resolved_cases'],
                    unresolved_cases=analytics['unresolved_cases'],
                    favorable_cases=analytics['favorable_cases'],
                    unfavorable_cases=analytics['unfavorable_cases'],
                    mixed_cases=analytics['mixed_cases'],
                    case_outcome=analytics['case_outcome'],
                    risk_score=risk_score,
                    risk_level=risk_level,
                    risk_factors=json.dumps(risk_factors),
                    subject_matter_areas=json.dumps(analytics['subject_matter_areas']),
                    monetary_involvement=analytics['monetary_involvement'],
                    last_updated=datetime.now()
                )
                self.db.add(person_analytics)
            else:
                person_analytics.total_cases = analytics['total_cases']
                person_analytics.resolved_cases = analytics['resolved_cases']
                person_analytics.unresolved_cases = analytics['unresolved_cases']
                person_analytics.favorable_cases = analytics['favorable_cases']
                person_analytics.unfavorable_cases = analytics['unfavorable_cases']
                person_analytics.mixed_cases = analytics['mixed_cases']
                person_analytics.case_outcome = analytics['case_outcome']
                person_analytics.risk_score = risk_score
                person_analytics.risk_level = risk_level
                person_analytics.risk_factors = json.dumps(risk_factors)
                person_analytics.subject_matter_areas = json.dumps(analytics['subject_matter_areas'])
                person_analytics.monetary_involvement = analytics['monetary_involvement']
                person_analytics.last_updated = datetime.now()
            
            processed_count += 1
        
        return processed_count

    def _process_banks_with_analytics(self, bank_names: List[str], case_id: int) -> int:
        """Process bank entities with risk assessment and analytics"""
        processed_count = 0
        
        for name in bank_names:
            if not name or len(name.strip()) < 2:
                continue
                
            # Check if bank already exists
            bank = self.db.query(Banks).filter(Banks.name.ilike(f"%{str(name).strip()}%")).first()
            
            if not bank:
                # Create new bank
                bank = Banks(
                    name=name.strip(),
                    case_count=1,
                    first_case_date=datetime.now(),
                    last_case_date=datetime.now(),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                self.db.add(bank)
                self.db.flush()
            
            # Get all cases for this bank
            bank_cases = self.db.query(ReportedCases).filter(
                ReportedCases.title.ilike(f"%{str(bank.name)}%")
                | ReportedCases.case_summary.ilike(f"%{str(bank.name)}%")
                | ReportedCases.commentary.ilike(f"%{str(bank.name)}%")
            ).all()
            
            # Calculate risk assessment
            risk_score, risk_level, risk_factors = self.bank_analytics.calculate_risk_score(bank_cases)
            
            # Calculate basic analytics
            analytics = self._calculate_basic_analytics(bank_cases)
            
            # Update bank with analytics
            bank.risk_score = risk_score
            bank.risk_level = risk_level
            bank.case_count = len(bank_cases)
            bank.last_case_date = datetime.now()
            bank.updated_at = datetime.now()
            
            # Create or update bank analytics
            bank_analytics = self.db.query(BankAnalytics).filter(BankAnalytics.bank_id == bank.id).first()
            if not bank_analytics:
                bank_analytics = BankAnalytics(
                    bank_id=bank.id,
                    total_cases=analytics['total_cases'],
                    resolved_cases=analytics['resolved_cases'],
                    unresolved_cases=analytics['unresolved_cases'],
                    favorable_cases=analytics['favorable_cases'],
                    unfavorable_cases=analytics['unfavorable_cases'],
                    mixed_cases=analytics['mixed_cases'],
                    case_outcome=analytics['case_outcome'],
                    risk_score=risk_score,
                    risk_level=risk_level,
                    risk_factors=json.dumps(risk_factors),
                    subject_matter_areas=json.dumps(analytics['subject_matter_areas']),
                    monetary_involvement=analytics['monetary_involvement'],
                    last_updated=datetime.now()
                )
                self.db.add(bank_analytics)
            else:
                bank_analytics.total_cases = analytics['total_cases']
                bank_analytics.resolved_cases = analytics['resolved_cases']
                bank_analytics.unresolved_cases = analytics['unresolved_cases']
                bank_analytics.favorable_cases = analytics['favorable_cases']
                bank_analytics.unfavorable_cases = analytics['unfavorable_cases']
                bank_analytics.mixed_cases = analytics['mixed_cases']
                bank_analytics.case_outcome = analytics['case_outcome']
                bank_analytics.risk_score = risk_score
                bank_analytics.risk_level = risk_level
                bank_analytics.risk_factors = json.dumps(risk_factors)
                bank_analytics.subject_matter_areas = json.dumps(analytics['subject_matter_areas'])
                bank_analytics.monetary_involvement = analytics['monetary_involvement']
                bank_analytics.last_updated = datetime.now()
            
            processed_count += 1
        
        return processed_count

    def _process_insurance_with_analytics(self, insurance_names: List[str], case_id: int) -> int:
        """Process insurance entities with risk assessment and analytics"""
        processed_count = 0
        
        for name in insurance_names:
            if not name or len(name.strip()) < 2:
                continue
                
            # Check if insurance company already exists
            insurance = self.db.query(Insurance).filter(Insurance.name.ilike(f"%{str(name).strip()}%")).first()
            
            if not insurance:
                # Create new insurance company
                insurance = Insurance(
                    name=name.strip(),
                    case_count=1,
                    first_case_date=datetime.now(),
                    last_case_date=datetime.now(),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                self.db.add(insurance)
                self.db.flush()
            
            # Get all cases for this insurance company
            insurance_cases = self.db.query(ReportedCases).filter(
                ReportedCases.title.ilike(f"%{str(insurance.name)}%")
                | ReportedCases.case_summary.ilike(f"%{str(insurance.name)}%")
                | ReportedCases.commentary.ilike(f"%{str(insurance.name)}%")
            ).all()
            
            # Calculate risk assessment
            risk_score, risk_level, risk_factors = self.bank_analytics.calculate_risk_score(insurance_cases)  # Reuse bank analytics logic
            
            # Calculate basic analytics
            analytics = self._calculate_basic_analytics(insurance_cases)
            
            # Update insurance with analytics
            insurance.risk_score = risk_score
            insurance.risk_level = risk_level
            insurance.case_count = len(insurance_cases)
            insurance.last_case_date = datetime.now()
            insurance.updated_at = datetime.now()
            
            # Create or update insurance analytics
            insurance_analytics = self.db.query(InsuranceAnalytics).filter(InsuranceAnalytics.insurance_id == insurance.id).first()
            if not insurance_analytics:
                insurance_analytics = InsuranceAnalytics(
                    insurance_id=insurance.id,
                    total_cases=analytics['total_cases'],
                    resolved_cases=analytics['resolved_cases'],
                    unresolved_cases=analytics['unresolved_cases'],
                    favorable_cases=analytics['favorable_cases'],
                    unfavorable_cases=analytics['unfavorable_cases'],
                    mixed_cases=analytics['mixed_cases'],
                    case_outcome=analytics['case_outcome'],
                    risk_score=risk_score,
                    risk_level=risk_level,
                    risk_factors=json.dumps(risk_factors),
                    subject_matter_areas=json.dumps(analytics['subject_matter_areas']),
                    monetary_involvement=analytics['monetary_involvement'],
                    last_updated=datetime.now()
                )
                self.db.add(insurance_analytics)
            else:
                insurance_analytics.total_cases = analytics['total_cases']
                insurance_analytics.resolved_cases = analytics['resolved_cases']
                insurance_analytics.unresolved_cases = analytics['unresolved_cases']
                insurance_analytics.favorable_cases = analytics['favorable_cases']
                insurance_analytics.unfavorable_cases = analytics['unfavorable_cases']
                insurance_analytics.mixed_cases = analytics['mixed_cases']
                insurance_analytics.case_outcome = analytics['case_outcome']
                insurance_analytics.risk_score = risk_score
                insurance_analytics.risk_level = risk_level
                insurance_analytics.risk_factors = json.dumps(risk_factors)
                insurance_analytics.subject_matter_areas = json.dumps(analytics['subject_matter_areas'])
                insurance_analytics.monetary_involvement = analytics['monetary_involvement']
                insurance_analytics.last_updated = datetime.now()
            
            processed_count += 1
        
        return processed_count

    def _process_companies_with_analytics(self, company_names: List[str], case_id: int) -> int:
        """Process company entities with risk assessment and analytics"""
        processed_count = 0
        
        for name in company_names:
            if not name or len(name.strip()) < 2:
                continue
                
            # Check if company already exists
            company = self.db.query(Companies).filter(Companies.name.ilike(f"%{str(name).strip()}%")).first()
            
            if not company:
                # Create new company
                company = Companies(
                    name=name.strip(),
                    case_count=1,
                    first_case_date=datetime.now(),
                    last_case_date=datetime.now(),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                self.db.add(company)
                self.db.flush()
            
            # Get all cases for this company
            company_cases = self.db.query(ReportedCases).filter(
                ReportedCases.title.ilike(f"%{str(company.name)}%")
                | ReportedCases.case_summary.ilike(f"%{str(company.name)}%")
                | ReportedCases.commentary.ilike(f"%{str(company.name)}%")
            ).all()
            
            # Calculate risk assessment
            risk_score, risk_level, risk_factors = self.bank_analytics.calculate_risk_score(company_cases)  # Reuse bank analytics logic
            
            # Calculate basic analytics
            analytics = self._calculate_basic_analytics(company_cases)
            
            # Update company with analytics
            company.risk_score = risk_score
            company.risk_level = risk_level
            company.case_count = len(company_cases)
            company.last_case_date = datetime.now()
            company.updated_at = datetime.now()
            
            # Create or update company analytics
            company_analytics = self.db.query(CompanyAnalytics).filter(CompanyAnalytics.company_id == company.id).first()
            if not company_analytics:
                company_analytics = CompanyAnalytics(
                    company_id=company.id,
                    total_cases=analytics['total_cases'],
                    resolved_cases=analytics['resolved_cases'],
                    unresolved_cases=analytics['unresolved_cases'],
                    favorable_cases=analytics['favorable_cases'],
                    unfavorable_cases=analytics['unfavorable_cases'],
                    mixed_cases=analytics['mixed_cases'],
                    case_outcome=analytics['case_outcome'],
                    risk_score=risk_score,
                    risk_level=risk_level,
                    risk_factors=json.dumps(risk_factors),
                    subject_matter_areas=json.dumps(analytics['subject_matter_areas']),
                    monetary_involvement=analytics['monetary_involvement'],
                    last_updated=datetime.now()
                )
                self.db.add(company_analytics)
            else:
                company_analytics.total_cases = analytics['total_cases']
                company_analytics.resolved_cases = analytics['resolved_cases']
                company_analytics.unresolved_cases = analytics['unresolved_cases']
                company_analytics.favorable_cases = analytics['favorable_cases']
                company_analytics.unfavorable_cases = analytics['unfavorable_cases']
                company_analytics.mixed_cases = analytics['mixed_cases']
                company_analytics.case_outcome = analytics['case_outcome']
                company_analytics.risk_score = risk_score
                company_analytics.risk_level = risk_level
                company_analytics.risk_factors = json.dumps(risk_factors)
                company_analytics.subject_matter_areas = json.dumps(analytics['subject_matter_areas'])
                company_analytics.monetary_involvement = analytics['monetary_involvement']
                company_analytics.last_updated = datetime.now()
            
            processed_count += 1
        
        return processed_count

    def _generate_ai_case_analysis(self, case: ReportedCases) -> Dict[str, str]:
        """Generate AI-powered case analysis"""
        case_data = {
            'title': case.title,
            'suit_reference_number': case.suit_reference_number,
            'protagonist': case.protagonist,
            'antagonist': case.antagonist,
            'lawyers': case.lawyers,
            'presiding_judge': case.presiding_judge,
            'case_summary': case.case_summary,
            'area_of_law': case.area_of_law,
            'court_type': case.court_type,
            'region': case.region,
            'year': case.year,
            'judgement': case.judgement
        }
        
        return self.ai_service.generate_case_summary(case_data)

    def _create_case_metadata(self, case_id: int, case: ReportedCases, entities: Dict[str, List[str]], ai_analysis: Dict[str, str]) -> None:
        """Create or update case metadata"""
        case_metadata = self.db.query(CaseMetadata).filter(CaseMetadata.case_id == case_id).first()
        
        if not case_metadata:
            case_metadata = CaseMetadata(
                case_id=case_id,
                case_summary=case.case_summary,
                area_of_law=case.area_of_law,
                keywords=case.keywords_phrases.split(', ') if case.keywords_phrases else [],
                related_people=entities.get('people', []),
                organizations=entities.get('companies', []),
                banks_involved=entities.get('banks', []),
                insurance_involved=entities.get('insurance', []),
                protagonist=case.protagonist,
                antagonist=case.antagonist,
                judges=[case.presiding_judge] if case.presiding_judge else [],
                lawyers=[case.lawyers] if case.lawyers else [],
                court_type=case.court_type,
                is_processed=True,
                processed_at=datetime.now()
            )
            self.db.add(case_metadata)
        else:
            case_metadata.case_summary = case.case_summary
            case_metadata.area_of_law = case.area_of_law
            case_metadata.keywords = case.keywords_phrases.split(', ') if case.keywords_phrases else []
            case_metadata.related_people = entities.get('people', [])
            case_metadata.organizations = entities.get('companies', [])
            case_metadata.banks_involved = entities.get('banks', [])
            case_metadata.insurance_involved = entities.get('insurance', [])
            case_metadata.protagonist = case.protagonist
            case_metadata.antagonist = case.antagonist
            case_metadata.judges = [case.presiding_judge] if case.presiding_judge else []
            case_metadata.lawyers = [case.lawyers] if case.lawyers else []
            case_metadata.court_type = case.court_type
            case_metadata.is_processed = True
            case_metadata.processed_at = datetime.now()
            case_metadata.updated_at = datetime.now()

    def _create_search_index(self, case_id: int, case: ReportedCases, entities: Dict[str, List[str]]) -> None:
        """Create or update search index"""
        search_index = self.db.query(CaseSearchIndex).filter(CaseSearchIndex.case_id == case_id).first()
        
        searchable_text = f"{case.title or ''} {case.case_summary or ''} {case.protagonist or ''} {case.antagonist or ''} {case.lawyers or ''} {case.presiding_judge or ''}"
        
        if not search_index:
            search_index = CaseSearchIndex(
                case_id=case_id,
                searchable_text=searchable_text,
                person_names=entities.get('people', []),
                organization_names=entities.get('companies', []) + entities.get('banks', []) + entities.get('insurance', []),
                keywords=case.keywords_phrases.split(', ') if case.keywords_phrases else [],
                word_count=len(searchable_text.split()),
                last_indexed=datetime.now()
            )
            self.db.add(search_index)
        else:
            search_index.searchable_text = searchable_text
            search_index.person_names = entities.get('people', [])
            search_index.organization_names = entities.get('companies', []) + entities.get('banks', []) + entities.get('insurance', [])
            search_index.keywords = case.keywords_phrases.split(', ') if case.keywords_phrases else []
            search_index.word_count = len(searchable_text.split())
            search_index.last_indexed = datetime.now()

    def _calculate_basic_analytics(self, cases: List[ReportedCases]) -> Dict[str, Any]:
        """Calculate basic analytics for cases"""
        if not cases:
            return {
                'total_cases': 0,
                'resolved_cases': 0,
                'unresolved_cases': 0,
                'favorable_cases': 0,
                'unfavorable_cases': 0,
                'mixed_cases': 0,
                'case_outcome': 'N/A',
                'subject_matter_areas': [],
                'monetary_involvement': 0.0
            }
        
        total_cases = len(cases)
        resolved_cases = sum(1 for case in cases if case.status == 0)  # Assuming 0 = closed/resolved
        unresolved_cases = total_cases - resolved_cases
        
        # Basic outcome analysis
        favorable_cases = sum(1 for case in cases if case.decision and 'favorable' in str(case.decision).lower())
        unfavorable_cases = sum(1 for case in cases if case.decision and 'unfavorable' in str(case.decision).lower())
        mixed_cases = total_cases - favorable_cases - unfavorable_cases
        
        # Determine overall case outcome
        if favorable_cases > unfavorable_cases:
            case_outcome = 'Favorable'
        elif unfavorable_cases > favorable_cases:
            case_outcome = 'Unfavorable'
        else:
            case_outcome = 'Mixed'
        
        # Extract subject matter areas
        subject_areas = []
        for case in cases:
            if case.area_of_law:
                subject_areas.append(case.area_of_law)
        
        # Calculate monetary involvement (simplified)
        monetary_involvement = 0.0
        for case in cases:
            # Extract monetary amounts from case text if available
            case_text = f"{case.title or ''} {case.case_summary or ''} {case.commentary or ''}"
            # Simple regex to find monetary amounts
            import re
            amounts = re.findall(r'[\$₵]?[\d,]+(?:\.\d{2})?', case_text)
            for amount in amounts:
                try:
                    clean_amount = re.sub(r'[^\d.]', '', amount)
                    if clean_amount:
                        monetary_involvement += float(clean_amount)
                except:
                    continue
        
        return {
            'total_cases': total_cases,
            'resolved_cases': resolved_cases,
            'unresolved_cases': unresolved_cases,
            'favorable_cases': favorable_cases,
            'unfavorable_cases': unfavorable_cases,
            'mixed_cases': mixed_cases,
            'case_outcome': case_outcome,
            'subject_matter_areas': list(set(subject_areas)),
            'monetary_involvement': monetary_involvement
        }
