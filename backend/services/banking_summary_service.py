"""
Service for generating and saving AI-powered banking summaries for cases.
"""

import os
import re
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models.reported_cases import ReportedCases
import openai
from config import settings

class BankingSummaryService:
    def __init__(self, db: Session):
        self.db = db

    def generate_banking_summary(self, case: ReportedCases) -> Dict[str, Any]:
        """
        Generate comprehensive AI-based banking summary for a case using OpenAI.
        """
        # Collect all available case content
        case_content = self._collect_case_content(case)
        
        if not case_content.strip():
            return self._get_default_summary()
        
        try:
            # Use OpenAI to analyze the case content
            ai_analysis = self._analyze_with_openai(case_content)
            return ai_analysis
        except Exception as e:
            print(f"OpenAI analysis failed for case {case.id}: {e}")
            # Fallback to keyword analysis
            return self._fallback_keyword_analysis(case_content)

    def _collect_case_content(self, case: ReportedCases) -> str:
        """Collect all available case content for analysis."""
        content_parts = []
        
        # Add title
        if case.title:
            content_parts.append(f"Title: {case.title}")
        
        # Add case summary
        if case.case_summary:
            content_parts.append(f"Summary: {case.case_summary}")
        
        # Add headnotes
        if case.headnotes:
            content_parts.append(f"Headnotes: {case.headnotes}")
        
        # Add commentary
        if case.commentary:
            content_parts.append(f"Commentary: {case.commentary}")
        
        # Add decision/judgement
        if case.decision:
            content_parts.append(f"Decision: {case.decision}")
        elif case.judgement:
            content_parts.append(f"Judgement: {case.judgement}")
        
        # Add conclusion
        if case.conclusion:
            content_parts.append(f"Conclusion: {case.conclusion}")
        
        # Add area of law
        if case.area_of_law:
            content_parts.append(f"Area of Law: {case.area_of_law}")
        
        # Add keywords
        if case.keywords_phrases:
            content_parts.append(f"Keywords: {case.keywords_phrases}")
        
        return "\n\n".join(content_parts)

    def _analyze_with_openai(self, case_content: str) -> Dict[str, Any]:
        """Use OpenAI to analyze case content and generate banking summary."""
        prompt = f"""
        Analyze the following legal case and provide a banking summary with the following structure:

        Case Content:
        {case_content[:4000]}  # Limit to avoid token limits

        Please analyze this case and provide:

        1. Case Outcome: Choose ONE of: WON, LOST, PARTIALLY_WON, PARTIALLY_LOST, UNRESOLVED
        2. Court Orders: Brief description of any court orders, injunctions, or directives issued
        3. Financial Impact: Choose ONE of: NONE, LOW, MODERATE, HIGH (with brief explanation)
        4. Detailed Outcome: A comprehensive 2-3 sentence summary of the case outcome, financial implications, and legal significance

        Respond in this exact JSON format:
        {{
            "ai_case_outcome": "WON/LOST/PARTIALLY_WON/PARTIALLY_LOST/UNRESOLVED",
            "ai_court_orders": "Description of court orders",
            "ai_financial_impact": "NONE/LOW/MODERATE/HIGH - Brief explanation",
            "ai_detailed_outcome": "Comprehensive summary of case outcome and implications"
        }}
        """

        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a legal analyst specializing in banking and financial law. Analyze legal cases and provide accurate banking summaries."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )

        # Parse the JSON response
        import json
        try:
            ai_data = json.loads(response.choices[0].message.content.strip())
            ai_data['ai_summary_generated_at'] = datetime.now()
            ai_data['ai_summary_version'] = '2.0'
            return ai_data
        except json.JSONDecodeError:
            # If JSON parsing fails, return default
            return self._get_default_summary()

    def _fallback_keyword_analysis(self, case_content: str) -> Dict[str, Any]:
        """Fallback to keyword analysis if OpenAI fails."""
        text = case_content.lower()
        
        # Enhanced outcome analysis
        won_lost = self._analyze_case_outcome(text)
        court_orders = self._analyze_court_orders(text)
        financial_impact = self._analyze_financial_impact(text)
        detailed_outcome = self._generate_detailed_outcome(text, won_lost, court_orders, financial_impact)
        
        return {
            'ai_case_outcome': won_lost,
            'ai_court_orders': court_orders,
            'ai_financial_impact': financial_impact,
            'ai_detailed_outcome': detailed_outcome,
            'ai_summary_generated_at': datetime.now(),
            'ai_summary_version': '1.0-fallback'
        }

    def _get_default_summary(self) -> Dict[str, Any]:
        """Return default summary when no content is available."""
        return {
            'ai_case_outcome': 'UNRESOLVED',
            'ai_court_orders': 'No specific court orders identified',
            'ai_financial_impact': 'NONE - No clear monetary amounts or financial implications identified',
            'ai_detailed_outcome': 'Case outcome details not clearly specified in available information.',
            'ai_summary_generated_at': datetime.now(),
            'ai_summary_version': '1.0-default'
        }

    def _analyze_case_outcome(self, text: str) -> str:
        """Analyze case outcome based on keywords."""
        strong_win_keywords = [
            'allowed', 'granted', 'upheld', 'successful', 'won', 'favorable', 
            'in favor', 'succeeded', 'victory', 'prevailed'
        ]
        moderate_win_keywords = [
            'partially allowed', 'partially granted', 'in part', 'some relief'
        ]
        strong_loss_keywords = [
            'dismissed', 'rejected', 'denied', 'unsuccessful', 'lost', 
            'unfavorable', 'against', 'failed', 'defeated', 'overruled'
        ]
        moderate_loss_keywords = [
            'partially dismissed', 'partially rejected', 'in part dismissed'
        ]
        
        if any(keyword in text for keyword in strong_win_keywords):
            return 'WON'
        elif any(keyword in text for keyword in moderate_win_keywords):
            return 'PARTIALLY_WON'
        elif any(keyword in text for keyword in strong_loss_keywords):
            return 'LOST'
        elif any(keyword in text for keyword in moderate_loss_keywords):
            return 'PARTIALLY_LOST'
        else:
            return 'UNRESOLVED'

    def _analyze_court_orders(self, text: str) -> str:
        """Analyze court orders based on keywords."""
        order_keywords = [
            'ordered', 'directed', 'injunction', 'restraining', 'mandatory', 'prohibitory',
            'enjoined', 'restrained', 'compelled', 'required', 'commanded', 'decreed',
            'permanent injunction', 'temporary injunction', 'interim order', 'final order'
        ]
        
        specific_order_keywords = [
            'pay', 'compensate', 'refund', 'return', 'restore', 'cease', 'desist',
            'remove', 'demolish', 'construct', 'repair', 'maintain', 'provide'
        ]
        
        if any(keyword in text for keyword in order_keywords):
            has_specific_orders = any(keyword in text for keyword in specific_order_keywords)
            return 'Court issued specific actionable orders requiring compliance' if has_specific_orders else 'Court issued general orders or directives'
        else:
            return 'No specific court orders identified'

    def _analyze_financial_impact(self, text: str) -> str:
        """Analyze financial impact based on keywords."""
        monetary_keywords = [
            'damages', 'compensation', 'fine', 'penalty', 'costs', 'award', 'settlement',
            'restitution', 'reimbursement', 'refund', 'payment', 'monetary', 'financial',
            'ghc', 'cedis', 'dollars', 'amount', 'sum', 'value', 'price'
        ]
        
        high_value_keywords = ['million', 'thousand', 'substantial', 'significant', 'large']
        low_value_keywords = ['nominal', 'minimal', 'small', 'token']
        
        if any(keyword in text for keyword in monetary_keywords):
            if any(keyword in text for keyword in high_value_keywords):
                return 'HIGH - Case involves substantial monetary amounts or significant financial implications'
            elif any(keyword in text for keyword in low_value_keywords):
                return 'LOW - Case involves minimal monetary amounts or token financial implications'
            else:
                return 'MODERATE - Case involves monetary amounts with moderate financial implications'
        else:
            return 'NONE - No clear monetary amounts or financial implications identified'

    def _generate_detailed_outcome(self, text: str, won_lost: str, court_orders: str, financial_impact: str) -> str:
        """Generate detailed outcome analysis."""
        outcome_keywords = [
            'judgment', 'ruling', 'decision', 'verdict', 'finding', 'conclusion',
            'determination', 'resolution', 'settlement', 'agreement'
        ]
        
        if any(keyword in text for keyword in outcome_keywords):
            detailed_outcome = f"Case {won_lost.lower().replace('_', ' ')} with {court_orders.lower()}. {financial_impact}. "
            
            # Add specific details based on case content
            if 'contract' in text:
                detailed_outcome += 'Contract-related dispute with legal implications for business relationships.'
            elif 'property' in text or 'land' in text:
                detailed_outcome += 'Property/land dispute with potential asset implications.'
            elif 'employment' in text or 'labor' in text:
                detailed_outcome += 'Employment-related matter with workplace implications.'
            elif 'criminal' in text or 'fraud' in text:
                detailed_outcome += 'Criminal or fraud-related matter with serious legal implications.'
            else:
                detailed_outcome += 'General legal matter with standard legal implications.'
        else:
            detailed_outcome = 'Case outcome details not clearly specified in available information.'
        
        return detailed_outcome

    def save_banking_summary(self, case_id: int, summary_data: Dict[str, Any]) -> bool:
        """Save banking summary to database."""
        try:
            case = self.db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
            if not case:
                return False
            
            # Update case with AI summary data
            case.ai_case_outcome = summary_data['ai_case_outcome']
            case.ai_court_orders = summary_data['ai_court_orders']
            case.ai_financial_impact = summary_data['ai_financial_impact']
            case.ai_detailed_outcome = summary_data['ai_detailed_outcome']
            case.ai_summary_generated_at = summary_data['ai_summary_generated_at']
            case.ai_summary_version = summary_data['ai_summary_version']
            
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error saving banking summary: {e}")
            self.db.rollback()
            return False

    def get_banking_summary(self, case_id: int) -> Optional[Dict[str, Any]]:
        """Get existing banking summary from database."""
        try:
            case = self.db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
            if not case or not case.ai_summary_generated_at:
                return None
            
            return {
                'ai_case_outcome': case.ai_case_outcome,
                'ai_court_orders': case.ai_court_orders,
                'ai_financial_impact': case.ai_financial_impact,
                'ai_detailed_outcome': case.ai_detailed_outcome,
                'ai_summary_generated_at': case.ai_summary_generated_at,
                'ai_summary_version': case.ai_summary_version
            }
        except Exception as e:
            print(f"Error getting banking summary: {e}")
            return None
