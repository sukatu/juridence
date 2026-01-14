import os
import openai
import re
from typing import Dict, List, Any, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.banks import Banks
from models.reported_cases import ReportedCases
from models.bank_analytics import BankAnalytics
from models.bank_case_statistics import BankCaseStatistics
import json

class BankAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Risk assessment keywords and weights for banks
        self.risk_keywords = {
            'regulatory': {'weight': 10, 'keywords': ['regulatory violation', 'compliance failure', 'license suspension', 'regulatory penalty']},
            'fraud': {'weight': 9, 'keywords': ['fraud', 'embezzlement', 'money laundering', 'forgery', 'identity theft']},
            'customer_dispute': {'weight': 6, 'keywords': ['customer complaint', 'service failure', 'account error', 'unauthorized transaction']},
            'operational': {'weight': 5, 'keywords': ['system failure', 'data breach', 'cyber attack', 'operational error']},
            'credit_risk': {'weight': 7, 'keywords': ['bad debt', 'loan default', 'credit risk', 'insolvency']},
            'litigation': {'weight': 4, 'keywords': ['lawsuit', 'legal action', 'court case', 'settlement']},
            'business_dispute': {'weight': 3, 'keywords': ['contract dispute', 'partnership dispute', 'commercial litigation']},
            'employment': {'weight': 2, 'keywords': ['employment dispute', 'labor law', 'workplace issue']}
        }
        
        # Banking-specific subject matter categories
        self.subject_categories = {
            'Banking Regulation': ['banking law', 'regulatory compliance', 'central bank', 'financial services'],
            'Customer Disputes': ['customer complaint', 'account error', 'service failure', 'unauthorized transaction'],
            'Credit & Lending': ['loan', 'credit', 'mortgage', 'default', 'foreclosure', 'debt recovery'],
            'Fraud & Security': ['fraud', 'embezzlement', 'money laundering', 'identity theft', 'cyber crime'],
            'Commercial Banking': ['corporate banking', 'business loan', 'trade finance', 'corporate account'],
            'Investment Banking': ['investment', 'securities', 'trading', 'portfolio management', 'wealth management'],
            'Payment Systems': ['payment processing', 'card services', 'electronic banking', 'mobile banking'],
            'Insurance': ['bank insurance', 'deposit insurance', 'professional indemnity', 'cyber insurance'],
            'Employment': ['employment dispute', 'labor law', 'workplace harassment', 'discrimination'],
            'Property & Assets': ['real estate', 'property management', 'asset recovery', 'foreclosure']
        }

    def calculate_risk_score(self, cases: List[ReportedCases]) -> Tuple[int, str, List[str]]:
        """Calculate risk score based on case analysis for banks"""
        if not cases:
            return 0, "Low", []
        
        total_score = 0
        risk_factors = []
        
        for case in cases:
            case_text = self._get_case_text(case)
            case_score = 0
            case_risk_factors = []
            
            # Analyze case content for risk factors
            for category, data in self.risk_keywords.items():
                weight = data['weight']
                keywords = data['keywords']
                
                for keyword in keywords:
                    if keyword.lower() in case_text.lower():
                        case_score += weight
                        case_risk_factors.append(f"{category}: {keyword}")
                        break
            
            total_score += case_score
            risk_factors.extend(case_risk_factors)
        
        # Normalize score (0-100)
        max_possible_score = len(cases) * 50  # Assuming max 50 points per case
        normalized_score = min(100, (total_score / max_possible_score * 100)) if max_possible_score > 0 else 0
        
        # Determine risk level
        if normalized_score >= 80:
            risk_level = "Critical"
        elif normalized_score >= 60:
            risk_level = "High"
        elif normalized_score >= 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return int(normalized_score), risk_level, list(set(risk_factors))

    def calculate_financial_impact(self, cases: List[ReportedCases]) -> Tuple[Decimal, Decimal, str, List[str]]:
        """Calculate financial impact metrics for banks"""
        if not cases:
            return Decimal('0.00'), Decimal('0.00'), "Low", []
        
        total_amount = Decimal('0.00')
        financial_terms = []
        
        for case in cases:
            case_text = self._get_case_text(case)
            
            # Extract monetary amounts
            amounts = self._extract_monetary_amounts(case_text)
            if amounts:
                total_amount += sum(amounts)
            
            # Extract financial terms
            financial_terms.extend(self._extract_financial_terms(case_text))
        
        average_amount = total_amount / len(cases) if cases else Decimal('0.00')
        
        # Determine financial risk level
        if total_amount > Decimal('10000000'):  # 10M+
            financial_risk = "Critical"
        elif total_amount > Decimal('1000000'):  # 1M+
            financial_risk = "High"
        elif total_amount > Decimal('100000'):  # 100K+
            financial_risk = "Medium"
        else:
            financial_risk = "Low"
        
        return total_amount, average_amount, financial_risk, list(set(financial_terms))

    def analyze_subject_matter(self, cases: List[ReportedCases]) -> Tuple[str, Dict[str, int], List[str]]:
        """Analyze subject matter categories for banks"""
        if not cases:
            return "N/A", {}, []
        
        category_counts = {}
        legal_issues = []
        
        for case in cases:
            case_text = self._get_case_text(case)
            
            # Count subject matter categories
            for category, keywords in self.subject_categories.items():
                count = sum(1 for keyword in keywords if keyword.lower() in case_text.lower())
                if count > 0:
                    category_counts[category] = category_counts.get(category, 0) + count
            
            # Extract legal issues
            legal_issues.extend(self._extract_legal_issues(case_text))
        
        # Determine primary subject matter
        primary_subject = max(category_counts.items(), key=lambda x: x[1])[0] if category_counts else "N/A"
        
        return primary_subject, category_counts, list(set(legal_issues))

    def calculate_complexity_score(self, cases: List[ReportedCases]) -> int:
        """Calculate case complexity score for banks"""
        if not cases:
            return 0
        
        total_complexity = 0
        
        for case in cases:
            complexity = 0
            
            # Factors that increase complexity
            if case.cases_cited and len(case.cases_cited) > 5:
                complexity += 10
            if case.statutes_cited and len(case.statutes_cited) > 3:
                complexity += 8
            if case.lawyers and ',' in case.lawyers:  # Multiple lawyers
                complexity += 5
            if case.presiding_judge and isinstance(case.presiding_judge, list) and len(case.presiding_judge) > 1:
                complexity += 7
            
            # Case content complexity
            case_text = self._get_case_text(case)
            if len(case_text) > 5000:  # Long cases are more complex
                complexity += 5
            if 'appeal' in case_text.lower() or 'supreme court' in case_text.lower():
                complexity += 8
            
            total_complexity += complexity
        
        return min(100, total_complexity // len(cases)) if cases else 0

    def calculate_success_rate(self, cases: List[ReportedCases]) -> Decimal:
        """Calculate success rate based on case outcomes"""
        if not cases:
            return Decimal('0.00')
        
        favorable_cases = 0
        total_resolved = 0
        
        for case in cases:
            # Use AI outcome if available, otherwise analyze case content
            if hasattr(case, 'ai_case_outcome') and case.ai_case_outcome:
                if case.ai_case_outcome == 'WON':
                    favorable_cases += 1
                total_resolved += 1
            else:
                # Analyze case content for outcome indicators
                case_text = self._get_case_text(case)
                if self._is_favorable_outcome(case_text):
                    favorable_cases += 1
                total_resolved += 1
        
        if total_resolved == 0:
            return Decimal('0.00')
        
        return (Decimal(favorable_cases) / Decimal(total_resolved) * 100).quantize(Decimal('0.01'))

    def calculate_banking_specific_metrics(self, cases: List[ReportedCases]) -> Dict[str, Any]:
        """Calculate banking-specific risk metrics"""
        if not cases:
            return {
                'regulatory_compliance_score': 0,
                'customer_dispute_rate': Decimal('0.00'),
                'operational_risk_score': 0,
                'credit_risk_exposure': Decimal('0.00')
            }
        
        regulatory_issues = 0
        customer_disputes = 0
        operational_issues = 0
        credit_exposure = Decimal('0.00')
        
        for case in cases:
            case_text = self._get_case_text(case)
            
            # Regulatory compliance
            regulatory_keywords = ['regulatory', 'compliance', 'license', 'penalty', 'violation']
            if any(keyword in case_text.lower() for keyword in regulatory_keywords):
                regulatory_issues += 1
            
            # Customer disputes
            customer_keywords = ['customer', 'complaint', 'service', 'account', 'unauthorized']
            if any(keyword in case_text.lower() for keyword in customer_keywords):
                customer_disputes += 1
            
            # Operational risk
            operational_keywords = ['system', 'failure', 'breach', 'error', 'operational']
            if any(keyword in case_text.lower() for keyword in operational_keywords):
                operational_issues += 1
            
            # Credit risk exposure
            amounts = self._extract_monetary_amounts(case_text)
            if amounts:
                credit_exposure += sum(amounts)
        
        regulatory_score = max(0, 100 - (regulatory_issues * 10))
        customer_dispute_rate = (Decimal(customer_disputes) / Decimal(len(cases)) * 100).quantize(Decimal('0.01'))
        operational_score = max(0, 100 - (operational_issues * 8))
        
        return {
            'regulatory_compliance_score': regulatory_score,
            'customer_dispute_rate': customer_dispute_rate,
            'operational_risk_score': operational_score,
            'credit_risk_exposure': credit_exposure
        }

    def generate_bank_analytics(self, bank_id: int) -> Optional[BankAnalytics]:
        """Generate comprehensive analytics for a bank"""
        try:
            # Get bank cases
            bank_cases = self._get_bank_cases(bank_id)
            
            if not bank_cases:
                return None
            
            # Calculate all metrics
            risk_score, risk_level, risk_factors = self.calculate_risk_score(bank_cases)
            total_amount, avg_amount, financial_risk, financial_terms = self.calculate_financial_impact(bank_cases)
            primary_subject, subject_categories, legal_issues = self.analyze_subject_matter(bank_cases)
            complexity_score = self.calculate_complexity_score(bank_cases)
            success_rate = self.calculate_success_rate(bank_cases)
            banking_metrics = self.calculate_banking_specific_metrics(bank_cases)
            
            # Create or update analytics record
            analytics = self.db.query(BankAnalytics).filter(BankAnalytics.bank_id == bank_id).first()
            
            if not analytics:
                analytics = BankAnalytics(bank_id=bank_id)
                self.db.add(analytics)
            
            # Update analytics fields
            analytics.risk_score = risk_score
            analytics.risk_level = risk_level
            analytics.risk_factors = risk_factors
            analytics.total_monetary_amount = total_amount
            analytics.average_case_value = avg_amount
            analytics.financial_risk_level = financial_risk
            analytics.primary_subject_matter = primary_subject
            analytics.subject_matter_categories = subject_categories
            analytics.legal_issues = legal_issues
            analytics.financial_terms = financial_terms
            analytics.case_complexity_score = complexity_score
            analytics.success_rate = success_rate
            
            # Banking-specific metrics
            analytics.regulatory_compliance_score = banking_metrics['regulatory_compliance_score']
            analytics.customer_dispute_rate = banking_metrics['customer_dispute_rate']
            analytics.operational_risk_score = banking_metrics['operational_risk_score']
            analytics.credit_risk_exposure = banking_metrics['credit_risk_exposure']
            
            self.db.commit()
            return analytics
            
        except Exception as e:
            self.db.rollback()
            print(f"Error generating bank analytics: {e}")
            return None

    def generate_bank_case_statistics(self, bank_id: int) -> Optional[BankCaseStatistics]:
        """Generate case statistics for a bank"""
        try:
            bank_cases = self._get_bank_cases(bank_id)
            
            if not bank_cases:
                return None
            
            # Calculate statistics
            total_cases = len(bank_cases)
            resolved_cases = 0
            unresolved_cases = 0
            favorable_cases = 0
            unfavorable_cases = 0
            mixed_cases = 0
            
            for case in bank_cases:
                # Determine if case is resolved (simplified logic)
                if hasattr(case, 'ai_case_outcome') and case.ai_case_outcome:
                    resolved_cases += 1
                    if case.ai_case_outcome == 'WON':
                        favorable_cases += 1
                    elif case.ai_case_outcome == 'LOST':
                        unfavorable_cases += 1
                    else:
                        mixed_cases += 1
                else:
                    # Analyze case content for outcome
                    case_text = self._get_case_text(case)
                    if self._is_favorable_outcome(case_text):
                        resolved_cases += 1
                        favorable_cases += 1
                    elif self._is_unfavorable_outcome(case_text):
                        resolved_cases += 1
                        unfavorable_cases += 1
                    else:
                        unresolved_cases += 1
            
            # Determine overall outcome
            if favorable_cases > unfavorable_cases:
                case_outcome = "Favorable"
            elif unfavorable_cases > favorable_cases:
                case_outcome = "Unfavorable"
            else:
                case_outcome = "Mixed"
            
            # Create or update statistics record
            stats = self.db.query(BankCaseStatistics).filter(BankCaseStatistics.bank_id == bank_id).first()
            
            if not stats:
                stats = BankCaseStatistics(bank_id=bank_id)
                self.db.add(stats)
            
            # Update statistics
            stats.total_cases = total_cases
            stats.resolved_cases = resolved_cases
            stats.unresolved_cases = unresolved_cases
            stats.favorable_cases = favorable_cases
            stats.unfavorable_cases = unfavorable_cases
            stats.mixed_cases = mixed_cases
            stats.case_outcome = case_outcome
            
            self.db.commit()
            return stats
            
        except Exception as e:
            self.db.rollback()
            print(f"Error generating bank case statistics: {e}")
            return None

    def _get_bank_cases(self, bank_id: int) -> List[ReportedCases]:
        """Get cases related to a bank"""
        # This is a simplified implementation
        # In reality, you'd need to match bank names with case parties
        bank = self.db.query(Banks).filter(Banks.id == bank_id).first()
        if not bank:
            return []
        
        # Create search terms including bank name and previous names
        search_terms = [bank.name]
        if bank.previous_names:
            if isinstance(bank.previous_names, list):
                search_terms.extend(bank.previous_names)
            elif isinstance(bank.previous_names, str):
                # Handle comma-separated string format
                search_terms.extend([name.strip() for name in bank.previous_names.split(',')])
        
        # Build search conditions for all variations
        conditions = []
        for term in search_terms:
            if term:  # Skip empty terms
                conditions.extend([
                    ReportedCases.title.ilike(f"%{term}%"),
                    ReportedCases.protagonist.ilike(f"%{term}%"),
                    ReportedCases.antagonist.ilike(f"%{term}%")
                ])
        
        # Search for cases where any bank name variation appears
        if conditions:
            cases = self.db.query(ReportedCases).filter(
                or_(*conditions)
            ).all()
        else:
            cases = []
        
        return cases

    def _get_case_text(self, case: ReportedCases) -> str:
        """Extract text content from a case"""
        text_parts = []
        
        if case.title:
            text_parts.append(case.title)
        if case.case_summary:
            text_parts.append(case.case_summary)
        if case.headnotes:
            text_parts.append(case.headnotes)
        if case.commentary:
            text_parts.append(case.commentary)
        if case.decision:
            text_parts.append(case.decision)
        if case.judgement:
            text_parts.append(case.judgement)
        if case.conclusion:
            text_parts.append(case.conclusion)
        
        return " ".join(text_parts)

    def _extract_monetary_amounts(self, text: str) -> List[Decimal]:
        """Extract monetary amounts from text"""
        # Simple regex to find monetary amounts
        pattern = r'[₵$]?[\d,]+\.?\d*\s*(?:million|thousand|billion|M|K|B)?'
        matches = re.findall(pattern, text, re.IGNORECASE)
        
        amounts = []
        for match in matches:
            try:
                # Clean and convert
                clean_match = re.sub(r'[₵$,]', '', match)
                if 'million' in match.lower() or 'M' in match:
                    amounts.append(Decimal(clean_match) * 1000000)
                elif 'thousand' in match.lower() or 'K' in match:
                    amounts.append(Decimal(clean_match) * 1000)
                elif 'billion' in match.lower() or 'B' in match:
                    amounts.append(Decimal(clean_match) * 1000000000)
                else:
                    amounts.append(Decimal(clean_match))
            except:
                continue
        
        return amounts

    def _extract_financial_terms(self, text: str) -> List[str]:
        """Extract financial terms from text"""
        financial_keywords = [
            'loan', 'credit', 'mortgage', 'deposit', 'withdrawal', 'interest',
            'principal', 'collateral', 'default', 'foreclosure', 'bankruptcy',
            'insolvency', 'debt', 'payment', 'installment', 'refinance'
        ]
        
        terms = []
        for keyword in financial_keywords:
            if keyword.lower() in text.lower():
                terms.append(keyword)
        
        return terms

    def _extract_legal_issues(self, text: str) -> List[str]:
        """Extract legal issues from text"""
        legal_keywords = [
            'breach of contract', 'negligence', 'fraud', 'misrepresentation',
            'violation', 'non-compliance', 'default', 'breach', 'liability',
            'damages', 'injunction', 'specific performance', 'restitution'
        ]
        
        issues = []
        for keyword in legal_keywords:
            if keyword.lower() in text.lower():
                issues.append(keyword)
        
        return issues

    def _is_favorable_outcome(self, text: str) -> bool:
        """Determine if case outcome is favorable"""
        favorable_indicators = [
            'granted', 'allowed', 'successful', 'won', 'victory', 'favor',
            'upheld', 'dismissed', 'withdrawn', 'settled favorably'
        ]
        
        return any(indicator in text.lower() for indicator in favorable_indicators)

    def _is_unfavorable_outcome(self, text: str) -> bool:
        """Determine if case outcome is unfavorable"""
        unfavorable_indicators = [
            'denied', 'rejected', 'failed', 'lost', 'defeat', 'against',
            'overruled', 'quashed', 'reversed', 'appeal dismissed'
        ]
        
        return any(indicator in text.lower() for indicator in unfavorable_indicators)
