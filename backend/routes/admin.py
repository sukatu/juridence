from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import json
import os
import uuid

from database import get_db
from models.user import User, UserRole, UserStatus
from auth import get_current_user, get_password_hash
from models.reported_cases import ReportedCases
from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from models.companies import Companies
from models.subscription import Subscription
from models.payment import Payment
from models.notification import Notification
from models.security import SecurityEvent, ApiKey
from models.settings import Settings
from models.logs import AccessLog, ActivityLog, AuditLog, ErrorLog, SecurityLog, LogLevel, ActivityType
from services.logging_service import LoggingService
from services.case_metadata_service import CaseMetadataService
from services.simple_case_processing_service import SimpleCaseProcessingService
from services.document_processing_service import DocumentProcessingService
from schemas.admin import (
    AdminStatsResponse,
    UserListResponse,
    UserDetailResponse,
    UserCreateRequest,
    UserUpdateRequest,
    ApiKeyResponse,
    ApiKeyCreateRequest,
    CaseListResponse,
    CaseResponse,
    CaseDetailResponse,
    CaseCreateRequest,
    CaseUpdateRequest,
    PeopleListResponse,
    BankListResponse,
    InsuranceListResponse,
    CompanyListResponse,
    PaymentListResponse,
    SubscriptionListResponse
)
from schemas.user import AdminPasswordReset

