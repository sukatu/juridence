#!/usr/bin/env python3
"""
Company Analytics Service
Handles analytics and case statistics generation for companies.
"""

from sqlalchemy.orm import Session
from models.company_analytics import CompanyAnalytics
from models.company_case_statistics import CompanyCaseStatistics
from models.companies import Companies
from models.reported_cases import ReportedCases
from sqlalchemy import or_, and_, func
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CompanyAnalyticsService:
    """Service for generating company analytics and case statistics."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_company_analytics(self, company_id: int) -> Optional[CompanyAnalytics]:
        """Generate analytics for a specific company."""
        try:
            # Get company
            company = self.db.query(Companies).filter(Companies.id == company_id).first()
            if not company:
                logger.error(f"Company with ID {company_id} not found")
                return None
            
            # Get cases related to this company
            cases = self._get_company_cases(company)
            
            if not cases:
                logger.info(f"No cases found for company {company.name}")
                return None
            
            # Calculate analytics
            analytics_data = self._calculate_analytics(cases, company)
            
            # Create or update analytics record
            analytics = self.db.query(CompanyAnalytics).filter(
                CompanyAnalytics.company_id == company_id
            ).first()
            
            if analytics:
                # Update existing record
                for key, value in analytics_data.items():
                    setattr(analytics, key, value)
            else:
                # Create new record
                analytics = CompanyAnalytics(
                    company_id=company_id,
                    **analytics_data
                )
                self.db.add(analytics)
            
            self.db.commit()
            self.db.refresh(analytics)
            
            logger.info(f"Generated analytics for company {company.name}")
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating analytics for company {company_id}: {e}")
            self.db.rollback()
            return None
    
    def generate_company_case_statistics(self, company_id: int) -> Optional[CompanyCaseStatistics]:
        """Generate case statistics for a specific company."""
        try:
            # Get company
            company = self.db.query(Companies).filter(Companies.id == company_id).first()
            if not company:
                logger.error(f"Company with ID {company_id} not found")
                return None
            
            # Get cases related to this company
            cases = self._get_company_cases(company)
            
            if not cases:
                logger.info(f"No cases found for company {company.name}")
                return None
            
            # Calculate statistics
            stats_data = self._calculate_case_statistics(cases)
            
            # Create or update statistics record
            stats = self.db.query(CompanyCaseStatistics).filter(
                CompanyCaseStatistics.company_id == company_id
            ).first()
            
            if stats:
                # Update existing record
                for key, value in stats_data.items():
                    setattr(stats, key, value)
            else:
                # Create new record
                stats = CompanyCaseStatistics(
                    company_id=company_id,
                    **stats_data
                )
                self.db.add(stats)
            
            self.db.commit()
            self.db.refresh(stats)
            
            logger.info(f"Generated case statistics for company {company.name}")
            return stats
            
        except Exception as e:
            logger.error(f"Error generating case statistics for company {company_id}: {e}")
            self.db.rollback()
            return None
    
    def _get_company_cases(self, company: Companies) -> List[ReportedCases]:
        """Get cases related to a specific company."""
        try:
            # Search for cases where the company name appears in title, protagonist, or antagonist
            company_name = company.name.lower()
            short_name = company.short_name.lower() if company.short_name else ""
            
            # Create search terms
            search_terms = [company_name]
            if short_name and short_name != company_name:
                search_terms.append(short_name)
            
            # Build search conditions
            conditions = []
            for term in search_terms:
                conditions.extend([
                    func.lower(ReportedCases.title).like(f"%{term}%"),
                    func.lower(ReportedCases.protagonist).like(f"%{term}%"),
                    func.lower(ReportedCases.antagonist).like(f"%{term}%")
                ])
            
            cases = self.db.query(ReportedCases).filter(
                or_(*conditions)
            ).all()
            
            return cases
            
        except Exception as e:
            logger.error(f"Error getting cases for company {company.name}: {e}")
            return []
    
    def _calculate_analytics(self, cases: List[ReportedCases], company: Companies) -> Dict[str, Any]:
        """Calculate analytics from cases."""
        try:
            # Risk keywords for companies
            risk_keywords = [
                'fraud', 'embezzlement', 'corruption', 'bribery', 'money_laundering',
                'tax_evasion', 'insider_trading', 'securities_fraud', 'accounting_fraud',
                'contract_breach', 'intellectual_property', 'patent_infringement',
                'trademark_violation', 'copyright_infringement', 'antitrust',
                'monopoly', 'price_fixing', 'market_manipulation', 'regulatory_violation',
                'environmental_violation', 'safety_violation', 'labor_violation',
                'discrimination', 'harassment', 'wrongful_termination', 'breach_of_fiduciary',
                'negligence', 'malpractice', 'product_liability', 'consumer_protection',
                'data_breach', 'privacy_violation', 'cyber_security', 'compliance_failure'
            ]
            
            # Subject matter categories for companies
            subject_categories = [
                'Corporate Law', 'Commercial Law', 'Contract Disputes', 'Employment Law',
                'Intellectual Property', 'Securities Law', 'Tax Law', 'Environmental Law',
                'Consumer Protection', 'Antitrust Law', 'Regulatory Compliance',
                'Product Liability', 'Data Protection', 'Corporate Governance',
                'Mergers & Acquisitions', 'Bankruptcy', 'Insolvency', 'Restructuring'
            ]
            
            # Calculate risk score
            risk_score = 0
            risk_factors = []
            
            for case in cases:
                case_text = f"{case.title or ''} {case.case_summary or ''}".lower()
                
                for keyword in risk_keywords:
                    if keyword in case_text:
                        risk_score += 2
                        if keyword not in risk_factors:
                            risk_factors.append(keyword)
            
            # Determine risk level
            if risk_score >= 50:
                risk_level = 'Critical'
            elif risk_score >= 30:
                risk_level = 'High'
            elif risk_score >= 15:
                risk_level = 'Medium'
            else:
                risk_level = 'Low'
            
            # Calculate financial impact
            total_monetary = sum(
                float(case.monetary_amount or 0) for case in cases 
                if case.monetary_amount
            )
            average_case_value = total_monetary / len(cases) if cases else 0
            
            # Determine financial risk level
            if total_monetary >= 1000000:
                financial_risk_level = 'Critical'
            elif total_monetary >= 500000:
                financial_risk_level = 'High'
            elif total_monetary >= 100000:
                financial_risk_level = 'Medium'
            else:
                financial_risk_level = 'Low'
            
            # Analyze subject matter
            subject_matter_counts = {}
            for case in cases:
                case_text = f"{case.title or ''} {case.case_summary or ''}".lower()
                for category in subject_categories:
                    if any(term.lower() in case_text for term in category.split()):
                        subject_matter_counts[category] = subject_matter_counts.get(category, 0) + 1
            
            primary_subject_matter = max(subject_matter_counts, key=subject_matter_counts.get) if subject_matter_counts else "General Corporate"
            
            # Calculate success rate
            favorable_cases = sum(1 for case in cases if case.ai_case_outcome and 'favorable' in case.ai_case_outcome.lower())
            success_rate = (favorable_cases / len(cases)) * 100 if cases else 0
            
            # Calculate case complexity
            complexity_score = 0
            for case in cases:
                if case.case_summary and len(case.case_summary) > 1000:
                    complexity_score += 1
                if case.lawyers and len(case.lawyers) > 2:
                    complexity_score += 1
                if case.presiding_judge and len(case.presiding_judge) > 50:
                    complexity_score += 1
            
            case_complexity_score = min(complexity_score, 100)
            
            # Company-specific metrics
            company_metrics = self._calculate_company_specific_metrics(cases, company)
            
            return {
                'risk_score': min(risk_score, 100),
                'risk_level': risk_level,
                'risk_factors': risk_factors[:10],  # Top 10 risk factors
                'total_monetary_amount': total_monetary,
                'average_case_value': average_case_value,
                'financial_risk_level': financial_risk_level,
                'primary_subject_matter': primary_subject_matter,
                'subject_matter_categories': list(subject_matter_counts.keys())[:10],
                'legal_issues': risk_factors[:15],  # Top 15 legal issues
                'financial_terms': self._extract_financial_terms(cases),
                'regulatory_compliance_score': company_metrics['regulatory_compliance_score'],
                'customer_dispute_rate': company_metrics['customer_dispute_rate'],
                'operational_risk_score': company_metrics['operational_risk_score'],
                'business_continuity_score': company_metrics['business_continuity_score'],
                'market_risk_score': company_metrics['market_risk_score'],
                'credit_risk_score': company_metrics['credit_risk_score'],
                'reputation_risk_score': company_metrics['reputation_risk_score'],
                'case_complexity_score': case_complexity_score,
                'success_rate': success_rate
            }
            
        except Exception as e:
            logger.error(f"Error calculating analytics: {e}")
            return {}
    
    def _calculate_company_specific_metrics(self, cases: List[ReportedCases], company: Companies) -> Dict[str, Any]:
        """Calculate company-specific metrics."""
        try:
            # Regulatory compliance score (based on regulatory cases)
            regulatory_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['regulatory', 'compliance', 'violation', 'breach'])]
            regulatory_compliance_score = max(0, 100 - (len(regulatory_cases) * 10))
            
            # Customer dispute rate (based on customer-related cases)
            customer_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['customer', 'consumer', 'client', 'dispute'])]
            customer_dispute_rate = (len(customer_cases) / len(cases)) * 100 if cases else 0
            
            # Operational risk score (based on operational cases)
            operational_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['operational', 'management', 'administration', 'process'])]
            operational_risk_score = min(100, len(operational_cases) * 15)
            
            # Business continuity score (based on continuity-related cases)
            continuity_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['continuity', 'disruption', 'interruption', 'suspension'])]
            business_continuity_score = max(0, 100 - (len(continuity_cases) * 20))
            
            # Market risk score (based on market-related cases)
            market_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['market', 'competition', 'antitrust', 'monopoly'])]
            market_risk_score = min(100, len(market_cases) * 12)
            
            # Credit risk score (based on credit-related cases)
            credit_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['credit', 'debt', 'loan', 'default', 'bankruptcy'])]
            credit_risk_score = min(100, len(credit_cases) * 18)
            
            # Reputation risk score (based on reputation-related cases)
            reputation_cases = [case for case in cases if any(term in (case.title or '').lower() 
                            for term in ['reputation', 'defamation', 'libel', 'slander', 'publicity'])]
            reputation_risk_score = min(100, len(reputation_cases) * 25)
            
            return {
                'regulatory_compliance_score': regulatory_compliance_score,
                'customer_dispute_rate': customer_dispute_rate,
                'operational_risk_score': operational_risk_score,
                'business_continuity_score': business_continuity_score,
                'market_risk_score': market_risk_score,
                'credit_risk_score': credit_risk_score,
                'reputation_risk_score': reputation_risk_score
            }
            
        except Exception as e:
            logger.error(f"Error calculating company-specific metrics: {e}")
            return {
                'regulatory_compliance_score': 0,
                'customer_dispute_rate': 0,
                'operational_risk_score': 0,
                'business_continuity_score': 0,
                'market_risk_score': 0,
                'credit_risk_score': 0,
                'reputation_risk_score': 0
            }
    
    def _extract_financial_terms(self, cases: List[ReportedCases]) -> List[str]:
        """Extract financial terms from cases."""
        financial_terms = []
        for case in cases:
            case_text = f"{case.title or ''} {case.case_summary or ''}".lower()
            terms = ['damages', 'compensation', 'penalty', 'fine', 'settlement', 
                    'award', 'restitution', 'reimbursement', 'indemnity', 'liquidated']
            for term in terms:
                if term in case_text and term not in financial_terms:
                    financial_terms.append(term)
        return financial_terms[:10]
    
    def _calculate_case_statistics(self, cases: List[ReportedCases]) -> Dict[str, Any]:
        """Calculate case statistics from cases."""
        try:
            total_cases = len(cases)
            
            # Count resolved vs unresolved cases
            resolved_cases = sum(1 for case in cases if case.ai_case_outcome and 'resolved' in case.ai_case_outcome.lower())
            unresolved_cases = total_cases - resolved_cases
            
            # Count favorable vs unfavorable cases
            favorable_cases = sum(1 for case in cases if case.ai_case_outcome and 'favorable' in case.ai_case_outcome.lower())
            unfavorable_cases = sum(1 for case in cases if case.ai_case_outcome and 'unfavorable' in case.ai_case_outcome.lower())
            mixed_cases = total_cases - favorable_cases - unfavorable_cases
            
            # Determine overall case outcome
            if favorable_cases > unfavorable_cases:
                case_outcome = "Favorable"
            elif unfavorable_cases > favorable_cases:
                case_outcome = "Unfavorable"
            else:
                case_outcome = "Mixed"
            
            return {
                'total_cases': total_cases,
                'resolved_cases': resolved_cases,
                'unresolved_cases': unresolved_cases,
                'favorable_cases': favorable_cases,
                'unfavorable_cases': unfavorable_cases,
                'mixed_cases': mixed_cases,
                'case_outcome': case_outcome
            }
            
        except Exception as e:
            logger.error(f"Error calculating case statistics: {e}")
            return {
                'total_cases': 0,
                'resolved_cases': 0,
                'unresolved_cases': 0,
                'favorable_cases': 0,
                'unfavorable_cases': 0,
                'mixed_cases': 0,
                'case_outcome': 'N/A'
            }
