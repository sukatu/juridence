"""
Middleware for automatic usage tracking on all API endpoints
"""

import time
import json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from database import get_db
from services.usage_tracking_service import UsageTrackingService
from auth import get_user_from_token
import logging

class UsageTrackingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.tracked_endpoints = {
            # Search endpoints
            "/api/search/unified": "search",
            "/api/search/quick": "search",
            "/api/search/advanced": "search",
            "/api/people/search": "search",
            "/api/banks/search": "search",
            "/api/insurance/search": "search",
            "/api/companies/search": "search",
            "/api/case-search/search": "search",
            
            # AI Chat endpoints
            "/api/ai-chat/sessions": "ai_chat",
            "/api/ai-chat/message": "ai_chat",
            "/api/ai-chat/case-summary": "ai_chat",
            
            # API endpoints
            "/api/people": "api_call",
            "/api/banks": "api_call",
            "/api/insurance": "api_call",
            "/api/companies": "api_call",
            "/api/cases": "api_call",
        }
    
    async def dispatch(self, request: Request, call_next):
        # Check if this endpoint should be tracked
        if not self._should_track_endpoint(request.url.path):
            return await call_next(request)
        
        # Extract user information
        user_id = None
        session_id = None
        
        try:
            # Try to get user from token
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                user_id = get_user_from_token(token)
        except Exception as e:
            logging.debug(f"Could not extract user from token: {e}")
        
        # Generate session ID if not present
        session_id = request.headers.get("x-session-id")
        if not session_id:
            session_id = f"session_{int(time.time())}_{hash(request.client.host) % 10000}"
        
        # Start timing
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Track usage if response was successful
        if response.status_code < 400:
            try:
                db = next(get_db())
                usage_service = UsageTrackingService(db)
                
                # Extract request data
                request_data = await self._extract_request_data(request)
                
                # Determine resource type
                resource_type = self.tracked_endpoints.get(request.url.path, "api_call")
                
                # Track the usage
                usage_service.track_usage(
                    user_id=user_id,
                    session_id=session_id,
                    endpoint=request.url.path,
                    method=request.method,
                    resource_type=resource_type,
                    response_time_ms=response_time_ms,
                    query=request_data.get("query"),
                    filters_applied=request_data.get("filters"),
                    results_count=request_data.get("results_count"),
                    ip_address=request.client.host,
                    user_agent=request.headers.get("user-agent"),
                    referer=request.headers.get("referer")
                )
                
            except Exception as e:
                logging.error(f"Error tracking usage: {e}")
        
        return response
    
    def _should_track_endpoint(self, path: str) -> bool:
        """Check if endpoint should be tracked"""
        # Track specific endpoints
        if path in self.tracked_endpoints:
            return True
        
        # Track API endpoints that start with /api/
        if path.startswith("/api/") and not path.startswith("/api/docs"):
            return True
        
        return False
    
    async def _extract_request_data(self, request: Request) -> dict:
        """Extract relevant data from request for tracking"""
        data = {}
        
        try:
            # Get query parameters
            if request.query_params:
                data["query"] = request.query_params.get("query") or request.query_params.get("q")
                
                # Extract filters
                filters = {}
                for key, value in request.query_params.items():
                    if key not in ["query", "q", "page", "limit", "sort_by", "sort_order"]:
                        filters[key] = value
                if filters:
                    data["filters"] = filters
            
            # For POST requests, try to get body data
            if request.method == "POST":
                try:
                    body = await request.body()
                    if body:
                        body_data = json.loads(body)
                        if "query" in body_data:
                            data["query"] = body_data["query"]
                        if "filters" in body_data:
                            data["filters"] = body_data["filters"]
                except:
                    pass
        
        except Exception as e:
            logging.debug(f"Error extracting request data: {e}")
        
        return data
