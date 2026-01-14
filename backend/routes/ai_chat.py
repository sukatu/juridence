from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

from database import get_db
from models.ai_chat_session import AIChatSession
from models.reported_cases import ReportedCases
from schemas.ai_chat import (
    ChatSessionCreate, ChatSessionResponse, ChatMessageRequest, 
    ChatMessageResponse, CaseSummaryRequest, CaseSummaryResponse,
    ChatSessionListResponse, ChatMessage
)
from services.ai_chat_service import AIChatService
from services.usage_tracking_service import UsageTrackingService

router = APIRouter(prefix="/ai-chat", tags=["ai-chat"])

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db)
    # Temporarily disabled authentication for testing
    # current_user = Depends(get_current_user)
):
    """Create a new AI chat session for a case"""
    try:
        # Verify case exists
        case = db.query(ReportedCases).filter(ReportedCases.id == session_data.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Create new session
        session_id = str(uuid.uuid4())
        new_session = AIChatSession(
            session_id=session_id,
            case_id=session_data.case_id,
            user_id=session_data.user_id,
            title=session_data.title or f"Chat for {case.title[:50]}...",
            is_active=True,
            messages=[],
            total_messages=0,
            ai_model_used="gpt-4"
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        # Log session creation analytics
        ai_service = AIChatService(db)
        ai_service._log_session_analytics(
            session_id=session_id,
            case_id=session_data.case_id,
            action="session_started",
            additional_data={
                "case_title": case.title,
                "user_id": session_data.user_id,
                "ai_model": "gpt-4"
            }
        )
        
        return new_session
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating chat session: {str(e)}")

@router.get("/sessions", response_model=ChatSessionListResponse)
async def get_chat_sessions(
    case_id: Optional[int] = Query(None, description="Filter by case ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get chat sessions with optional filtering"""
    try:
        query = db.query(AIChatSession).filter(AIChatSession.is_active == True)
        
        if case_id:
            query = query.filter(AIChatSession.case_id == case_id)
        if user_id:
            query = query.filter(AIChatSession.user_id == user_id)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        sessions = query.order_by(AIChatSession.last_activity.desc()).offset(offset).limit(limit).all()
        
        # Convert to response format
        session_responses = []
        for session in sessions:
            messages = []
            if session.messages:
                for msg in session.messages:
                    messages.append(ChatMessage(
                        role=msg.get("role", "user"),
                        content=msg.get("content", ""),
                        timestamp=datetime.fromisoformat(msg.get("timestamp", datetime.utcnow().isoformat()))
                    ))
            
            session_responses.append(ChatSessionResponse(
                id=session.id,
                session_id=session.session_id,
                case_id=session.case_id,
                user_id=session.user_id,
                title=session.title,
                is_active=session.is_active,
                total_messages=session.total_messages,
                created_at=session.created_at,
                updated_at=session.updated_at,
                last_activity=session.last_activity,
                messages=messages
            ))
        
        total_pages = (total + limit - 1) // limit
        
        return ChatSessionListResponse(
            sessions=session_responses,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat sessions: {str(e)}")

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific chat session by ID"""
    try:
        session = db.query(AIChatSession).filter(
            AIChatSession.session_id == session_id,
            AIChatSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Convert messages
        messages = []
        if session.messages:
            for msg in session.messages:
                messages.append(ChatMessage(
                    role=msg.get("role", "user"),
                    content=msg.get("content", ""),
                    timestamp=datetime.fromisoformat(msg.get("timestamp", datetime.utcnow().isoformat()))
                ))
        
        return ChatSessionResponse(
            id=session.id,
            session_id=session.session_id,
            case_id=session.case_id,
            user_id=session.user_id,
            title=session.title,
            is_active=session.is_active,
            total_messages=session.total_messages,
            created_at=session.created_at,
            updated_at=session.updated_at,
            last_activity=session.last_activity,
            messages=messages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat session: {str(e)}")

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    message_data: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Send a message to an AI chat session"""
    try:
        # Get session
        session = db.query(AIChatSession).filter(
            AIChatSession.session_id == session_id,
            AIChatSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Initialize AI service
        ai_service = AIChatService(db)
        
        # Get chat history
        chat_history = session.messages or []
        
        # Generate AI response with logging parameters
        ai_response = ai_service.generate_ai_response(
            case_id=session.case_id,
            user_message=message_data.message,
            chat_history=chat_history,
            session_id=session_id,
            user_id=session.user_id
        )
        
        if not ai_response.get("success", False):
            raise HTTPException(
                status_code=500, 
                detail=f"AI service error: {ai_response.get('error', 'Unknown error')}"
            )
        
        # Create message objects
        user_message = {
            "role": "user",
            "content": message_data.message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        ai_message = {
            "role": "assistant",
            "content": ai_response["response"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Update session with new messages
        session.messages = chat_history + [user_message, ai_message]
        session.total_messages = len(session.messages)
        session.last_activity = datetime.utcnow()
        
        db.commit()
        
        return ChatMessageResponse(
            success=True,
            message=ChatMessage(
                role="assistant",
                content=ai_response["response"],
                timestamp=datetime.fromisoformat(ai_message["timestamp"])
            ),
            session_id=session_id,
            case_context=ai_response.get("case_context")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@router.post("/sessions/{case_id}/start", response_model=ChatMessageResponse)
async def start_new_chat(
    case_id: int,
    message_data: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Start a new chat session and send the first message"""
    try:
        # Verify case exists
        case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Create new session
        session_id = str(uuid.uuid4())
        new_session = AIChatSession(
            session_id=session_id,
            case_id=case_id,
            user_id=1,  # Default user for testing
            title=f"Chat for {case.title[:50]}...",
            is_active=True,
            messages=[],
            total_messages=0,
            ai_model_used="gpt-4"
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        # Initialize AI service
        ai_service = AIChatService(db)
        
        # Generate AI response
        ai_response = ai_service.generate_ai_response(
            case_id=case_id,
            user_message=message_data.message,
            chat_history=[]
        )
        
        if not ai_response.get("success", False):
            raise HTTPException(
                status_code=500, 
                detail=f"AI service error: {ai_response.get('error', 'Unknown error')}"
            )
        
        # Create message objects
        user_message = {
            "role": "user",
            "content": message_data.message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        ai_message = {
            "role": "assistant",
            "content": ai_response["response"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Update session with messages
        new_session.messages = [user_message, ai_message]
        new_session.total_messages = 2
        new_session.last_activity = datetime.utcnow()
        
        db.commit()
        
        return ChatMessageResponse(
            success=True,
            message=ChatMessage(
                role="assistant",
                content=ai_response["response"],
                timestamp=datetime.fromisoformat(ai_message["timestamp"])
            ),
            session_id=session_id,
            case_context=ai_response.get("case_context")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error starting new chat: {str(e)}")

@router.post("/case-summary", response_model=CaseSummaryResponse)
async def generate_case_summary(
    summary_data: CaseSummaryRequest,
    db: Session = Depends(get_db)
):
    """Generate a comprehensive AI summary of a case"""
    try:
        # Verify case exists
        case = db.query(ReportedCases).filter(ReportedCases.id == summary_data.case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Initialize AI service
        ai_service = AIChatService(db)
        
        # Generate summary with logging parameters
        # For testing purposes, use a default user ID if none provided
        user_id = summary_data.user_id if hasattr(summary_data, 'user_id') and summary_data.user_id else 1
        
        summary_result = ai_service.generate_case_summary(
            case_id=summary_data.case_id,
            session_id=None,  # No session for direct summary requests
            user_id=user_id
        )
        
        if not summary_result.get("success", False):
            raise HTTPException(
                status_code=500, 
                detail=f"AI service error: {summary_result.get('error', 'Unknown error')}"
            )
        
        return CaseSummaryResponse(
            success=True,
            summary=summary_result["summary"],
            timestamp=datetime.fromisoformat(summary_result["timestamp"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating case summary: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Delete a chat session (soft delete)"""
    try:
        session = db.query(AIChatSession).filter(
            AIChatSession.session_id == session_id,
            AIChatSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Soft delete
        session.is_active = False
        session.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log session ending analytics
        ai_service = AIChatService(db)
        ai_service._log_session_analytics(
            session_id=session_id,
            case_id=session.case_id,
            action="session_ended",
            additional_data={
                "total_messages": session.total_messages,
                "session_duration": "calculated_from_created_at",
                "user_id": session.user_id
            }
        )
        
        return {"success": True, "message": "Chat session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting chat session: {str(e)}")

@router.get("/analytics/usage", response_model=Dict[str, Any])
async def get_usage_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get AI chat usage analytics for reporting"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get basic session statistics
        total_sessions = db.query(AIChatSession).filter(
            AIChatSession.created_at >= start_date,
            AIChatSession.created_at <= end_date
        ).count()
        
        active_sessions = db.query(AIChatSession).filter(
            AIChatSession.is_active == True,
            AIChatSession.created_at >= start_date,
            AIChatSession.created_at <= end_date
        ).count()
        
        # Get total messages across all sessions
        sessions_with_messages = db.query(AIChatSession).filter(
            AIChatSession.created_at >= start_date,
            AIChatSession.created_at <= end_date,
            AIChatSession.total_messages > 0
        ).all()
        
        total_messages = sum(session.total_messages or 0 for session in sessions_with_messages)
        
        # Get most active cases
        case_activity = db.query(
            AIChatSession.case_id,
            func.count(AIChatSession.id).label('session_count'),
            func.sum(AIChatSession.total_messages).label('total_messages')
        ).filter(
            AIChatSession.created_at >= start_date,
            AIChatSession.created_at <= end_date
        ).group_by(AIChatSession.case_id).order_by(desc('session_count')).limit(10).all()
        
        # Get daily usage trends
        daily_usage = db.query(
            func.date(AIChatSession.created_at).label('date'),
            func.count(AIChatSession.id).label('sessions'),
            func.sum(AIChatSession.total_messages).label('messages')
        ).filter(
            AIChatSession.created_at >= start_date,
            AIChatSession.created_at <= end_date
        ).group_by(func.date(AIChatSession.created_at)).order_by('date').all()
        
        # Get AI model usage
        model_usage = db.query(
            AIChatSession.ai_model_used,
            func.count(AIChatSession.id).label('count')
        ).filter(
            AIChatSession.created_at >= start_date,
            AIChatSession.created_at <= end_date
        ).group_by(AIChatSession.ai_model_used).all()
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "overview": {
                "total_sessions": total_sessions,
                "active_sessions": active_sessions,
                "total_messages": total_messages,
                "average_messages_per_session": round(total_messages / total_sessions, 2) if total_sessions > 0 else 0
            },
            "most_active_cases": [
                {
                    "case_id": case_id,
                    "session_count": session_count,
                    "total_messages": total_messages
                }
                for case_id, session_count, total_messages in case_activity
            ],
            "daily_usage": [
                {
                    "date": date.isoformat(),
                    "sessions": sessions,
                    "messages": messages or 0
                }
                for date, sessions, messages in daily_usage
            ],
            "model_usage": [
                {
                    "model": model,
                    "count": count
                }
                for model, count in model_usage
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@router.get("/analytics/session/{session_id}", response_model=Dict[str, Any])
async def get_session_analytics(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed analytics for a specific chat session"""
    try:
        session = db.query(AIChatSession).filter(
            AIChatSession.session_id == session_id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Calculate session duration
        duration = None
        if session.last_activity and session.created_at:
            duration = (session.last_activity - session.created_at).total_seconds()
        
        # Get case information
        case = db.query(ReportedCases).filter(ReportedCases.id == session.case_id).first()
        
        return {
            "session_id": session.session_id,
            "case_id": session.case_id,
            "case_title": case.title if case else "Unknown Case",
            "user_id": session.user_id,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat() if session.last_activity else None,
            "duration_seconds": duration,
            "total_messages": session.total_messages,
            "ai_model_used": session.ai_model_used,
            "is_active": session.is_active,
            "interaction_logs": getattr(session, 'interaction_logs', [])[-10:]  # Last 10 interactions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting session analytics: {str(e)}")

@router.get("/analytics/users", response_model=Dict[str, Any])
async def get_user_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get user-specific AI chat analytics and token usage for billing"""
    try:
        usage_service = UsageTrackingService(db)
        
        # Get ALL users from the database, not just those with usage records
        from models.user import User
        all_users = db.query(User).all()
        
        user_analytics = []
        for user in all_users:
            try:
                # Get usage summary for this user (will return empty data if no usage)
                user_summary = usage_service.get_user_usage_summary(user.id, days)
                user_analytics.append({
                    "user_id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "organization": user.organization,
                    "subscription_plan": user.subscription_plan,
                    "is_premium": user.is_premium,
                    "role": user.role,
                    "status": user.status,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    **user_summary
                })
            except Exception as e:
                logging.error(f"Error getting analytics for user {user.id}: {e}")
                # Still include the user even if usage data fails
                user_analytics.append({
                    "user_id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "organization": user.organization,
                    "subscription_plan": user.subscription_plan,
                    "is_premium": user.is_premium,
                    "role": user.role,
                    "status": user.status,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "totals": {
                        "total_records": 0,
                        "total_tokens": 0,
                        "total_api_calls": 0,
                        "total_cost": 0.0
                    },
                    "by_resource_type": {},
                    "daily_usage": []
                })
                continue
        
        # Sort by total cost (users with no usage will be at the bottom)
        user_analytics.sort(key=lambda x: x["totals"]["total_cost"], reverse=True)
        
        # Calculate summary statistics
        total_users = len(user_analytics)
        total_tokens = sum(user["totals"]["total_tokens"] for user in user_analytics)
        total_cost = sum(user["totals"]["total_cost"] for user in user_analytics)
        
        return {
            "period": {
                "days": days
            },
            "summary": {
                "total_users": total_users,
                "total_tokens": total_tokens,
                "total_estimated_cost": round(total_cost, 4),
                "average_tokens_per_user": round(total_tokens / total_users, 2) if total_users > 0 else 0,
                "average_cost_per_user": round(total_cost / total_users, 4) if total_users > 0 else 0
            },
            "users": user_analytics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating user analytics: {str(e)}")

