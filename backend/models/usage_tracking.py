"""
Usage tracking models for comprehensive billing and analytics
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
from typing import Optional, Dict, Any

class UsageTracking(Base):
    __tablename__ = "usage_tracking"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    
    # Request details
    endpoint = Column(String(255), nullable=False, index=True)
    method = Column(String(10), nullable=False)
    resource_type = Column(String(100), nullable=False, index=True)  # search, ai_chat, api_call, etc.
    
    # Usage metrics
    tokens_used = Column(Integer, nullable=True, default=0)
    api_calls = Column(Integer, nullable=True, default=1)
    response_time_ms = Column(Integer, nullable=True)
    data_processed = Column(Integer, nullable=True)  # bytes or records processed
    
    # Cost calculation
    estimated_cost = Column(Float, nullable=True, default=0.0)
    cost_per_token = Column(Float, nullable=True, default=0.0)
    cost_per_api_call = Column(Float, nullable=True, default=0.0)
    
    # Request metadata
    query = Column(Text, nullable=True)  # Search query or AI prompt
    filters_applied = Column(JSON, nullable=True)  # Search filters used
    results_count = Column(Integer, nullable=True)  # Number of results returned
    
    # AI-specific fields
    ai_model = Column(String(100), nullable=True)
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    
    # Request context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    referer = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="usage_records")

class BillingSummary(Base):
    __tablename__ = "billing_summary"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Time period
    billing_period_start = Column(DateTime(timezone=True), nullable=False)
    billing_period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Usage totals
    total_tokens = Column(Integer, nullable=False, default=0)
    total_api_calls = Column(Integer, nullable=False, default=0)
    total_searches = Column(Integer, nullable=False, default=0)
    total_ai_sessions = Column(Integer, nullable=False, default=0)
    
    # Cost breakdown
    total_cost = Column(Float, nullable=False, default=0.0)
    ai_chat_cost = Column(Float, nullable=False, default=0.0)
    search_cost = Column(Float, nullable=False, default=0.0)
    api_cost = Column(Float, nullable=False, default=0.0)
    
    # Rate information
    tokens_per_search = Column(Float, nullable=True)
    cost_per_search = Column(Float, nullable=True)
    avg_response_time = Column(Float, nullable=True)
    
    # Status
    is_billed = Column(Boolean, default=False, nullable=False)
    billing_date = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="billing_summaries")
