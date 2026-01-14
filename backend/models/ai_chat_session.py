from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from database import Base

class AIChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Session identification
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    case_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Optional user ID if authenticated
    
    # Session metadata
    title = Column(String(255), nullable=True)  # Optional session title
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Chat data
    messages = Column(JSON, nullable=True)  # Array of message objects
    total_messages = Column(Integer, default=0, nullable=False)
    
    # AI context
    case_context_snapshot = Column(JSON, nullable=True)  # Snapshot of case context when session started
    ai_model_used = Column(String(100), nullable=True)  # e.g., "gpt-4"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Session settings
    settings = Column(JSON, nullable=True)  # Custom settings for the session