# Import the new admin route modules
from . import admin_people, admin_banks, admin_insurance, admin_companies, admin_payments, admin_settings, admin_roles

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Helper function to check admin privileges
def check_admin_privileges(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not (user.role == 'admin' or user.is_admin == True):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

# Dashboard Statistics
@router.get("/stats", response_model=AdminStatsResponse)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    try:
        # Count total users
        total_users = db.query(User).count()
        
        # Count total cases
        total_cases = db.query(ReportedCases).count()
        
        # Count total people
        total_people = db.query(People).count()
        
        # Count total banks
        total_banks = db.query(Banks).count()
        
        # Count total insurance
        total_insurance = db.query(Insurance).count()
        
        # Count total companies
        total_companies = db.query(Companies).count()
        
        # Count total payments
        total_payments = db.query(Payment).count()
        
        # Count active subscriptions
        active_subscriptions = db.query(Subscription).filter(
            Subscription.status == 'active'
        ).count()
        
        # Recent activity (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_users = db.query(User).filter(User.created_at >= yesterday).count()
        recent_cases = db.query(ReportedCases).filter(ReportedCases.created_at >= yesterday).count()
        
        return AdminStatsResponse(
            total_users=total_users,
            total_cases=total_cases,
            total_people=total_people,
            total_banks=total_banks,
            total_insurance=total_insurance,
            total_companies=total_companies,
            total_payments=total_payments,
            active_subscriptions=active_subscriptions,
            recent_users=recent_users,
            recent_cases=recent_cases,
            last_updated=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

# User Management
@router.get("/users", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of users with filtering"""
    try:
        query = db.query(User)
        
        # Apply filters
        if search:
            query = query.filter(
                User.email.contains(search) | 
                User.first_name.contains(search) | 
                User.last_name.contains(search)
            )
        
        if role:
            valid_roles = {r.value for r in UserRole}
            if role not in valid_roles:
                return UserListResponse(users=[], total=0, page=page, limit=limit, total_pages=0)
            query = query.filter(User.role == role)
        
        if status:
            valid_statuses = {s.value for s in UserStatus}
            if status not in valid_statuses:
                return UserListResponse(users=[], total=0, page=page, limit=limit, total_pages=0)
            query = query.filter(User.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()
        
        return UserListResponse(
            users=users,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.get("/users/clients-and-registrars", response_model=UserListResponse)
async def get_clients_and_registrars(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    search: Optional[str] = None,
    user_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of clients and registrars with filtering"""
    try:
        # Filter only corporate clients and court registrars
        query = db.query(User).filter(
            or_(
                User.user_type == 'corporate_client',
                User.user_type == 'court_registrar'
            )
        )
        
        # Apply filters
        if search:
            query = query.filter(
                User.email.contains(search) | 
                User.first_name.contains(search) | 
                User.last_name.contains(search) |
                (User.organization != None) & (User.organization.contains(search))
            )
        
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        if status:
            query = query.filter(User.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()
        
        return UserListResponse(
            users=users,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit if total > 0 else 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clients and registrars: {str(e)}")

@router.get("/users/clients-and-registrars/stats")
async def get_clients_and_registrars_stats(db: Session = Depends(get_db)):
    """Get statistics for clients and registrars"""
    try:
        # Get all clients and registrars
        all_clients_registrars = db.query(User).filter(
            or_(
                User.user_type == 'corporate_client',
                User.user_type == 'court_registrar'
            )
        ).all()
        
        # Calculate stats
        total_corporate_clients = len([u for u in all_clients_registrars if u.user_type == 'corporate_client'])
        total_registrars = len([u for u in all_clients_registrars if u.user_type == 'court_registrar'])
        
        active_corporate_clients = len([u for u in all_clients_registrars if u.user_type == 'corporate_client' and u.status == 'active'])
        active_registrars = len([u for u in all_clients_registrars if u.user_type == 'court_registrar' and u.status == 'active'])
        
        inactive_corporate_clients = len([u for u in all_clients_registrars if u.user_type == 'corporate_client' and u.status == 'inactive'])
        inactive_registrars = len([u for u in all_clients_registrars if u.user_type == 'court_registrar' and u.status == 'inactive'])
        
        pending_corporate_clients = len([u for u in all_clients_registrars if u.user_type == 'corporate_client' and u.status == 'pending'])
        pending_registrars = len([u for u in all_clients_registrars if u.user_type == 'court_registrar' and u.status == 'pending'])
        
        return {
            "totalCorporateClients": total_corporate_clients,
            "totalRegistrars": total_registrars,
            "activeCorporateClients": active_corporate_clients,
            "activeRegistrars": active_registrars,
            "inactiveCorporateClients": inactive_corporate_clients,
            "inactiveRegistrars": inactive_registrars,
            "pendingCorporateClients": pending_corporate_clients,
            "pendingRegistrars": pending_registrars
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clients and registrars stats: {str(e)}")

@router.get("/users/stats")
async def get_users_stats(db: Session = Depends(get_db)):
    """Get user statistics for admin dashboard"""
    try:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        admin_users = db.query(User).filter(User.role == "admin").count()
        regular_users = db.query(User).filter(User.role == "user").count()
        
        # Recent registrations (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_registrations = db.query(User).filter(User.created_at >= thirty_days_ago).count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "admin_users": admin_users,
            "regular_users": regular_users,
            "recent_registrations": recent_registrations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user stats: {str(e)}")

@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get detailed user information"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserDetailResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login=user.last_login,
            subscription=user.subscription,
            notifications_count=len(user.notifications) if user.notifications else 0,
            api_keys_count=len(user.api_keys) if user.api_keys else 0
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

@router.post("/users", response_model=UserDetailResponse)
async def create_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Determine user role - use UserRole enum
        user_role = user_data.role if user_data.role else UserRole.USER
        user_status = user_data.status if user_data.status else UserStatus.ACTIVE
        
        # Create new user - matching registration format
        new_user = User(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number,
            organization=user_data.organization,
            job_title=user_data.job_title,
            user_type=user_data.user_type,  # Store selected role: administrator, court_registrar, corporate_client
            court_type=user_data.court_type,  # Store court type for court registrar
            entity_type=user_data.entity_type,  # Store entity type for corporate client
            entity_id=user_data.entity_id,  # Store entity ID for corporate client
            hashed_password=hashed_password,
            role=user_role,
            status=user_status,
            is_admin=user_data.is_admin or False,
            language=user_data.language or "en",
            timezone=user_data.timezone or "UTC",
            email_notifications=user_data.email_notifications if user_data.email_notifications is not None else True,
            sms_notifications=user_data.sms_notifications if user_data.sms_notifications is not None else False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserDetailResponse(
            id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            phone_number=new_user.phone_number,
            organization=new_user.organization,
            job_title=new_user.job_title,
            role=str(new_user.role),
            status=str(new_user.status),
            is_admin=new_user.is_admin,
            user_type=new_user.user_type,
            court_type=new_user.court_type,
            entity_type=new_user.entity_type,
            entity_id=new_user.entity_id,
            created_at=new_user.created_at,
            updated_at=new_user.updated_at,
            last_login=new_user.last_login
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.put("/users/{user_id}", response_model=UserDetailResponse)
async def update_user(user_id: int, user_data: UserUpdateRequest, db: Session = Depends(get_db)):
    """Update user information"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user fields - matching registration format
        if user_data.first_name is not None:
            user.first_name = user_data.first_name
        if user_data.last_name is not None:
            user.last_name = user_data.last_name
        if user_data.phone_number is not None:
            user.phone_number = user_data.phone_number
        if user_data.organization is not None:
            user.organization = user_data.organization
        if user_data.job_title is not None:
            user.job_title = user_data.job_title
        if user_data.role is not None:
            user.role = user_data.role
        if user_data.status is not None:
            user.status = user_data.status
        if user_data.is_admin is not None:
            user.is_admin = user_data.is_admin
        if user_data.user_type is not None:
            user.user_type = user_data.user_type
        if user_data.court_type is not None:
            user.court_type = user_data.court_type
        if user_data.entity_type is not None:
            user.entity_type = user_data.entity_type
        if user_data.entity_id is not None:
            user.entity_id = user_data.entity_id
        if user_data.language is not None:
            user.language = user_data.language
        if user_data.timezone is not None:
            user.timezone = user_data.timezone
        if user_data.email_notifications is not None:
            user.email_notifications = user_data.email_notifications
        if user_data.sms_notifications is not None:
            user.sms_notifications = user_data.sms_notifications
        
        user.updated_at = datetime.now()
        
        db.commit()
        db.refresh(user)
        
        return UserDetailResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number,
            organization=user.organization,
            job_title=user.job_title,
            role=str(user.role),
            status=str(user.status),
            is_admin=user.is_admin,
            user_type=user.user_type,
            court_type=user.court_type,
            entity_type=user.entity_type,
            entity_id=user.entity_id,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login=user.last_login
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db.delete(user)
        db.commit()
        
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int, 
    password_data: AdminPasswordReset, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reset a user's password (admin only)"""
    try:
        # Verify admin is logged in and is actually an admin
        if not current_user or not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Verify admin's password
        from auth import verify_password
        if not verify_password(password_data.admin_password, current_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid admin password")
        
        # Get the target user
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Import the password hashing function
        from auth import get_password_hash
        
        # Update the target user's password
        target_user.hashed_password = get_password_hash(password_data.new_password)
        target_user.updated_at = datetime.now()
        
        db.commit()
        
        return {"message": f"Password reset successfully for user {target_user.email}"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resetting password: {str(e)}")

# API Key Management
@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def get_api_keys(
    user_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get API keys with optional user filtering"""
    try:
        query = db.query(ApiKey)
        
        if user_id:
            query = query.filter(ApiKey.user_id == user_id)
        
        offset = (page - 1) * limit
        api_keys = query.offset(offset).limit(limit).all()
        
        return [
            ApiKeyResponse(
                id=key.id,
                user_id=key.user_id,
                name=key.name,
                key_prefix=key.key_prefix,
                is_active=key.is_active,
                created_at=key.created_at,
                last_used=key.last_used,
                expires_at=key.expires_at
            ) for key in api_keys
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching API keys: {str(e)}")

@router.post("/api-keys", response_model=ApiKeyResponse)
async def create_api_key(api_key_data: ApiKeyCreateRequest, db: Session = Depends(get_db)):
    """Create a new API key for a user"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == api_key_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Generate API key (simplified - in production, use proper key generation)
        import secrets
        import string
        
        key_prefix = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
        key_secret = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        full_key = f"sk-{key_prefix}.{key_secret}"
        
        new_api_key = ApiKey(
            user_id=api_key_data.user_id,
            name=api_key_data.name,
            key_prefix=key_prefix,
            key_hash=key_secret,  # In production, hash this
            is_active=True,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(days=365) if api_key_data.expires_in_days else None
        )
        
        db.add(new_api_key)
        db.commit()
        db.refresh(new_api_key)
        
        return ApiKeyResponse(
            id=new_api_key.id,
            user_id=new_api_key.user_id,
            name=new_api_key.name,
            key_prefix=new_api_key.key_prefix,
            full_key=full_key,  # Only return full key on creation
            is_active=new_api_key.is_active,
            created_at=new_api_key.created_at,
            expires_at=new_api_key.expires_at
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating API key: {str(e)}")

@router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: int, db: Session = Depends(get_db)):
    """Delete an API key"""
    try:
        api_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
        if not api_key:
            raise HTTPException(status_code=404, detail="API key not found")
        
        db.delete(api_key)
        db.commit()
        
        return {"message": "API key deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting API key: {str(e)}")

# Case Management
@router.get("/cases", response_model=CaseListResponse)
async def get_cases(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    court_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of cases with filtering"""
    try:
        query = db.query(ReportedCases)
        
        # Apply filters
        if search:
            query = query.filter(
                ReportedCases.title.contains(search) |
                ReportedCases.protagonist.contains(search) |
                ReportedCases.antagonist.contains(search)
            )
        
        if court_type:
            query = query.filter(ReportedCases.court_type == court_type)
        
        if status:
            query = query.filter(ReportedCases.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        cases = query.offset(offset).limit(limit).all()
        
        # Convert cases to proper format
        formatted_cases = []
        status_mapping = {
            1: 'active',
            0: 'closed',
            2: 'pending',
            3: 'dismissed'
        }
        
        for case in cases:
            case_dict = {
                "id": case.id,
                "title": case.title,
                "suit_reference_number": case.suit_reference_number,
                "date": str(case.date) if case.date else None,
                "presiding_judge": case.presiding_judge,
                "protagonist": case.protagonist,
                "antagonist": case.antagonist,
                "court_type": case.court_type,
                "court_division": case.court_division,
                "status": status_mapping.get(case.status) if case.status is not None else None,
                "created_at": case.created_at.isoformat() if case.created_at else None,
                "updated_at": case.updated_at.isoformat() if case.updated_at else None
            }
            formatted_cases.append(case_dict)
        
        return CaseListResponse(
            cases=formatted_cases,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cases: {str(e)}")

@router.get("/cases/stats", response_model=dict)
async def get_case_stats(db: Session = Depends(get_db)):
    """Get comprehensive case statistics for admin dashboard"""
    try:
        # Basic counts
        total_cases = db.query(ReportedCases).count()
        
        # Status distribution
        status_mapping = {
            'active': 'active',
            'closed': 'closed',
            'pending': 'pending',
            'dismissed': 'dismissed'
        }
        
        active_cases = db.query(ReportedCases).filter(ReportedCases.status == 'active').count()
        closed_cases = db.query(ReportedCases).filter(ReportedCases.status == 'closed').count()
        pending_cases = db.query(ReportedCases).filter(ReportedCases.status == 'pending').count()
        dismissed_cases = db.query(ReportedCases).filter(ReportedCases.status == 'dismissed').count()
        
        # Recent cases (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_cases = db.query(ReportedCases).filter(ReportedCases.created_at >= thirty_days_ago).count()
        
        # Court type distribution
        court_type_dist = {}
        court_types = db.query(ReportedCases.court_type, func.count(ReportedCases.id)).group_by(ReportedCases.court_type).all()
        for court_type, count in court_types:
            if court_type:
                court_type_dist[court_type] = count
        
        # Status distribution
        status_dist = {}
        status_counts = db.query(ReportedCases.status, func.count(ReportedCases.id)).group_by(ReportedCases.status).all()
        for status, count in status_counts:
            if status is not None:
                status_name = status_mapping.get(status, status or 'unknown')
                status_dist[status_name] = count
        
        # Year distribution (last 10 years)
        year_dist = {}
        current_year = datetime.now().year
        for year in range(current_year - 9, current_year + 1):
            year_count = db.query(ReportedCases).filter(ReportedCases.year == str(year)).count()
            if year_count > 0:
                year_dist[str(year)] = year_count
        
        # Region distribution
        region_dist = {}
        regions = db.query(ReportedCases.region, func.count(ReportedCases.id)).group_by(ReportedCases.region).all()
        for region, count in regions:
            if region:
                region_dist[region] = count
        
        return {
            "totalCases": total_cases,
            "activeCases": active_cases,
            "closedCases": closed_cases,
            "pendingCases": pending_cases,
            "dismissedCases": dismissed_cases,
            "recentCases": recent_cases,
            "courtTypeDistribution": court_type_dist,
            "statusDistribution": status_dist,
            "yearDistribution": year_dist,
            "regionDistribution": region_dist
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching case stats: {str(e)}")

@router.get("/cases/{case_id}", response_model=CaseDetailResponse)
async def get_case(case_id: int, db: Session = Depends(get_db)):
    """Get a specific case by ID"""
    try:
        case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Convert status integer to string for response
        status_mapping = {
            1: 'active',
            0: 'closed',
            2: 'pending',
            3: 'dismissed'
        }
        
        # Create a dict with converted status
        case_dict = case.__dict__.copy()
        if case_dict.get('status') is not None:
            case_dict['status'] = status_mapping.get(case_dict['status'])
        
        # Normalize fields that can violate response model typing
        if case_dict.get("c_t") is not None:
            case_dict["c_t"] = str(case_dict["c_t"])
        academic_programme_id = case_dict.get("academic_programme_id")
        if academic_programme_id in ("", None):
            case_dict["academic_programme_id"] = None
        else:
            try:
                case_dict["academic_programme_id"] = int(academic_programme_id)
            except (TypeError, ValueError):
                case_dict["academic_programme_id"] = None

        # Convert datetime fields to strings for JSON serialization
        for field in ['ai_summary_generated_at', 'created_at', 'updated_at', 'date']:
            if case_dict.get(field) and hasattr(case_dict[field], 'isoformat'):
                case_dict[field] = case_dict[field].isoformat()
        
        return case_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching case: {str(e)}")

@router.post("/cases", response_model=CaseDetailResponse)
async def create_case(case_data: CaseCreateRequest, db: Session = Depends(get_db)):
    """Create a new case"""
    try:
        # Convert case data to dict and handle status conversion
        case_dict = case_data.dict()
        
        # Extract person_links if present (not part of ReportedCases model)
        person_links = case_dict.pop('person_links', None)
        
        # Convert status string to integer if needed
        if case_dict.get('status'):
            status_mapping = {
                'active': 1,
                'closed': 0,
                'pending': 2,
                'dismissed': 3
            }
            case_dict['status'] = status_mapping.get(case_dict['status'], 1)
        
        new_case = ReportedCases(**case_dict)
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        
        # Create person-case links if provided
        if person_links:
            from models.person_case_link import PersonCaseLink
            for link_data in person_links:
                person_link = PersonCaseLink(
                    person_id=link_data.get('person_id'),
                    case_id=new_case.id,
                    role_in_case=link_data.get('role_in_case', 'Related Party')
                )
                db.add(person_link)
            db.commit()
        
        # Process case with analytics
        try:
            processor = SimpleCaseProcessingService(db)
            processing_result = processor.process_case_with_analytics(new_case.id)
            print(f"Processing result for case {new_case.id}: {processing_result}")
        except Exception as e:
            print(f"Error processing case {new_case.id}: {str(e)}")
            # Fallback to basic metadata processing
            try:
                metadata_result = CaseMetadataService.process_case_metadata(new_case.id, db)
                print(f"Fallback metadata processing result for case {new_case.id}: {metadata_result}")
            except Exception as fallback_error:
                print(f"Error in fallback metadata processing for case {new_case.id}: {str(fallback_error)}")
        
        # Convert status back to string for response
        status_mapping = {
            1: 'active',
            0: 'closed',
            2: 'pending',
            3: 'dismissed'
        }
        
        case_dict = new_case.__dict__.copy()
        if case_dict.get('status') is not None:
            case_dict['status'] = status_mapping.get(case_dict['status'])
        
        # Convert datetime fields to strings for JSON serialization
        for field in ['ai_summary_generated_at', 'created_at', 'updated_at', 'date']:
            if case_dict.get(field) and hasattr(case_dict[field], 'isoformat'):
                case_dict[field] = case_dict[field].isoformat()
        
        return case_dict
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating case: {str(e)}")

@router.put("/cases/{case_id}", response_model=CaseDetailResponse)
async def update_case(case_id: int, case_data: CaseUpdateRequest, db: Session = Depends(get_db)):
    """Update a case"""
    try:
        case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Update only provided fields
        update_data = case_data.dict(exclude_unset=True)
        
        # Extract person_links if present (not part of ReportedCases model)
        person_links = update_data.pop('person_links', None)
        
        # Convert status string to integer if needed
        if 'status' in update_data and update_data['status']:
            status_mapping = {
                'active': 1,
                'closed': 0,
                'pending': 2,
                'dismissed': 3
            }
            update_data['status'] = status_mapping.get(update_data['status'], 1)
        
        for field, value in update_data.items():
            setattr(case, field, value)
        
        case.updated_at = datetime.now()
        db.commit()
        db.refresh(case)
        
        # Update person-case links if provided
        if person_links is not None:
            from models.person_case_link import PersonCaseLink
            # Delete existing links for this case
            db.query(PersonCaseLink).filter(PersonCaseLink.case_id == case_id).delete()
            # Create new links
            for link_data in person_links:
                person_link = PersonCaseLink(
                    person_id=link_data.get('person_id'),
                    case_id=case_id,
                    role_in_case=link_data.get('role_in_case', 'Related Party')
                )
                db.add(person_link)
            db.commit()
        
        # Convert status back to string for response
        status_mapping = {
            1: 'active',
            0: 'closed',
            2: 'pending',
            3: 'dismissed'
        }
        
        case_dict = case.__dict__.copy()
        if case_dict.get('status') is not None:
            case_dict['status'] = status_mapping.get(case_dict['status'])
        
        return case_dict
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating case: {str(e)}")

@router.delete("/cases/{case_id}")
async def delete_case(case_id: int, db: Session = Depends(get_db)):
    """Delete a case"""
    try:
        case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        db.delete(case)
        db.commit()
        return {"message": "Case deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting case: {str(e)}")

@router.post("/cases/upload")
async def upload_case(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a case document and create a case record with AI analysis"""
    try:
        # Validate file type
        allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not supported. Please upload PDF or Word documents.")
        
        # Validate file size (10MB max)
        file_size = 0
        content = await file.read()
        file_size = len(content)
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File size too large. Maximum size is 10MB.")
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/cases"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Process document with AI
        document_processor = DocumentProcessingService()
        try:
            # Extract and analyze document content
            extracted_data = document_processor.process_document(file_path, file.filename)
            
            # Create case record with extracted data
            case_data = {
                "title": extracted_data.get('title', f"Uploaded Case - {file.filename}"),
                "suit_reference_number": extracted_data.get('suit_reference_number', f"UPLOAD-{uuid.uuid4().hex[:8].upper()}"),
                "date": extracted_data.get('date', datetime.now().date()),
                "file_url": file_path,
                "status": 1,  # 1 = pending, 2 = active, 3 = closed, 4 = dismissed
                "court_type": extracted_data.get('court_type', 'Unknown'),
                "court_division": extracted_data.get('court_division', 'Unknown'),
                "protagonist": extracted_data.get('protagonist', 'Unknown'),
                "antagonist": extracted_data.get('antagonist', 'Unknown'),
                "presiding_judge": extracted_data.get('presiding_judge', 'Unknown'),
                "statutes_cited": extracted_data.get('statutes_cited', ''),
                "cases_cited": extracted_data.get('cases_cited', ''),
                "lawyers": extracted_data.get('lawyers', ''),
                "commentary": extracted_data.get('commentary', f"Case uploaded from file: {file.filename}"),
                "headnotes": extracted_data.get('headnotes', ''),
                "town": extracted_data.get('town', 'Unknown'),
                "region": extracted_data.get('region', 'Unknown'),
                "dl_citation_no": "",
                "judgement": extracted_data.get('judgement', ''),
                "year": extracted_data.get('year', datetime.now().year),
                "type": "document_upload",
                "firebase_url": "",
                "summernote": extracted_data.get('case_summary', ''),
                "case_summary": extracted_data.get('case_summary', ''),
                "area_of_law": extracted_data.get('area_of_law', ''),
                "keywords_phrases": extracted_data.get('keywords_phrases', ''),
                "conclusion": extracted_data.get('conclusion', ''),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
        except Exception as e:
            # Fallback to basic case data if document processing fails
            print(f"Document processing failed: {e}, using fallback data")
            case_data = {
                "title": f"Uploaded Case - {file.filename}",
                "suit_reference_number": f"UPLOAD-{uuid.uuid4().hex[:8].upper()}",
                "date": datetime.now().date(),
                "file_url": file_path,
                "status": 1,
                "court_type": "Unknown",
                "court_division": "Unknown",
                "protagonist": "Unknown",
                "antagonist": "Unknown",
                "presiding_judge": "Unknown",
                "statutes_cited": "",
                "cases_cited": "",
                "lawyers": "",
                "commentary": f"Case uploaded from file: {file.filename}",
                "headnotes": "",
                "town": "Unknown",
                "region": "Unknown",
                "dl_citation_no": "",
                "judgement": "",
                "year": datetime.now().year,
                "type": "document_upload",
                "firebase_url": "",
                "summernote": "",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        
        # Create case in database
        case = ReportedCases(**case_data)
        db.add(case)
        db.commit()
        db.refresh(case)
        
        # Process the case with AI services for additional analysis
        try:
            processor = SimpleCaseProcessingService(db)
            processor.process_case_with_analytics(case.id)
        except Exception as e:
            # Log error but don't fail the upload
            print(f"Error processing uploaded case {case.id}: {str(e)}")
        
        return {
            "message": "Case uploaded and analyzed successfully",
            "case_id": case.id,
            "filename": file.filename,
            "file_path": file_path,
            "extracted_data": {
                "title": case_data.get('title'),
                "suit_reference_number": case_data.get('suit_reference_number'),
                "parties": f"{case_data.get('protagonist')} vs {case_data.get('antagonist')}",
                "court": case_data.get('court_type'),
                "judge": case_data.get('presiding_judge'),
                "area_of_law": case_data.get('area_of_law')
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error uploading case: {str(e)}")

# Company Management - COMMENTED OUT (using admin_companies.py instead)
# @router.get("/companies", response_model=CompanyListResponse)
# async def get_companies_OLD(
#     page: int = Query(1, ge=1),
#     limit: int = Query(10, ge=1, le=100),
#     search: Optional[str] = None,
#     company_type: Optional[str] = None,
#     db: Session = Depends(get_db)
# ):
#     """Get paginated list of companies with filtering"""
#     try:
#         query = db.query(Companies)
#         
#         # Apply filters
#         if search:
#             query = query.filter(Companies.name.contains(search))
#         
#         if company_type:
#             query = query.filter(Companies.company_type == company_type)
#         
#         # Get total count
#         total = query.count()
#         
#         # Apply pagination
#         offset = (page - 1) * limit
#         companies = query.offset(offset).limit(limit).all()
#         
#         return CompanyListResponse(
#             companies=companies,
#             total=total,
#             page=page,
#             limit=limit,
#             total_pages=(total + limit - 1) // limit
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching companies: {str(e)}")

# Payment Management
@router.get("/payments", response_model=PaymentListResponse)
async def get_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of payments with filtering"""
    try:
        query = db.query(Payment)
        
        # Apply filters
        if status:
            query = query.filter(Payment.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        payments = query.offset(offset).limit(limit).all()
        
        return PaymentListResponse(
            payments=payments,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")

# Subscription Management
@router.get("/subscriptions", response_model=SubscriptionListResponse)
async def get_subscriptions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of subscriptions with filtering"""
    try:
        query = db.query(Subscription)
        
        # Apply filters
        if status:
            query = query.filter(Subscription.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        subscriptions = query.offset(offset).limit(limit).all()
        
        return SubscriptionListResponse(
            subscriptions=subscriptions,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subscriptions: {str(e)}")

# Case Metadata Processing Endpoints
@router.post("/cases/{case_id}/process-metadata")
async def process_case_metadata(case_id: int, db: Session = Depends(get_db)):
    """Process metadata for a specific case"""
    try:
        result = CaseMetadataService.process_case_metadata(case_id, db)
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing case metadata: {str(e)}")

@router.post("/cases/process-all-metadata")
async def process_all_cases_metadata(db: Session = Depends(get_db)):
    """Process metadata for all cases"""
    try:
        result = CaseMetadataService.reprocess_all_cases(db)
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing all cases metadata: {str(e)}")

@router.post("/cases/{case_id}/process-enhanced")
async def process_case_enhanced(case_id: int, db: Session = Depends(get_db)):
    """Process case with analytics and entity extraction"""
    try:
        processor = SimpleCaseProcessingService(db)
        result = processor.process_case_with_analytics(case_id)
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing case with analytics: {str(e)}")

# Google Maps API Key
@router.get("/google-maps-api-key")
async def get_google_maps_api_key(db: Session = Depends(get_db)):
    """Get Google Maps API key for frontend use"""
    try:
        setting = db.query(Settings).filter(Settings.key == "google_maps_api_key").first()
        
        if not setting:
            raise HTTPException(status_code=404, detail="Google Maps API key not configured")
        
        if not setting.value:
            raise HTTPException(status_code=404, detail="Google Maps API key not set")
        
        return {
            "api_key": setting.value,
            "description": setting.description
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Google Maps API key: {str(e)}")

# Logging Management
@router.get("/logs/access")
async def get_access_logs(
    user_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get access logs with filtering"""
    try:
        logging_service = LoggingService(db)
        
        start_dt = None
        end_dt = None
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        logs = logging_service.get_access_logs(
            user_id=user_id,
            limit=limit,
            offset=offset,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "session_id": log.session_id,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "method": log.method,
                    "url": log.url,
                    "endpoint": log.endpoint,
                    "status_code": log.status_code,
                    "response_time": log.response_time,
                    "request_size": log.request_size,
                    "response_size": log.response_size,
                    "referer": log.referer,
                    "country": log.country,
                    "city": log.city,
                    "device_type": log.device_type,
                    "browser": log.browser,
                    "os": log.os,
                    "created_at": log.created_at.isoformat()
                } for log in logs
            ],
            "total": len(logs),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching access logs: {str(e)}")

@router.get("/logs/activity")
async def get_activity_logs(
    user_id: Optional[int] = Query(None),
    activity_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get activity logs with filtering"""
    try:
        logging_service = LoggingService(db)
        
        activity_type_enum = None
        if activity_type:
            try:
                activity_type_enum = ActivityType(activity_type.upper())
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid activity type")
        
        start_dt = None
        end_dt = None
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        logs = logging_service.get_activity_logs(
            user_id=user_id,
            activity_type=activity_type_enum,
            limit=limit,
            offset=offset,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "session_id": log.session_id,
                    "activity_type": log.activity_type.value,
                    "action": log.action,
                    "description": log.description,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "old_values": log.old_values,
                    "new_values": log.new_values,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "log_metadata": log.log_metadata,
                    "severity": log.severity.value,
                    "created_at": log.created_at.isoformat()
                } for log in logs
            ],
            "total": len(logs),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activity logs: {str(e)}")

@router.get("/logs/audit")
async def get_audit_logs(
    user_id: Optional[int] = Query(None),
    table_name: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get audit logs with filtering"""
    try:
        logging_service = LoggingService(db)
        
        start_dt = None
        end_dt = None
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        logs = logging_service.get_audit_logs(
            user_id=user_id,
            table_name=table_name,
            limit=limit,
            offset=offset,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "session_id": getattr(log, 'session_id', None),
                    "table_name": log.table_name,
                    "record_id": log.record_id,
                    "action": log.action,
                    "field_name": log.field_name,
                    "old_value": log.old_value,
                    "new_value": log.new_value,
                    "ip_address": getattr(log, 'ip_address', None),
                    "user_agent": getattr(log, 'user_agent', None),
                    "created_at": log.created_at.isoformat()
                } for log in logs
            ],
            "total": len(logs),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        # If there's a database schema mismatch, return empty logs instead of error
        error_msg = str(e).lower()
        if 'does not exist' in error_msg or 'undefinedcolumn' in error_msg:
            return {
                "logs": [],
                "total": 0,
                "limit": limit,
                "offset": offset
            }
        raise HTTPException(status_code=500, detail=f"Error fetching audit logs: {str(e)}")

@router.get("/logs/errors")
async def get_error_logs(
    user_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    resolved: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get error logs with filtering"""
    try:
        logging_service = LoggingService(db)
        
        severity_enum = None
        if severity:
            try:
                severity_enum = LogLevel(severity.upper())
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid severity level")
        
        start_dt = None
        end_dt = None
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        logs = logging_service.get_error_logs(
            user_id=user_id,
            severity=severity_enum,
            resolved=resolved,
            limit=limit,
            offset=offset,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "session_id": log.session_id,
                    "error_type": log.error_type,
                    "error_message": log.error_message,
                    "stack_trace": log.stack_trace,
                    "url": log.url,
                    "method": log.method,
                    "status_code": log.status_code,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "log_metadata": log.log_metadata,
                    "severity": log.severity.value,
                    "resolved": log.resolved,
                    "resolved_at": log.resolved_at.isoformat() if log.resolved_at else None,
                    "resolved_by": log.resolved_by,
                    "created_at": log.created_at.isoformat()
                } for log in logs
            ],
            "total": len(logs),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching error logs: {str(e)}")

@router.get("/logs/security")
async def get_security_logs(
    user_id: Optional[int] = Query(None),
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    blocked: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get security logs with filtering"""
    try:
        logging_service = LoggingService(db)
        
        severity_enum = None
        if severity:
            try:
                severity_enum = LogLevel(severity.upper())
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid severity level")
        
        start_dt = None
        end_dt = None
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        logs = logging_service.get_security_logs(
            user_id=user_id,
            event_type=event_type,
            severity=severity_enum,
            blocked=blocked,
            limit=limit,
            offset=offset,
            start_date=start_dt,
            end_date=end_dt
        )
        
        return {
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "session_id": log.session_id,
                    "event_type": log.event_type,
                    "description": log.description,
                    "severity": log.severity.value,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "country": log.country,
                    "city": log.city,
                    "log_metadata": log.log_metadata,
                    "blocked": log.blocked,
                    "created_at": log.created_at.isoformat()
                } for log in logs
            ],
            "total": len(logs),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching security logs: {str(e)}")

@router.get("/logs/stats")
async def get_log_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get logging statistics"""
    try:
        logging_service = LoggingService(db)
        
        start_dt = None
        end_dt = None
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        stats = logging_service.get_log_stats(start_dt, end_dt)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching log stats: {str(e)}")

# Additional stats endpoints for dashboard
@router.get("/people/stats")
async def get_people_stats(db: Session = Depends(get_db)):
    """Get people statistics for admin dashboard"""
    try:
        from models.people import People
        total_people = db.query(People).count()
        
        # Recent additions (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_additions = db.query(People).filter(People.created_at >= thirty_days_ago).count()
        
        return {
            "total_people": total_people,
            "recent_additions": recent_additions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching people stats: {str(e)}")

@router.get("/banks/stats")
async def get_banks_stats(db: Session = Depends(get_db)):
    """Get banks statistics for admin dashboard"""
    try:
        from models.banks import Banks
        total_banks = db.query(Banks).count()
        active_banks = db.query(Banks).filter(Banks.is_active == True).count()
        
        return {
            "total_banks": total_banks,
            "active_banks": active_banks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching banks stats: {str(e)}")

@router.get("/insurance/stats")
async def get_insurance_stats(db: Session = Depends(get_db)):
    """Get insurance statistics for admin dashboard"""
    try:
        from models.insurance import Insurance
        total_insurance = db.query(Insurance).count()
        active_insurance = db.query(Insurance).filter(Insurance.is_active == True).count()
        
        return {
            "total_insurance": total_insurance,
            "active_insurance": active_insurance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insurance stats: {str(e)}")

@router.get("/companies/stats")
async def get_companies_stats(db: Session = Depends(get_db)):
    """Get companies statistics for admin dashboard"""
    try:
        from models.companies import Companies
        total_companies = db.query(Companies).count()
        active_companies = db.query(Companies).filter(Companies.is_active == True).count()
        
        return {
            "total_companies": total_companies,
            "active_companies": active_companies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching companies stats: {str(e)}")

@router.get("/payments/stats")
async def get_payments_stats(db: Session = Depends(get_db)):
    """Get payments statistics for admin dashboard"""
    try:
        from models.payment import Payment
        total_payments = db.query(Payment).count()
        
        # Skip payment status filtering due to enum issues for now
        completed_payments = 0
        pending_payments = 0
        total_revenue = 0
        
        return {
            "total_payments": total_payments,
            "completed_payments": completed_payments,
            "pending_payments": pending_payments,
            "total_revenue": total_revenue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments stats: {str(e)}")

# Include the new admin route modules
router.include_router(admin_people.router, prefix="/people", tags=["admin-people"])
router.include_router(admin_banks.router, prefix="/banks", tags=["admin-banks"])
router.include_router(admin_insurance.router, prefix="/insurance", tags=["admin-insurance"])
router.include_router(admin_companies.router, prefix="/companies", tags=["admin-companies"])
router.include_router(admin_payments.router, prefix="/payments", tags=["admin-payments"])
router.include_router(admin_settings.router, prefix="/settings", tags=["admin-settings"])
router.include_router(admin_roles.router, prefix="/roles", tags=["admin-roles"])
