from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import logging

from database import get_db
from services.gazette_ai_service import GazetteAIService
from services.usage_tracking_service import UsageTrackingService
from models.usage_tracking import UsageTracking

router = APIRouter(prefix="/gazette-ai-chat", tags=["gazette-ai-chat"])
logger = logging.getLogger(__name__)

class ChatMessageRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class ChatMessageResponse(BaseModel):
    success: bool
    response: str
    search_results: List[Dict[str, Any]] = []
    search_params: Optional[Dict[str, Any]] = None
    tokens_used: Optional[int] = None
    response_time_ms: Optional[int] = None
    error: Optional[str] = None

@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_gazette_ai(
    message_data: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Chat with AI about gazette entries"""
    try:
        if not message_data.message or not message_data.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # Initialize AI service
        ai_service = GazetteAIService(db)
        
        # Generate AI response
        result = ai_service.generate_ai_response(
            user_message=message_data.message.strip(),
            chat_history=message_data.chat_history or [],
            session_id=None  # Could implement session tracking later
        )
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "AI service error")
            )
        
        return ChatMessageResponse(
            success=True,
            response=result.get("response", ""),
            search_results=result.get("search_results", []),
            search_params=result.get("search_params"),
            tokens_used=result.get("tokens_used"),
            response_time_ms=result.get("response_time_ms"),
            error=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )

class ChatHistoryRequest(BaseModel):
    messages: List[Dict[str, Any]]
    session_id: Optional[str] = None

class ChatHistoryResponse(BaseModel):
    success: bool
    message: str
    session_id: Optional[str] = None

class UsageStatsResponse(BaseModel):
    success: bool
    stats: Dict[str, Any]
    error: Optional[str] = None

@router.post("/history/save", response_model=ChatHistoryResponse)
async def save_chat_history(
    history_data: ChatHistoryRequest,
    db: Session = Depends(get_db)
):
    """Save chat history (currently uses localStorage on frontend, but API is available)"""
    try:
        # For now, we'll just acknowledge the save
        # In the future, could store in database with session_id
        session_id = history_data.session_id or f"gazette_ai_{datetime.utcnow().isoformat()}"
        
        return ChatHistoryResponse(
            success=True,
            message="Chat history saved successfully",
            session_id=session_id
        )
    except Exception as e:
        logger.error(f"Error saving chat history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving chat history: {str(e)}"
        )

@router.delete("/history/clear")
async def clear_chat_history(
    session_id: Optional[str] = Query(None, description="Optional session ID to clear")
):
    """Clear chat history"""
    try:
        # For now, this is handled on frontend with localStorage
        # In the future, could delete from database
        return {
            "success": True,
            "message": "Chat history cleared successfully"
        }
    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing chat history: {str(e)}"
        )

@router.get("/usage", response_model=UsageStatsResponse)
async def get_usage_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    user_id: Optional[int] = Query(None, description="Optional user ID to filter by"),
    db: Session = Depends(get_db)
):
    """Get usage statistics for gazette AI chat"""
    try:
        usage_service = UsageTrackingService(db)
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Build query for gazette AI chat usage
        query = db.query(UsageTracking).filter(
            UsageTracking.created_at >= start_date,
            UsageTracking.created_at <= end_date,
            UsageTracking.resource_type == "ai_chat"
        ).filter(
            UsageTracking.endpoint.like("%gazette-ai-chat%")
        )
        
        # Filter by user if provided
        if user_id:
            query = query.filter(UsageTracking.user_id == user_id)
        
        usage_records = query.all()
        
        # Calculate statistics
        total_requests = len(usage_records)
        total_tokens = sum(record.tokens_used or 0 for record in usage_records)
        total_cost = sum(record.estimated_cost or 0.0 for record in usage_records)
        avg_response_time = sum(record.response_time_ms or 0 for record in usage_records) / total_requests if total_requests > 0 else 0
        
        # Get token breakdown
        prompt_tokens = sum(record.prompt_tokens or 0 for record in usage_records)
        completion_tokens = sum(record.completion_tokens or 0 for record in usage_records)
        
        # Get daily breakdown
        daily_usage = {}
        for record in usage_records:
            date_key = record.created_at.date().isoformat() if record.created_at else "unknown"
            if date_key not in daily_usage:
                daily_usage[date_key] = {
                    "requests": 0,
                    "tokens": 0,
                    "cost": 0.0
                }
            daily_usage[date_key]["requests"] += 1
            daily_usage[date_key]["tokens"] += record.tokens_used or 0
            daily_usage[date_key]["cost"] += record.estimated_cost or 0.0
        
        stats = {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "overview": {
                "total_requests": total_requests,
                "total_tokens": total_tokens,
                "total_cost": round(total_cost, 4),
                "average_tokens_per_request": round(total_tokens / total_requests, 2) if total_requests > 0 else 0,
                "average_cost_per_request": round(total_cost / total_requests, 4) if total_requests > 0 else 0,
                "average_response_time_ms": round(avg_response_time, 2)
            },
            "tokens": {
                "total": total_tokens,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "average_per_request": round(total_tokens / total_requests, 2) if total_requests > 0 else 0
            },
            "daily_usage": [
                {
                    "date": date,
                    "requests": data["requests"],
                    "tokens": data["tokens"],
                    "cost": round(data["cost"], 4)
                }
                for date, data in sorted(daily_usage.items())
            ]
        }
        
        return UsageStatsResponse(
            success=True,
            stats=stats,
            error=None
        )
        
    except Exception as e:
        logger.error(f"Error getting usage stats: {str(e)}")
        return UsageStatsResponse(
            success=False,
            stats={},
            error=str(e)
        )
