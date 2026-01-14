import os
import openai
import logging
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models.settings import Settings
from models.reported_cases import ReportedCases
from models.case_metadata import CaseMetadata
from models.case_hearings import CaseHearing
from datetime import datetime
import json
import re
from services.usage_tracking_service import UsageTrackingService

# Configure logging for AI chat
logging.basicConfig(level=logging.INFO)
ai_chat_logger = logging.getLogger("ai_chat")

class AIChatService:
    def __init__(self, db: Session):
        self.db = db
        self.openai_client = self._get_openai_client()
        self.model = self._get_ai_model()
        self.usage_service = UsageTrackingService(db)
        
    def _get_openai_client(self):
        """Get OpenAI client with API key from database or environment"""
        try:
            setting = self.db.query(Settings).filter(Settings.key == "openai_api_key").first()
            if setting and setting.value:
                return openai.OpenAI(api_key=setting.value)
        except Exception as e:
            print(f"Error fetching API key from database: {e}")
        
        # Fallback to environment variable
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not found in database or environment variables")
        return openai.OpenAI(api_key=api_key)
    
    def _get_ai_model(self) -> str:
        """Get AI model from settings"""
        try:
            setting = self.db.query(Settings).filter(Settings.key == "ai_model").first()
            return setting.value if setting and setting.value else "gpt-3.5-turbo"
        except Exception as e:
            print(f"Error fetching AI model from database: {e}")
            return "gpt-3.5-turbo"
    
    def _truncate_content(self, content: str, max_length: int = 2000) -> str:
        """Truncate content to prevent token limit issues"""
        if not content or len(content) <= max_length:
            return content
        return content[:max_length] + "... [Content truncated]"
    
    def _log_chat_interaction(self, case_id: int, user_message: str, ai_response: str, 
                            session_id: str = None, user_id: str = None, 
                            response_time_ms: int = None, tokens_used: int = None,
                            error: str = None):
        """Log chat interaction for reporting and analytics"""
        try:
            log_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "case_id": case_id,
                "session_id": session_id,
                "user_id": user_id,
                "user_message": user_message[:500],  # Truncate for storage
                "ai_response": ai_response[:500] if ai_response else None,  # Truncate for storage
                "response_time_ms": response_time_ms,
                "tokens_used": tokens_used,
                "ai_model": self.model,
                "error": error,
                "message_length": len(user_message),
                "response_length": len(ai_response) if ai_response else 0
            }
            
            # Log to console/file
            ai_chat_logger.info(f"AI_CHAT_INTERACTION: {json.dumps(log_data)}")
            
            # Log to database for detailed analytics
            self._log_to_database(log_data)
            
        except Exception as e:
            ai_chat_logger.error(f"Error logging chat interaction: {e}")
    
    def _log_session_analytics(self, session_id: str, case_id: int, action: str, 
                              additional_data: Dict = None):
        """Log session analytics for reporting"""
        try:
            analytics_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "session_id": session_id,
                "case_id": case_id,
                "action": action,  # 'session_started', 'message_sent', 'session_ended', etc.
                "ai_model": self.model,
                "additional_data": additional_data or {}
            }
            
            ai_chat_logger.info(f"AI_CHAT_ANALYTICS: {json.dumps(analytics_data)}")
            
        except Exception as e:
            ai_chat_logger.error(f"Error logging session analytics: {e}")
    
    def _log_to_database(self, log_data: Dict):
        """Log interaction data to database for detailed reporting"""
        try:
            # Create a simple log entry in the database
            # You might want to create a dedicated table for this
            from models.ai_chat_session import AIChatSession
            
            # For now, we'll store analytics in the session's metadata
            # In a production system, you'd want a separate analytics table
            session = self.db.query(AIChatSession).filter(
                AIChatSession.session_id == log_data.get('session_id')
            ).first()
            
            if session:
                # Update session with interaction count and last activity
                session.total_messages = (session.total_messages or 0) + 1
                session.last_activity = datetime.utcnow()
                
                # Store interaction metadata
                if not hasattr(session, 'interaction_logs'):
                    session.interaction_logs = []
                
                if not session.interaction_logs:
                    session.interaction_logs = []
                
                # Add to interaction logs (keep last 100 interactions)
                session.interaction_logs.append({
                    "timestamp": log_data["timestamp"],
                    "user_message_length": log_data["message_length"],
                    "response_length": log_data["response_length"],
                    "response_time_ms": log_data.get("response_time_ms"),
                    "tokens_used": log_data.get("tokens_used"),
                    "error": log_data.get("error")
                })
                
                # Keep only last 100 interactions to prevent bloat
                if len(session.interaction_logs) > 100:
                    session.interaction_logs = session.interaction_logs[-100:]
                
                self.db.commit()
                
        except Exception as e:
            ai_chat_logger.error(f"Error logging to database: {e}")
    
    def _log_usage_statistics(self, case_id: int, session_id: str, 
                            total_tokens: int, response_time_ms: int):
        """Log usage statistics for billing and analytics"""
        try:
            usage_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "case_id": case_id,
                "session_id": session_id,
                "total_tokens": total_tokens,
                "response_time_ms": response_time_ms,
                "ai_model": self.model,
                "cost_estimate": self._calculate_cost_estimate(total_tokens)
            }
            
            ai_chat_logger.info(f"AI_CHAT_USAGE: {json.dumps(usage_data)}")
            
        except Exception as e:
            ai_chat_logger.error(f"Error logging usage statistics: {e}")
    
    def _calculate_cost_estimate(self, tokens: int) -> float:
        """Calculate estimated cost based on token usage"""
        # Rough estimates for OpenAI pricing (as of 2024)
        if self.model == "gpt-4":
            return tokens * 0.00003  # $0.03 per 1K tokens
        elif self.model == "gpt-3.5-turbo":
            return tokens * 0.000002  # $0.002 per 1K tokens
        else:
            return tokens * 0.00001  # Default estimate
    
    def get_case_context(self, case_id: int) -> Dict[str, Any]:
        """Get comprehensive case context for AI chat"""
        try:
            # Get case with metadata
            case = self.db.query(ReportedCases).outerjoin(
                CaseMetadata, ReportedCases.id == CaseMetadata.case_id
            ).filter(ReportedCases.id == case_id).first()
            
            if not case:
                return {"error": "Case not found"}
            
            metadata = case.case_metadata
            
            # Get case hearings
            hearings = self.db.query(CaseHearing).filter(
                CaseHearing.case_id == case_id
            ).order_by(CaseHearing.hearing_date).all()
            
            # Build comprehensive context
            context = {
                "case_id": case.id,
                "title": case.title,
                "suit_reference_number": case.suit_reference_number,
                "date": case.date.isoformat() if case.date else None,
                "year": case.year,
                "court_type": case.court_type,
                "court_division": case.court_division,
                "area_of_law": case.area_of_law,
                "status": str(case.status) if case.status is not None else None,
                "protagonist": case.protagonist,
                "antagonist": case.antagonist,
                "lawyers": case.lawyers,
                "region": case.region,
                "town": case.town,
                "presiding_judge": case.presiding_judge,
                "judgement_by": case.judgement_by,
                "opinion_by": case.opinion_by,
                
                # Case content (truncated to prevent token limit issues)
                "case_summary": self._truncate_content(case.case_summary, 1000),
                "detail_content": self._truncate_content(case.detail_content, 2000),
                "decision": self._truncate_content(case.decision, 1500),
                "judgement": self._truncate_content(case.judgement, 1500),
                "commentary": self._truncate_content(case.commentary, 1000),
                "headnotes": self._truncate_content(case.headnotes, 1000),
                "keywords_phrases": self._truncate_content(case.keywords_phrases, 500),
                
                # Hearings
                "hearings": [
                    {
                        "hearing_date": hearing.hearing_date.isoformat() if hearing.hearing_date else None,
                        "hearing_time": hearing.hearing_time,
                        "coram": hearing.coram,
                        "remark": hearing.remark.value if hearing.remark else None,
                        "proceedings": hearing.proceedings
                    }
                    for hearing in hearings
                ],
                
                # Metadata (truncated to prevent token limit issues)
                "metadata": {
                    "case_type": metadata.case_type if metadata else None,
                    "keywords": self._truncate_content(metadata.keywords, 500) if metadata else None,
                    "judges": self._truncate_content(metadata.judges, 500) if metadata else None,
                    "lawyers": self._truncate_content(metadata.lawyers, 500) if metadata else None,
                    "related_people": self._truncate_content(metadata.related_people, 500) if metadata else None,
                    "organizations": self._truncate_content(metadata.organizations, 500) if metadata else None,
                    "banks_involved": self._truncate_content(metadata.banks_involved, 500) if metadata else None,
                    "insurance_involved": self._truncate_content(metadata.insurance_involved, 500) if metadata else None,
                    "resolution_status": metadata.resolution_status if metadata else None,
                    "outcome": metadata.outcome if metadata else None,
                    "decision_type": metadata.decision_type if metadata else None,
                    "monetary_amount": metadata.monetary_amount if metadata else None,
                    "statutes_cited": self._truncate_content(metadata.statutes_cited, 500) if metadata else None,
                    "cases_cited": self._truncate_content(metadata.cases_cited, 500) if metadata else None,
                    "relevance_score": metadata.relevance_score if metadata else None
                } if metadata else {}
            }
            
            return context
            
        except Exception as e:
            print(f"Error getting case context: {e}")
            return {"error": f"Failed to get case context: {str(e)}"}
    
    def generate_ai_response(self, case_id: int, user_message: str, chat_history: List[Dict] = None, 
                           session_id: str = None, user_id: str = None) -> Dict[str, Any]:
        """Generate AI response based on case context and user message"""
        start_time = datetime.utcnow()
        response_time_ms = None
        tokens_used = None
        ai_response = None
        error = None
        
        try:
            # Log session analytics
            self._log_session_analytics(session_id, case_id, "message_sent", {
                "user_message_length": len(user_message),
                "chat_history_length": len(chat_history) if chat_history else 0
            })
            
            # Get case context
            case_context = self.get_case_context(case_id)
            if "error" in case_context:
                error = case_context["error"]
                self._log_chat_interaction(
                    case_id=case_id,
                    user_message=user_message,
                    ai_response=None,
                    session_id=session_id,
                    user_id=user_id,
                    error=error
                )
                return case_context
            
            # Build system prompt
            system_prompt = self._build_system_prompt(case_context)
            
            # Build messages for OpenAI
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add chat history if provided
            if chat_history:
                for msg in chat_history[-10:]:  # Limit to last 10 messages
                    messages.append({
                        "role": "user" if msg["role"] == "user" else "assistant",
                        "content": msg["content"]
                    })
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Generate response
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=800,
                temperature=0.7,
                stream=False
            )
            
            # Calculate response time and token usage
            end_time = datetime.utcnow()
            response_time_ms = int((end_time - start_time).total_seconds() * 1000)
            tokens_used = response.usage.total_tokens if response.usage else None
            
            ai_response = response.choices[0].message.content
            
            # Log successful interaction
            self._log_chat_interaction(
                case_id=case_id,
                user_message=user_message,
                ai_response=ai_response,
                session_id=session_id,
                user_id=user_id,
                response_time_ms=response_time_ms,
                tokens_used=tokens_used
            )
            
            # Log usage statistics
            if tokens_used:
                self._log_usage_statistics(case_id, session_id, tokens_used, response_time_ms)
                
                # Track usage for billing
                self.usage_service.track_ai_usage(
                    user_id=user_id,
                    session_id=session_id,
                    endpoint="/api/ai-chat/message",
                    ai_model=self.model,
                    prompt_tokens=response.usage.prompt_tokens if response.usage else 0,
                    completion_tokens=response.usage.completion_tokens if response.usage else 0,
                    response_time_ms=response_time_ms,
                    query=user_message
                )
            
            return {
                "success": True,
                "response": ai_response,
                "case_context": case_context,
                "timestamp": datetime.utcnow().isoformat(),
                "response_time_ms": response_time_ms,
                "tokens_used": tokens_used
            }
            
        except Exception as e:
            error = f"Failed to generate AI response: {str(e)}"
            end_time = datetime.utcnow()
            response_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            # Log error interaction
            self._log_chat_interaction(
                case_id=case_id,
                user_message=user_message,
                ai_response=None,
                session_id=session_id,
                user_id=user_id,
                response_time_ms=response_time_ms,
                error=error
            )
            
            ai_chat_logger.error(f"Error generating AI response: {e}")
            return {
                "success": False,
                "error": error,
                "timestamp": datetime.utcnow().isoformat(),
                "response_time_ms": response_time_ms
            }
    
    def _get_region_name(self, region_code: str) -> str:
        """Convert region code to full region name"""
        region_mapping = {
            'gar': 'Greater Accra Region',
            'ash': 'Ashanti Region', 
            'wst': 'Western Region',
            'est': 'Eastern Region',
            'vol': 'Volta Region',
            'cen': 'Central Region',
            'brg': 'Brong-Ahafo Region',
            'nth': 'Northern Region',
            'upp': 'Upper East Region',
            'uww': 'Upper West Region'
        }
        return region_mapping.get(region_code.lower(), region_code)

    def _build_system_prompt(self, case_context: Dict[str, Any]) -> str:
        """Build comprehensive system prompt for AI chat"""
        region = case_context.get('region', 'N/A')
        town = case_context.get('town', 'N/A')
        
        # Convert region code to full name if it's a code
        if region and region != 'N/A' and len(region) <= 4:
            region = self._get_region_name(region)
        
        return f"""You are an expert legal AI assistant specializing in Ghanaian law and financial legal matters. You are analyzing the following case and providing expert legal and financial insights.

IMPORTANT: Always use the specific region and town information provided in the case details below. Do not make assumptions about the location based on court type or other information.

CASE INFORMATION:
Title: {case_context.get('title', 'N/A')}
Case Number: {case_context.get('suit_reference_number', 'N/A')}
Date: {case_context.get('date', 'N/A')}
Court: {case_context.get('court_type', 'N/A')} - {case_context.get('court_division', 'N/A')}
Region: {region}
Town: {town}
Area of Law: {case_context.get('area_of_law', 'N/A')}
Status: {case_context.get('status', 'N/A')}

PARTIES:
Protagonist: {case_context.get('protagonist', 'N/A')}
Antagonist: {case_context.get('antagonist', 'N/A')}
Lawyers: {case_context.get('lawyers', 'N/A')}
Presiding Judge: {case_context.get('presiding_judge', 'N/A')}

CASE CONTENT:
Summary: {case_context.get('case_summary', 'N/A')}
Decision: {case_context.get('decision', 'N/A')}
Judgement: {case_context.get('judgement', 'N/A')}
Commentary: {case_context.get('commentary', 'N/A')}
Headnotes: {case_context.get('headnotes', 'N/A')}

FINANCIAL/LEGAL METADATA:
Monetary Amount: {case_context.get('metadata', {}).get('monetary_amount', 'N/A')}
Resolution Status: {case_context.get('metadata', {}).get('resolution_status', 'N/A')}
Outcome: {case_context.get('metadata', {}).get('outcome', 'N/A')}
Decision Type: {case_context.get('metadata', {}).get('decision_type', 'N/A')}
Banks Involved: {case_context.get('metadata', {}).get('banks_involved', 'N/A')}
Insurance Involved: {case_context.get('metadata', {}).get('insurance_involved', 'N/A')}

HEARINGS:
{self._format_hearings(case_context.get('hearings', []))}

Your role is to:
1. Provide expert legal analysis of the case
2. Explain financial implications and risks
3. Suggest legal strategies and precedents
4. Answer questions about case law and legal principles
5. Provide insights on potential outcomes and next steps
6. Explain complex legal concepts in simple terms
7. Identify key legal and financial risks
8. Suggest relevant statutes and regulations

Always base your responses on the specific case details provided and Ghanaian law. Be thorough, accurate, and professional in your analysis."""
    
    def _format_hearings(self, hearings: List[Dict]) -> str:
        """Format hearings for system prompt"""
        if not hearings:
            return "No hearings recorded"
        
        formatted = []
        for hearing in hearings:
            formatted.append(f"- Date: {hearing.get('hearing_date', 'N/A')}, Time: {hearing.get('hearing_time', 'N/A')}, Coram: {hearing.get('coram', 'N/A')}, Remark: {hearing.get('remark', 'N/A')}")
        
        return "\n".join(formatted)
    
    def generate_case_summary(self, case_id: int, session_id: str = None, user_id: str = None) -> Dict[str, Any]:
        """Generate a comprehensive case summary for quick reference"""
        start_time = datetime.utcnow()
        response_time_ms = None
        tokens_used = None
        summary = None
        error = None
        
        try:
            # Log summary generation analytics
            self._log_session_analytics(session_id, case_id, "summary_requested", {
                "case_title": "Case Summary Generation"
            })
            
            case_context = self.get_case_context(case_id)
            if "error" in case_context:
                error = case_context["error"]
                self._log_chat_interaction(
                    case_id=case_id,
                    user_message="Generate case summary",
                    ai_response=None,
                    session_id=session_id,
                    user_id=user_id,
                    error=error
                )
                return case_context
            
            system_prompt = f"""You are a legal expert. Provide a comprehensive summary of this case in 3-4 paragraphs covering:
1. Case overview and key facts
2. Legal issues and arguments
3. Financial implications and risks
4. Potential outcomes and recommendations

Case: {case_context.get('title', 'N/A')}
Parties: {case_context.get('protagonist', 'N/A')} vs {case_context.get('antagonist', 'N/A')}
Area of Law: {case_context.get('area_of_law', 'N/A')}
Court: {case_context.get('court_type', 'N/A')}"""
            
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Please provide a comprehensive summary of this case: {case_context.get('case_summary', 'N/A')}"}
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            # Calculate response time and token usage
            end_time = datetime.utcnow()
            response_time_ms = int((end_time - start_time).total_seconds() * 1000)
            tokens_used = response.usage.total_tokens if response.usage else None
            
            summary = response.choices[0].message.content
            
            # Log successful summary generation
            self._log_chat_interaction(
                case_id=case_id,
                user_message="Generate case summary",
                ai_response=summary,
                session_id=session_id,
                user_id=user_id,
                response_time_ms=response_time_ms,
                tokens_used=tokens_used
            )
            
            # Log usage statistics
            if tokens_used:
                self._log_usage_statistics(case_id, session_id, tokens_used, response_time_ms)
                
                # Track usage for billing
                self.usage_service.track_ai_usage(
                    user_id=user_id,
                    session_id=session_id,
                    endpoint="/api/ai-chat/case-summary",
                    ai_model=self.model,
                    prompt_tokens=response.usage.prompt_tokens if response.usage else 0,
                    completion_tokens=response.usage.completion_tokens if response.usage else 0,
                    response_time_ms=response_time_ms,
                    query="Generate case summary"
                )
            
            return {
                "success": True,
                "summary": summary,
                "timestamp": datetime.utcnow().isoformat(),
                "response_time_ms": response_time_ms,
                "tokens_used": tokens_used
            }
            
        except Exception as e:
            error = f"Failed to generate case summary: {str(e)}"
            end_time = datetime.utcnow()
            response_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            # Log error
            self._log_chat_interaction(
                case_id=case_id,
                user_message="Generate case summary",
                ai_response=None,
                session_id=session_id,
                user_id=user_id,
                response_time_ms=response_time_ms,
                error=error
            )
            
            ai_chat_logger.error(f"Error generating case summary: {e}")
            return {
                "success": False,
                "error": error,
                "timestamp": datetime.utcnow().isoformat(),
                "response_time_ms": response_time_ms
            }

