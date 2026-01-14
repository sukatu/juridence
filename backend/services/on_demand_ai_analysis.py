#!/usr/bin/env python3
"""
On-demand AI analysis service - analyzes cases only when they are first accessed.
"""

import os
import sys
import logging
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import openai
import json

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from config import settings

logger = logging.getLogger(__name__)

class OnDemandAIAnalysis:
    def __init__(self):
        self.engine = create_engine(settings.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.openai_client = None
        self.model = "gpt-3.5-turbo"
        
    def setup_openai(self):
        """Setup OpenAI client"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT value FROM settings WHERE key = 'openai_api_key' LIMIT 1")).fetchone()
                if result:
                    api_key = result[0]
                    self.openai_client = openai.OpenAI(api_key=api_key)
                    logger.info("OpenAI client initialized successfully")
                    return True
                else:
                    logger.error("OpenAI API key not found in database")
                    return False
        except Exception as e:
            logger.error(f"Failed to setup OpenAI: {e}")
            return False
    
    def is_case_analyzed(self, case_id):
        """Check if a case has already been analyzed"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT ai_detailed_outcome, ai_summary_generated_at 
                    FROM reported_cases 
                    WHERE id = :case_id
                """), {"case_id": case_id}).fetchone()
                
                if result and result[0] and result[0].strip():
                    return True, result[1]  # Return True and generation timestamp
                return False, None
        except Exception as e:
            logger.error(f"Error checking if case {case_id} is analyzed: {e}")
            return False, None
    
    def get_case_content(self, case_id):
        """Get case content for analysis"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT id, title, decision, judgement, conclusion, case_summary, 
                           area_of_law, protagonist, antagonist
                    FROM reported_cases 
                    WHERE id = :case_id
                """), {"case_id": case_id}).fetchone()
                
                if not result:
                    return None
                
                return {
                    'id': result[0],
                    'title': result[1],
                    'decision': result[2],
                    'judgement': result[3],
                    'conclusion': result[4],
                    'case_summary': result[5],
                    'area_of_law': result[6],
                    'protagonist': result[7],
                    'antagonist': result[8]
                }
        except Exception as e:
            logger.error(f"Error getting case content for {case_id}: {e}")
            return None
    
    def prepare_case_content(self, case):
        """Prepare case content for AI analysis"""
        content_parts = []
        
        if case['title']:
            content_parts.append(f"Case Title: {case['title']}")
        
        if case['decision']:
            content_parts.append(f"Decision: {case['decision']}")
        elif case['judgement']:
            content_parts.append(f"Judgement: {case['judgement']}")
        
        if case['conclusion']:
            content_parts.append(f"Conclusion: {case['conclusion']}")
        
        if case['case_summary']:
            content_parts.append(f"Case Summary: {case['case_summary']}")
        
        if case['area_of_law']:
            content_parts.append(f"Area of Law: {case['area_of_law']}")
        
        if case['protagonist']:
            content_parts.append(f"Plaintiff/Appellant: {case['protagonist']}")
        if case['antagonist']:
            content_parts.append(f"Defendant/Respondent: {case['antagonist']}")
        
        return "\n\n".join(content_parts)
    
    def analyze_case(self, case):
        """Analyze a single case with AI"""
        try:
            case_content = self.prepare_case_content(case)
            
            if not case_content.strip():
                return self.get_default_analysis()
            
            # Truncate content to fit within token limits
            if len(case_content) > 6000:
                case_content = case_content[:6000] + "..."
            
            prompt = f"""
Analyze the following legal case and provide structured insights for banking and financial assessment purposes:

CASE CONTENT:
{case_content}

Please provide a JSON response with the following structure:

{{
    "case_outcome": "WON|LOST|PARTIALLY_WON|PARTIALLY_LOST|UNRESOLVED",
    "court_orders": "Detailed description of any court orders, judgments, or directives issued",
    "financial_impact": "HIGH|MODERATE|LOW|UNRESOLVED - Brief explanation of financial implications",
    "detailed_outcome": "Comprehensive summary of the case outcome, key findings, and implications for banking/credit assessment"
}}

Guidelines:
1. Determine case outcome based on who prevailed (plaintiff/appellant vs defendant/respondent)
2. Extract specific court orders, monetary awards, injunctions, or other directives
3. Assess financial impact considering monetary damages, costs, and business implications
4. Provide a detailed summary focusing on banking and credit risk assessment
5. Be objective and factual in your analysis
6. If information is unclear or insufficient, mark as "UNRESOLVED" and explain limitations
7. Use conservative assessment when case details are ambiguous
8. Focus on financial implications for credit and banking decisions

Respond only with valid JSON, no additional text.
"""
            
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a legal AI assistant specializing in case analysis for banking and financial institutions. Analyze legal cases and provide structured insights for credit assessment and risk evaluation. Be conservative and accurate in your assessments."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.2
            )
            
            ai_response = response.choices[0].message.content
            return self.parse_ai_response(ai_response)
            
        except Exception as e:
            logger.error(f"Error analyzing case {case['id']}: {e}")
            return self.get_default_analysis()
    
    def parse_ai_response(self, ai_response):
        """Parse AI response and extract structured data"""
        try:
            response_text = ai_response.strip()
            
            if response_text.startswith('{') and response_text.endswith('}'):
                return json.loads(response_text)
            else:
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    return json.loads(json_str)
                else:
                    raise ValueError("No valid JSON found in response")
                    
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return self.get_default_analysis()
    
    def get_default_analysis(self):
        """Return default analysis when AI processing fails"""
        return {
            "case_outcome": "UNRESOLVED",
            "court_orders": "Unable to determine court orders from available information.",
            "financial_impact": "UNRESOLVED - Unable to assess financial impact due to insufficient information.",
            "detailed_outcome": "Case analysis could not be completed due to insufficient information or processing error."
        }
    
    def update_case_with_analysis(self, case_id, analysis):
        """Update case with AI analysis"""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("""
                    UPDATE reported_cases 
                    SET ai_case_outcome = :case_outcome,
                        ai_court_orders = :court_orders,
                        ai_financial_impact = :financial_impact,
                        ai_detailed_outcome = :detailed_outcome,
                        ai_summary_generated_at = :generated_at,
                        ai_summary_version = :version
                    WHERE id = :case_id
                """), {
                    "case_id": case_id,
                    "case_outcome": analysis.get('case_outcome', 'UNRESOLVED'),
                    "court_orders": analysis.get('court_orders', ''),
                    "financial_impact": analysis.get('financial_impact', 'UNRESOLVED'),
                    "detailed_outcome": analysis.get('detailed_outcome', ''),
                    "generated_at": datetime.utcnow(),
                    "version": "2.0"
                })
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error updating case {case_id}: {e}")
            return False
    
    def analyze_case_on_demand(self, case_id):
        """Analyze a case only if it hasn't been analyzed before"""
        try:
            # Check if case is already analyzed
            is_analyzed, generated_at = self.is_case_analyzed(case_id)
            
            if is_analyzed:
                logger.info(f"Case {case_id} already analyzed at {generated_at}")
                return {
                    "status": "already_analyzed",
                    "message": f"Case {case_id} was already analyzed on {generated_at}",
                    "generated_at": generated_at
                }
            
            # Setup OpenAI if not already done
            if not self.openai_client:
                if not self.setup_openai():
                    return {
                        "status": "error",
                        "message": "OpenAI setup failed"
                    }
            
            # Get case content
            case = self.get_case_content(case_id)
            if not case:
                return {
                    "status": "error",
                    "message": f"Case {case_id} not found"
                }
            
            # Check if case has content to analyze
            case_content = self.prepare_case_content(case)
            if not case_content.strip():
                return {
                    "status": "error",
                    "message": f"Case {case_id} has no content to analyze"
                }
            
            logger.info(f"Analyzing case {case_id} on demand: {case['title'][:50]}...")
            
            # Perform AI analysis
            analysis = self.analyze_case(case)
            
            # Update database
            if self.update_case_with_analysis(case_id, analysis):
                logger.info(f"✅ Case {case_id} analyzed successfully on demand")
                return {
                    "status": "success",
                    "message": f"Case {case_id} analyzed successfully",
                    "analysis": analysis,
                    "generated_at": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to update case {case_id} with analysis"
                }
                
        except Exception as e:
            logger.error(f"Error in on-demand analysis for case {case_id}: {e}")
            return {
                "status": "error",
                "message": f"Analysis failed: {str(e)}"
            }

# Global instance
ai_analyzer = OnDemandAIAnalysis()

def analyze_case_if_needed(case_id):
    """Public function to analyze a case if it hasn't been analyzed before"""
    return ai_analyzer.analyze_case_on_demand(case_id)
