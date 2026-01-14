"""
Logging middleware for FastAPI to automatically log requests and responses
"""

import time
import uuid
from jose import jwt
from fastapi import Request, Response
from fastapi.responses import StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from database import get_db
from services.logging_service import LoggingService
from models.logs import ActivityType, LogLevel
from config import settings

class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # Generate session ID if not present
        session_id = request.headers.get("x-session-id")
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Get user ID from token if available
        user_id = None
        try:
            # Extract JWT token from Authorization header
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                
                # Decode JWT token using the correct secret key and algorithm
                try:
                    decoded = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
                    user_id = decoded.get("sub")  # JWT uses "sub" for user ID
                except jwt.InvalidTokenError:
                    # If verification fails, try without verification for logging purposes
                    try:
                        decoded = jwt.decode(token, options={"verify_signature": False})
                        user_id = decoded.get("sub")  # JWT uses "sub" for user ID
                    except:
                        pass
        except Exception as e:
            # Don't let token parsing errors break the request
            print(f"Error extracting user ID from token: {e}")
            pass
        
        # Start timing
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        process_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        
        # Log the request
        try:
            db = next(get_db())
            logging_service = LoggingService(db)
            
            # Log access
            logging_service.log_access(
                request=request,
                response=response,
                user_id=user_id,
                session_id=session_id,
                response_time=process_time
            )
            
            # Log activity for certain endpoints
            if self.should_log_activity(request):
                activity_type = self.get_activity_type(request)
                action = self.get_action_description(request)
                
                logging_service.log_activity(
                    user_id=user_id,
                    activity_type=activity_type,
                    action=action,
                    description=f"{request.method} {request.url.path}",
                    resource_type=self.get_resource_type(request),
                    resource_id=self.get_resource_id(request),
                    session_id=session_id,
                    ip_address=request.client.host,
                    user_agent=request.headers.get("user-agent"),
                    metadata={
                        "endpoint": request.url.path,
                        "method": request.method,
                        "status_code": response.status_code,
                        "response_time": process_time
                    }
                )
            
            # Log errors for 4xx and 5xx responses
            if response.status_code >= 400:
                logging_service.log_error(
                    user_id=user_id,
                    error_type=f"HTTP_{response.status_code}",
                    error_message=f"Request failed with status {response.status_code}",
                    url=str(request.url),
                    method=request.method,
                    status_code=response.status_code,
                    session_id=session_id,
                    ip_address=request.client.host,
                    user_agent=request.headers.get("user-agent"),
                    severity=LogLevel.ERROR if response.status_code >= 500 else LogLevel.WARNING
                )
            
            db.close()
        except Exception as e:
            # Don't let logging errors break the request
            print(f"Error in logging middleware: {e}")
        
        # Add session ID to response headers
        response.headers["x-session-id"] = session_id
        
        return response
    
    def should_log_activity(self, request: Request) -> bool:
        """Determine if this request should be logged as an activity"""
        # Skip static files and health checks
        skip_paths = [
            "/static/",
            "/favicon.ico",
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc"
        ]
        
        path = request.url.path
        return not any(path.startswith(skip) for skip in skip_paths)
    
    def get_activity_type(self, request: Request) -> ActivityType:
        """Determine the activity type based on the request"""
        method = request.method.upper()
        path = request.url.path.lower()
        
        if method == "GET":
            if "/login" in path:
                return ActivityType.LOGIN
            elif "/logout" in path:
                return ActivityType.LOGOUT
            elif "/search" in path:
                return ActivityType.SEARCH
            else:
                return ActivityType.VIEW
        elif method == "POST":
            if "/login" in path:
                return ActivityType.LOGIN
            elif "/logout" in path:
                return ActivityType.LOGOUT
            elif "/upload" in path:
                return ActivityType.UPLOAD
            else:
                return ActivityType.CREATE
        elif method == "PUT":
            return ActivityType.UPDATE
        elif method == "DELETE":
            return ActivityType.DELETE
        else:
            return ActivityType.API_CALL
    
    def get_action_description(self, request: Request) -> str:
        """Get a human-readable action description"""
        method = request.method.upper()
        path = request.url.path
        
        if method == "GET":
            if "/login" in path:
                return "User login attempt"
            elif "/logout" in path:
                return "User logout"
            elif "/search" in path:
                return "Search performed"
            else:
                return f"Viewed {path}"
        elif method == "POST":
            if "/login" in path:
                return "User logged in"
            elif "/logout" in path:
                return "User logged out"
            elif "/upload" in path:
                return "File uploaded"
            else:
                return f"Created resource at {path}"
        elif method == "PUT":
            return f"Updated resource at {path}"
        elif method == "DELETE":
            return f"Deleted resource at {path}"
        else:
            return f"{method} request to {path}"
    
    def get_resource_type(self, request: Request) -> str:
        """Determine the resource type from the path"""
        path = request.url.path.lower()
        
        if "/users" in path:
            return "User"
        elif "/cases" in path:
            return "Case"
        elif "/people" in path:
            return "Person"
        elif "/courts" in path:
            return "Court"
        elif "/payments" in path:
            return "Payment"
        elif "/notifications" in path:
            return "Notification"
        else:
            return "Unknown"
    
    def get_resource_id(self, request: Request) -> str:
        """Extract resource ID from the path if available"""
        path = request.url.path
        parts = path.split("/")
        
        # Look for numeric IDs in the path
        for part in parts:
            if part.isdigit():
                return part
        
        return None
