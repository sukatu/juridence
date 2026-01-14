from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.security import SecurityEvent, TwoFactorAuth, ApiKey, LoginSession, SecurityEventType
from schemas.security import (
    SecurityEventResponse, TwoFactorAuthResponse, TwoFactorAuthSetup, TwoFactorAuthVerify,
    ApiKeyResponse, ApiKeyCreate, ApiKeyUpdate, ApiKeyCreateResponse,
    LoginSessionResponse, SecuritySettingsResponse, PasswordChangeRequest
)
from auth import get_current_user, verify_password, get_password_hash
from typing import List, Optional
import logging
import secrets
import string
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta
import hashlib

router = APIRouter()

def generate_api_key() -> str:
    """Generate a secure API key"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.client.host if request.client else "unknown"

def get_user_agent(request: Request) -> str:
    """Get user agent from request"""
    return request.headers.get('User-Agent', 'unknown')

def create_security_event(
    db: Session,
    user_id: int,
    event_type: SecurityEventType,
    description: str,
    request: Request,
    metadata: Optional[dict] = None,
    risk_score: Optional[int] = None
):
    """Create a security event record"""
    security_event = SecurityEvent(
        user_id=user_id,
        event_type=event_type,
        description=description,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        security_metadata=metadata,
        risk_score=risk_score
    )
    db.add(security_event)
    db.commit()

@router.get("/events", response_model=List[SecurityEventResponse])
async def get_security_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's security events"""
    try:
        events = db.query(SecurityEvent).filter(
            SecurityEvent.user_id == current_user.id
        ).order_by(SecurityEvent.created_at.desc()).offset(offset).limit(limit).all()
        
        return [SecurityEventResponse.from_orm(event) for event in events]
    except Exception as e:
        logging.error(f"Error getting security events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security events"
        )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user's password"""
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.hashed_password):
            create_security_event(
                db, current_user.id, SecurityEventType.LOGIN_FAILED,
                "Failed password change attempt - incorrect current password", request,
                risk_score=30
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirmation do not match"
            )
        
        if len(password_data.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long"
            )
        
        # Update password
        current_user.hashed_password = get_password_hash(password_data.new_password)
        db.commit()
        
        # Log security event
        create_security_event(
            db, current_user.id, SecurityEventType.PASSWORD_CHANGED,
            "Password changed successfully", request
        )
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error changing password: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )

@router.get("/2fa", response_model=TwoFactorAuthResponse)
async def get_two_factor_auth(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's 2FA status"""
    try:
        two_fa = current_user.two_factor_auth
        
        if not two_fa:
            # Create default 2FA record
            two_fa = TwoFactorAuth(user_id=current_user.id)
            db.add(two_fa)
            db.commit()
            db.refresh(two_fa)
        
        return TwoFactorAuthResponse.from_orm(two_fa)
    except Exception as e:
        logging.error(f"Error getting 2FA status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve 2FA status"
        )

@router.post("/2fa/setup")
async def setup_two_factor_auth(
    setup_data: TwoFactorAuthSetup,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup two-factor authentication"""
    try:
        two_fa = current_user.two_factor_auth
        
        if not two_fa:
            two_fa = TwoFactorAuth(user_id=current_user.id)
            db.add(two_fa)
        
        if setup_data.method == "authenticator":
            # Generate secret key for authenticator app
            secret_key = pyotp.random_base32()
            two_fa.secret_key = secret_key
            two_fa.method = "authenticator"
            
            # Generate backup codes
            backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
            two_fa.backup_codes = backup_codes
            
            # Generate QR code
            totp_uri = pyotp.totp.TOTP(secret_key).provisioning_uri(
                name=current_user.email,
                issuer_name="DennisLaw SVD"
            )
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            qr_code = base64.b64encode(buffer.getvalue()).decode()
            
            db.commit()
            
            return {
                "secret_key": secret_key,
                "qr_code": qr_code,
                "backup_codes": backup_codes,
                "message": "2FA setup initiated. Scan QR code with authenticator app."
            }
        
        elif setup_data.method == "sms":
            if not setup_data.phone_number:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number required for SMS 2FA"
                )
            
            two_fa.method = "sms"
            two_fa.phone_number = setup_data.phone_number
            two_fa.sms_verified = False
            
            db.commit()
            
            return {
                "message": "SMS 2FA setup initiated. Phone number saved for verification."
            }
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 2FA method"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error setting up 2FA: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to setup 2FA"
        )

@router.post("/2fa/verify")
async def verify_two_factor_auth(
    verify_data: TwoFactorAuthVerify,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify two-factor authentication setup"""
    try:
        two_fa = current_user.two_factor_auth
        
        if not two_fa:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA not set up"
            )
        
        if verify_data.method == "authenticator":
            if not two_fa.secret_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Authenticator not set up"
                )
            
            totp = pyotp.TOTP(two_fa.secret_key)
            if not totp.verify(verify_data.code):
                create_security_event(
                    db, current_user.id, SecurityEventType.LOGIN_FAILED,
                    "Failed 2FA verification - invalid code", request,
                    risk_score=40
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid verification code"
                )
            
            two_fa.is_enabled = True
            two_fa.last_used = datetime.now()
            
        elif verify_data.method == "sms":
            if not two_fa.phone_number:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SMS not set up"
                )
            
            # In a real implementation, you would verify the SMS code here
            # For now, we'll just enable it
            two_fa.is_enabled = True
            two_fa.sms_verified = True
            two_fa.last_used = datetime.now()
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification method"
            )
        
        db.commit()
        
        # Log security event
        create_security_event(
            db, current_user.id, SecurityEventType.TWO_FA_ENABLED,
            f"2FA enabled via {verify_data.method}", request
        )
        
        return {"message": "2FA enabled successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error verifying 2FA: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify 2FA"
        )

