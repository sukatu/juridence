from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = Field(None, description="Message timestamp")

class ChatSessionCreate(BaseModel):
    case_id: int = Field(..., description="Case ID for the chat session")
    title: Optional[str] = Field(None, description="Optional session title")
    user_id: Optional[int] = Field(None, description="User ID if authenticated")

class ChatSessionResponse(BaseModel):
    id: int
    session_id: str
    case_id: int
    user_id: Optional[int]
    title: Optional[str]
    is_active: bool
    total_messages: int
    created_at: datetime
    updated_at: datetime
    last_activity: datetime
    messages: Optional[List[ChatMessage]] = None

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    session_id: Optional[str] = Field(None, description="Existing session ID, if continuing a conversation")

class ChatMessageResponse(BaseModel):
    success: bool
    message: Optional[ChatMessage] = None
    session_id: Optional[str] = None
    error: Optional[str] = None
    case_context: Optional[Dict[str, Any]] = None

class CaseSummaryRequest(BaseModel):
    case_id: int = Field(..., description="Case ID to generate summary for")

class CaseSummaryResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    error: Optional[str] = None
    timestamp: Optional[datetime] = None

class ChatSessionListResponse(BaseModel):
    sessions: List[ChatSessionResponse]
    total: int
    page: int
    limit: int
    total_pages: int

