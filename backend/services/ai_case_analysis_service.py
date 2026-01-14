import os
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.reported_cases import ReportedCases
from models.settings import Settings
from database import get_db
import openai
from datetime import datetime

logger = logging.getLogger(__name__)

class AICaseAnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.openai_client = self._get_openai_client()
        self.model = self._get_ai_model()
    
    def _get_openai_client(self):
        """Get OpenAI client with API key from database or environment"""
        try:
            # Try to get API key from database settings
            settings = self.db.query(Settings).filter(Settings.key == 'openai_api_key').first()
            api_key = settings.value if settings else None
            
            # Fallback to environment variable
            if not api_key:
                api_key = os.getenv('OPENAI_API_KEY')
            
            if not api_key:
                raise ValueError("OpenAI API key not found in database settings or environment variables")
            
            return openai.OpenAI(api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            raise
    
    def _get_ai_model(self):
        """Get AI model from database settings"""
        try:
            settings = self.db.query(Settings).filter(Settings.key == 'openai_model').first()
            return settings.value if settings else "gpt-3.5-turbo"
        except Exception as e:
            logger.warning(f"Failed to get AI model from settings, using default: {e}")
            return "gpt-3.5-turbo"
    
    def _truncate_content(self, content: str, max_length: int = 8000) -> str:
        """Truncate content to fit within token limits"""
        if not content:
            return ""
        
        # Simple truncation - in production, you might want to use tiktoken for accurate token counting
        if len(content) <= max_length:
            return content
        
        return content[:max_length] + "..."
    
    def analyze_case(self, case: ReportedCases) -> Dict[str, Any]:
        """Analyze a single case and generate AI-powered insights"""
        try:
            # Prepare case content for analysis
            case_content = self._prepare_case_content(case)
            
            if not case_content.strip():
                logger.warning(f"Case {case.id} has no content for analysis")
                return self._get_default_analysis()
            
            # Generate AI analysis
            analysis = self._generate_ai_analysis(case_content, case)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing case {case.id}: {e}")
            return self._get_default_analysis()
    
    def _prepare_case_content(self, case: ReportedCases) -> str:
        """Prepare case content for AI analysis"""
        content_parts = []
        
        # Add case title
        if case.title:
            content_parts.append(f"Case Title: {case.title}")
        
        # Add decision/judgement content (primary source)
        if case.decision:
            content_parts.append(f"Decision: {case.decision}")
        elif case.judgement:
            content_parts.append(f"Judgement: {case.judgement}")
        
        # Add conclusion if available
        if case.conclusion:
            content_parts.append(f"Conclusion: {case.conclusion}")
        
        # Add case summary if available
        if case.case_summary:
            content_parts.append(f"Case Summary: {case.case_summary}")
        
        # Add area of law for context
        if case.area_of_law:
            content_parts.append(f"Area of Law: {case.area_of_law}")
        
        # Add protagonist and antagonist for context
        if case.protagonist:
            content_parts.append(f"Plaintiff/Appellant: {case.protagonist}")
        if case.antagonist:
            content_parts.append(f"Defendant/Respondent: {case.antagonist}")
        
        return "\n\n".join(content_parts)
    
    def _generate_ai_analysis(self, case_content: str, case: ReportedCases) -> Dict[str, Any]:
        """Generate AI analysis for the case"""
        try:
            # Truncate content to fit within token limits
            truncated_content = self._truncate_content(case_content, 6000)
            
            prompt = self._create_analysis_prompt(truncated_content, case)
            
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a legal AI assistant specializing in case analysis for banking and financial institutions. Analyze legal cases and provide structured insights for credit assessment and risk evaluation."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            # Parse the AI response
            ai_response = response.choices[0].message.content
            return self._parse_ai_response(ai_response)
            
        except Exception as e:
            logger.error(f"Error generating AI analysis: {e}")
            return self._get_default_analysis()
    
    def _create_analysis_prompt(self, case_content: str, case: ReportedCases) -> str:
        """Create a comprehensive prompt for AI analysis"""
        return f"""
Analyze the following legal case and provide structured insights for banking and financial assessment purposes:

CASE CONTENT:
{case_content}

Please provide a JSON response with the following structure:

{{
    "case_outcome": "WON|LOST|PARTIALLY_WON|PARTIALLY_LOST|UNRESOLVED",
    "court_orders": "Detailed description of any court orders, judgments, or directives issued",
    "financial_impact": "HIGH|MODERATE|LOW - Brief explanation of financial implications",
    "detailed_outcome": "Comprehensive summary of the case outcome, key findings, and implications for banking/credit assessment"
}}

Guidelines:
1. Determine case outcome based on who prevailed (plaintiff/appellant vs defendant/respondent)
2. Extract specific court orders, monetary awards, injunctions, or other directives
3. Assess financial impact considering monetary damages, costs, and business implications
4. Provide a detailed summary focusing on banking and credit risk assessment
5. Be objective and factual in your analysis
6. If information is unclear, mark as "UNRESOLVED" and explain limitations

Respond only with valid JSON, no additional text.
"""
    
    def _parse_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response and extract structured data"""
        try:
            import json
            # Clean the response to extract JSON
            response_text = ai_response.strip()
            
            # Try to find JSON in the response
            if response_text.startswith('{') and response_text.endswith('}'):
                return json.loads(response_text)
            else:
                # Try to extract JSON from the response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    return json.loads(json_str)
                else:
                    raise ValueError("No valid JSON found in response")
                    
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return self._get_default_analysis()
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Return default analysis when AI processing fails"""
        return {
            "case_outcome": "UNRESOLVED",
            "court_orders": "Unable to determine court orders from available information.",
            "financial_impact": "UNKNOWN - Unable to assess financial impact due to insufficient information.",
            "detailed_outcome": "Case analysis could not be completed due to insufficient information or processing error."
        }
    
    def update_case_with_ai_analysis(self, case_id: int) -> bool:
        """Update a specific case with AI analysis"""
        try:
            case = self.db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
            if not case:
                logger.error(f"Case {case_id} not found")
                return False
            
            # Generate AI analysis
            analysis = self.analyze_case(case)
            
            # Update case with AI analysis
            case.ai_case_outcome = analysis.get('case_outcome', 'UNRESOLVED')
            case.ai_court_orders = analysis.get('court_orders', '')
            case.ai_financial_impact = analysis.get('financial_impact', 'UNKNOWN')
            case.ai_detailed_outcome = analysis.get('detailed_outcome', '')
            case.ai_summary_generated_at = datetime.utcnow()
            case.ai_summary_version = '1.0'
            
            self.db.commit()
            logger.info(f"Successfully updated case {case_id} with AI analysis")
            return True
            
        except Exception as e:
            logger.error(f"Error updating case {case_id} with AI analysis: {e}")
            self.db.rollback()
            return False
    
    def process_all_cases(self, batch_size: int = 10) -> Dict[str, Any]:
        """Process all cases in batches and update with AI analysis"""
        try:
            # Get total count of cases
            total_cases = self.db.query(ReportedCases).count()
            processed = 0
            successful = 0
            failed = 0
            
            logger.info(f"Starting AI analysis for {total_cases} cases in batches of {batch_size}")
            
            # Process cases in batches
            offset = 0
            while offset < total_cases:
                cases = self.db.query(ReportedCases).offset(offset).limit(batch_size).all()
                
                for case in cases:
                    try:
                        if self.update_case_with_ai_analysis(case.id):
                            successful += 1
                        else:
                            failed += 1
                        processed += 1
                        
                        # Log progress every 10 cases
                        if processed % 10 == 0:
                            logger.info(f"Processed {processed}/{total_cases} cases")
                            
                    except Exception as e:
                        logger.error(f"Error processing case {case.id}: {e}")
                        failed += 1
                        processed += 1
                
                offset += batch_size
            
            result = {
                "total_cases": total_cases,
                "processed": processed,
                "successful": successful,
                "failed": failed,
                "completion_percentage": (processed / total_cases * 100) if total_cases > 0 else 0
            }
            
            logger.info(f"AI analysis completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing all cases: {e}")
            return {
                "total_cases": 0,
                "processed": 0,
                "successful": 0,
                "failed": 0,
                "completion_percentage": 0,
                "error": str(e)
            }
    
    def get_analysis_stats(self) -> Dict[str, Any]:
        """Get statistics about AI analysis completion"""
        try:
            total_cases = self.db.query(ReportedCases).count()
            analyzed_cases = self.db.query(ReportedCases).filter(
                ReportedCases.ai_detailed_outcome.isnot(None),
                ReportedCases.ai_detailed_outcome != ''
            ).count()
            
            return {
                "total_cases": total_cases,
                "analyzed_cases": analyzed_cases,
                "pending_cases": total_cases - analyzed_cases,
                "completion_percentage": (analyzed_cases / total_cases * 100) if total_cases > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error getting analysis stats: {e}")
            return {"error": str(e)}