@router.post("/2fa/disable")
async def disable_two_factor_auth(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable two-factor authentication"""
    try:
        two_fa = current_user.two_factor_auth
        
        if not two_fa or not two_fa.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA not enabled"
            )
        
        two_fa.is_enabled = False
        two_fa.secret_key = None
        two_fa.backup_codes = None
        two_fa.phone_number = None
        two_fa.sms_verified = False
        
        db.commit()
        
        # Log security event
        create_security_event(
            db, current_user.id, SecurityEventType.TWO_FA_DISABLED,
            "2FA disabled", request
        )
        
        return {"message": "2FA disabled successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error disabling 2FA: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disable 2FA"
        )

@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def get_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's API keys"""
    try:
        api_keys = db.query(ApiKey).filter(
            ApiKey.user_id == current_user.id,
            ApiKey.is_active == True
        ).order_by(ApiKey.created_at.desc()).all()
        
        return [ApiKeyResponse.from_orm(key) for key in api_keys]
    except Exception as e:
        logging.error(f"Error getting API keys: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API keys"
        )

@router.post("/api-keys", response_model=ApiKeyCreateResponse)
async def create_api_key(
    key_data: ApiKeyCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new API key"""
    try:
        # Check if user has permission to create API keys
        if not current_user.is_premium:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="API keys require a premium subscription"
            )
        
        # Generate API key
        api_key = generate_api_key()
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        key_prefix = api_key[:8]
        
        # Create API key record
        new_key = ApiKey(
            user_id=current_user.id,
            name=key_data.name,
            key_hash=key_hash,
            key_prefix=key_prefix,
            permissions=key_data.permissions or ["read"],
            rate_limit=key_data.rate_limit or 1000,
            expires_at=key_data.expires_at
        )
        
        db.add(new_key)
        db.commit()
        db.refresh(new_key)
        
        # Log security event
        create_security_event(
            db, current_user.id, SecurityEventType.API_KEY_CREATED,
            f"API key created: {key_data.name}", request
        )
        
        return ApiKeyCreateResponse(
            api_key=ApiKeyResponse.from_orm(new_key),
            key=api_key
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating API key: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )

@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke an API key"""
    try:
        api_key = db.query(ApiKey).filter(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        ).first()
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        api_key.is_active = False
        api_key.revoked_at = datetime.now()
        
        db.commit()
        
        # Log security event
        create_security_event(
            db, current_user.id, SecurityEventType.API_KEY_REVOKED,
            f"API key revoked: {api_key.name}", request
        )
        
        return {"message": "API key revoked successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error revoking API key: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke API key"
        )

@router.get("/sessions", response_model=List[LoginSessionResponse])
async def get_login_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's active login sessions"""
    try:
        sessions = db.query(LoginSession).filter(
            LoginSession.user_id == current_user.id,
            LoginSession.is_active == True
        ).order_by(LoginSession.last_activity.desc()).all()
        
        return [LoginSessionResponse.from_orm(session) for session in sessions]
    except Exception as e:
        logging.error(f"Error getting login sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve login sessions"
        )

@router.delete("/sessions/{session_id}")
async def terminate_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Terminate a specific login session"""
    try:
        session = db.query(LoginSession).filter(
            LoginSession.id == session_id,
            LoginSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session.is_active = False
        db.commit()
        
        return {"message": "Session terminated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error terminating session: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to terminate session"
        )

@router.get("/settings", response_model=SecuritySettingsResponse)
async def get_security_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive security settings"""
    try:
        # Get 2FA status
        two_fa = current_user.two_factor_auth
        if not two_fa:
            two_fa = TwoFactorAuth(user_id=current_user.id)
            db.add(two_fa)
            db.commit()
            db.refresh(two_fa)
        
        # Get API keys
        api_keys = db.query(ApiKey).filter(
            ApiKey.user_id == current_user.id,
            ApiKey.is_active == True
        ).all()
        
        # Get active sessions
        sessions = db.query(LoginSession).filter(
            LoginSession.user_id == current_user.id,
            LoginSession.is_active == True
        ).order_by(LoginSession.last_activity.desc()).limit(10).all()
        
        # Get recent security events
        recent_events = db.query(SecurityEvent).filter(
            SecurityEvent.user_id == current_user.id
        ).order_by(SecurityEvent.created_at.desc()).limit(10).all()
        
        # Calculate security score
        security_score = 0
        if current_user.hashed_password:
            security_score += 20
        if two_fa.is_enabled:
            security_score += 30
        if current_user.is_verified:
            security_score += 20
        if len(api_keys) > 0:
            security_score += 10
        if current_user.last_login and (datetime.now() - current_user.last_login).days < 30:
            security_score += 20
        
        return SecuritySettingsResponse(
            two_factor_auth=TwoFactorAuthResponse.from_orm(two_fa),
            api_keys=[ApiKeyResponse.from_orm(key) for key in api_keys],
            active_sessions=[LoginSessionResponse.from_orm(session) for session in sessions],
            recent_events=[SecurityEventResponse.from_orm(event) for event in recent_events],
            security_score=min(security_score, 100)
        )
    
    except Exception as e:
        logging.error(f"Error getting security settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security settings"
        )
