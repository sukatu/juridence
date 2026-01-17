from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
# from middleware.logging_middleware import LoggingMiddleware
from contextlib import asynccontextmanager
import uvicorn

from database import create_tables, get_db
from routes import auth
from auth import get_current_user
from models.user import User
from routes import profile
from routes import people
from routes import banks
from routes import insurance
from routes import companies
from routes import search
from routes import reported_cases
from routes import legal_history
from routes import case_search
from routes import enhanced_search
from routes import case_hearings
from routes import person_case_statistics
from routes import person_analytics
from routes import banking_summary
from routes import request_details
from routes import subscription
from routes import notifications
from routes import security
from routes import admin
from routes import admin_payments
from routes import admin_case_hearings
from routes import judges
from routes import court_types
from routes import tenant
from routes import courts
from routes import ai_chat
from routes import employees
from routes import file_upload
from routes import file_repository
from routes import gazette
from routes import gazette_import
from routes import pdf_gazette_processing
from routes import gazette_statistics
from routes import gazette_error_correction
from routes import gazette_ai_chat
from routes import correction_of_place_of_birth
from routes import correction_of_date_of_birth
from routes import marriage_officers
from routes import change_of_name
from routes import marriage_venues
from routes import persons_unified_search
from routes.persons_unified_search import unified_persons_search
from routes import contact_requests
from routes import ai_case_analysis
from routes import analytics_generator
from routes import corporate_entities
from routes import person_employment
from routes import person_relationships
from routes import person_case_links
from routes import person_all_relationships
from routes import case_summarization
from routes import case_summaries
from routes import watchlist
from routes import cause_list
from config import settings

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting juridence Backend...")
    create_tables()
    print("Database tables created successfully")
    yield
    # Shutdown
    print("Shutting down juridence Backend...")

# Create FastAPI app
app = FastAPI(
    title="juridence API",
    description="Backend API for juridence Services - Court Search, Document Verification & Document Request",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Use settings for CORS origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add headers middleware to fix iframe issues and CORS on redirects
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    # Allow iframe embedding from your domain
    response.headers["X-Frame-Options"] = "ALLOWALL"
    response.headers["Content-Security-Policy"] = "frame-ancestors 'self' https://juridence.net https://www.juridence.net"
    
    # Add CORS headers to redirect responses (3xx status codes)
    # This fixes CORS issues when FastAPI redirects URLs with/without trailing slashes
    if response.status_code in [301, 302, 303, 307, 308]:
        origin = request.headers.get("origin")
        if origin in settings.cors_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# Logging middleware
# app.add_middleware(LoggingMiddleware)

# Temporarily override authentication for testing - using real database user
# NOTE: This override bypasses normal token authentication. 
# If you need proper authentication, comment out the line below.
# async def get_real_admin_user():
#     """Get real admin user from database - bypasses authentication"""
#     from database import get_db
#     from datetime import datetime
#     
#     db = next(get_db())
#     # Get the real admin user from database
#     admin_user = db.query(User).filter(User.email == "admin@juridence.com").first()
#     if not admin_user:
#         db.close()
#         raise HTTPException(status_code=404, detail="Admin user not found")
#     
#     # Update last login without committing (let the profile endpoint handle commits)
#     admin_user.last_login = datetime.utcnow()
#     
#     # Don't close the session here - let the endpoint handle it
#     return admin_user

# app.dependency_overrides[get_current_user] = get_real_admin_user

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(people.router, prefix="/api/people", tags=["people"])
app.include_router(banks.router, prefix="/api/banks", tags=["banks"])
app.include_router(insurance.router, prefix="/api/insurance", tags=["insurance"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(reported_cases.router, prefix="/api/cases", tags=["reported_cases"])
app.include_router(legal_history.router, prefix="/api/legal-history", tags=["legal_history"])
app.include_router(case_search.router, prefix="/api/case-search", tags=["case_search"])
app.include_router(enhanced_search.router, prefix="/api/enhanced-search", tags=["enhanced_search"])
app.include_router(case_hearings.router, prefix="/api", tags=["case_hearings"])
app.include_router(person_case_statistics.router, tags=["person_case_statistics"])
app.include_router(person_analytics.router, prefix="/api", tags=["person_analytics"])
app.include_router(banking_summary.router, tags=["banking_summary"])
app.include_router(request_details.router, tags=["request_details"])
app.include_router(subscription.router, prefix="/api/subscription", tags=["subscription"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(security.router, prefix="/api/security", tags=["security"])
app.include_router(admin.router, tags=["admin"])
app.include_router(admin_payments.router, prefix="/api/admin/payments", tags=["admin_payments"])
app.include_router(admin_case_hearings.router, prefix="/api", tags=["admin_case_hearings"])
app.include_router(judges.router, prefix="/api", tags=["judges"])
app.include_router(court_types.router, prefix="/api", tags=["court_types"])
app.include_router(tenant.router, prefix="/api/tenant", tags=["tenant"])
app.include_router(courts.router, prefix="/api/courts", tags=["courts"])
app.include_router(ai_chat.router, prefix="/api", tags=["ai-chat"])
app.include_router(employees.router, tags=["employees"])
app.include_router(file_upload.router, prefix="/api/files", tags=["file_upload"])
app.include_router(file_repository.router, tags=["file-repository"])
app.include_router(gazette.router, prefix="/api", tags=["gazette"])
app.include_router(gazette_import.router, prefix="/api/gazette", tags=["gazette-import"])
app.include_router(pdf_gazette_processing.router, prefix="/api/pdf-gazette", tags=["pdf-gazette-processing"])
app.include_router(gazette_statistics.router, tags=["gazette-statistics"])
app.include_router(gazette_error_correction.router, tags=["gazette-correction"])
app.include_router(gazette_ai_chat.router, prefix="/api", tags=["gazette-ai-chat"])
app.include_router(correction_of_place_of_birth.router, prefix="/api", tags=["correction-of-place-of-birth"])
app.include_router(correction_of_date_of_birth.router, prefix="/api", tags=["correction-of-date-of-birth"])
app.include_router(marriage_officers.router, prefix="/api", tags=["marriage-officers"])
app.include_router(change_of_name.router, prefix="/api", tags=["change-of-name"])
app.include_router(marriage_venues.router, prefix="/api", tags=["marriage-venues"])
app.include_router(persons_unified_search.router, prefix="/api", tags=["persons-unified-search"])
app.include_router(contact_requests.router, prefix="/api/subscription", tags=["contact-requests"])
app.include_router(ai_case_analysis.router, prefix="/api", tags=["ai-case-analysis"])
app.include_router(analytics_generator.router, prefix="/api", tags=["analytics-generator"])
app.include_router(corporate_entities.router, prefix="/api", tags=["corporate-entities"])
app.include_router(person_employment.router, tags=["person_employment"])
app.include_router(person_relationships.router, tags=["person_relationships"])
app.include_router(person_case_links.router, tags=["person_case_links"])
app.include_router(person_all_relationships.router, tags=["person-all-relationships"])
app.include_router(case_summarization.router, tags=["case_summarization"])
app.include_router(case_summaries.router, prefix="/api", tags=["case-summaries"])
app.include_router(watchlist.router, prefix="/api/watchlist", tags=["watchlist"])
app.include_router(cause_list.router, prefix="/api", tags=["cause_list"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to juridence API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "juridence-api",
        "version": "1.0.0"
    }

# Fallback direct route for unified persons search (avoids 404 if router not loaded)
@app.get("/api/persons-unified-search/")
async def persons_unified_search_fallback(
    query: str,
    page: int = 1,
    limit: int = 100,
    db=Depends(get_db)
):
    return await unified_persons_search(query=query, page=page, limit=limit, db=db)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.debug else "An error occurred"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
