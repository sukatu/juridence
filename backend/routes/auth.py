from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import secrets
import string

from database import get_db
from models.user import User, UserRole, UserStatus
from schemas.user import (
    UserCreate, UserLogin, UserResponse, PasswordChange, 
    PasswordResetRequest, PasswordReset, GoogleAuth, EmailVerification,
    RefreshTokenRequest, LogoutRequest
)
from auth import (
    authenticate_user, create_user_token, get_current_admin_user, get_current_user,
    generate_refresh_token, get_password_hash, hash_refresh_token,
    verify_password, verify_google_token
)
from config import settings
from models.security import LoginSession
from services.email_service import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["authentication"])

REFRESH_COOKIE_NAME = "juridence_refresh"
REFRESH_COOKIE_PATH = "/api/auth"


def _session_expiry(remember_me: bool) -> datetime:
    if remember_me:
        return datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    return datetime.utcnow() + timedelta(hours=settings.session_token_expire_hours)


def _now_for(value: datetime) -> datetime:
    return datetime.now(value.tzinfo) if value.tzinfo else datetime.utcnow()


def _set_refresh_cookie(response: Response, token: str, expires_at: datetime, remember_me: bool) -> None:
    max_age = max(0, int((expires_at - _now_for(expires_at)).total_seconds())) if remember_me else None
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path=REFRESH_COOKIE_PATH,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
    )


def _create_login_session(db: Session, user: User, request: Request, remember_me: bool):
    refresh_token = generate_refresh_token()
    expires_at = _session_expiry(remember_me)
    user_agent = request.headers.get("user-agent", "")
    session = LoginSession(
        user_id=user.id,
        session_token=secrets.token_urlsafe(32),
        refresh_token=hash_refresh_token(refresh_token),
        ip_address=request.client.host if request.client else None,
        user_agent=user_agent or None,
        is_mobile=any(marker in user_agent.lower() for marker in ("mobile", "android", "iphone", "ipad")),
        expires_at=expires_at,
    )
    db.add(session)
    db.flush()
    return session, refresh_token, expires_at

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check username if provided
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    verification_token = secrets.token_urlsafe(32)
    
    # Generate 6-digit OTP code
    import random
    verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    verification_code_expires = datetime.utcnow() + timedelta(minutes=2)  # OTP expires in 2 minutes
    
    # Determine user role - only allow ADMIN if explicitly selected and authorized
    user_role = UserRole.USER  # Default to USER
    if user_data.role == 'administrator':
        # For security, we'll default to USER unless admin approval is required
        # You may want to add additional validation here
        user_role = UserRole.USER  # Changed from ADMIN for security
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        organization=user_data.organization,
        job_title=user_data.job_title,
        bio=user_data.bio,
        user_type=user_data.role,  # Store selected role: administrator, court_registrar, or corporate_client
        court_type=user_data.court_type,  # Store court type for court registrar
        entity_type=user_data.entity_type,  # Store entity type for corporate client (company, bank, insurance)
        entity_id=user_data.entity_id,  # Store entity ID for corporate client
        hashed_password=hashed_password,
        verification_token=verification_token,
        verification_code=verification_code,
        verification_code_expires=verification_code_expires,
        role=user_role,
        status=UserStatus.PENDING,
        language=user_data.language,
        timezone=user_data.timezone,
        email_notifications=user_data.email_notifications,
        sms_notifications=user_data.sms_notifications
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email with OTP code
    await send_verification_email(db_user.email, verification_code)
    
    return db_user

@router.post("/login")
async def login(
    login_data: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Login user with email and password."""
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user status is active
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account is {user.status.value}. Please verify your email or contact support."
        )
    
    # Update last login and create a revocable browser session.
    user.last_login = datetime.utcnow()
    login_session, refresh_token, expires_at = _create_login_session(
        db, user, request, login_data.remember_me
    )
    db.commit()
    
    # Create access token
    access_token = create_user_token(user, login_session.id)
    _set_refresh_cookie(response, refresh_token, expires_at, login_data.remember_me)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@router.post("/google")
async def google_auth(
    google_data: GoogleAuth,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Login/Register with Google OAuth."""
    google_user_info = verify_google_token(google_data.google_token)
    if not google_user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.google_id == google_user_info["sub"]).first()
    
    if not user:
        # Check if email exists with different provider
        existing_user = db.query(User).filter(User.email == google_user_info["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered with different provider"
            )
        
        # Create new user
        user = User(
            email=google_user_info["email"],
            first_name=google_user_info["name"].split()[0] if google_user_info["name"] else "Google",
            last_name=" ".join(google_user_info["name"].split()[1:]) if google_user_info["name"] and len(google_user_info["name"].split()) > 1 else "User",
            google_id=google_user_info["sub"],
            google_email=google_user_info["email"],
            oauth_provider="google",
            profile_picture=google_user_info.get("picture"),
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Update last login
    user.last_login = datetime.utcnow()
    login_session, refresh_token, expires_at = _create_login_session(
        db, user, request, google_data.remember_me
    )
    db.commit()
    
    # Create access token
    access_token = create_user_token(user, login_session.id)
    _set_refresh_cookie(response, refresh_token, expires_at, google_data.remember_me)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }


@router.post("/refresh")
async def refresh_session(
    request: Request,
    response: Response,
    refresh_data: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
):
    """Issue a fresh access token for an active browser session."""
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token and refresh_data:
        refresh_token = refresh_data.refresh_token
    if not refresh_token:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has expired")

    login_session = db.query(LoginSession).filter(
        LoginSession.refresh_token == hash_refresh_token(refresh_token),
        LoginSession.is_active == True,
        LoginSession.expires_at > datetime.utcnow(),
    ).first()
    if not login_session:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has expired")

    user = db.query(User).filter(User.id == login_session.user_id).first()
    if not user or user.status != UserStatus.ACTIVE:
        login_session.is_active = False
        db.commit()
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is not active")

    login_session.last_activity = datetime.utcnow()
    db.commit()
    remember_me = (login_session.expires_at - _now_for(login_session.expires_at)) > timedelta(hours=24)
    _set_refresh_cookie(response, refresh_token, login_session.expires_at, remember_me)
    return {
        "access_token": create_user_token(user, login_session.id),
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "user": UserResponse.from_orm(user),
    }

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    
    user.reset_token = reset_token
    user.reset_token_expires = reset_token_expires
    db.commit()
    
    # Send reset email
    await send_password_reset_email(user.email, reset_token)
    
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token."""
    user = db.query(User).filter(
        User.reset_token == reset_data.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.query(LoginSession).filter(
        LoginSession.user_id == user.id,
        LoginSession.is_active == True,
    ).update({LoginSession.is_active: False}, synchronize_session=False)
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password change not available for OAuth users"
        )
    
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.query(LoginSession).filter(
        LoginSession.user_id == current_user.id,
        LoginSession.is_active == True,
    ).update({LoginSession.is_active: False}, synchronize_session=False)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.post("/verify-email")
async def verify_email(verification_data: EmailVerification, db: Session = Depends(get_db)):
    """Verify user email with OTP code."""
    user = db.query(User).filter(User.email == verification_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address"
        )
    
    # Check if already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Check if verification code exists
    if not user.verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code found. Please request a new one."
        )
    
    # Check if verification code matches
    if user.verification_code != verification_data.verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Check if verification code has expired
    if user.verification_code_expires and user.verification_code_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one."
        )
    
    # Verify the user
    user.is_verified = True
    user.status = UserStatus.ACTIVE
    user.verification_code = None
    user.verification_code_expires = None
    user.verification_token = None
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification-code")
async def resend_verification_code(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Resend verification code to user's email."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If the email exists, a verification code has been sent"}
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new 6-digit OTP code
    import random
    verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    verification_code_expires = datetime.utcnow() + timedelta(minutes=2)  # OTP expires in 2 minutes
    
    user.verification_code = verification_code
    user.verification_code_expires = verification_code_expires
    db.commit()
    
    # Send verification email with OTP code
    await send_verification_email(user.email, verification_code)
    
    return {"message": "If the email exists, a verification code has been sent"}

@router.get("/test/verification-code/{email}")
async def get_verification_code(
    email: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Testing endpoint to retrieve verification code.
    This should only be used in development/testing environments.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.verification_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No verification code found for this user"
        )
    
    is_expired = user.verification_code_expires and user.verification_code_expires < datetime.utcnow()
    
    return {
        "email": user.email,
        "verification_code": user.verification_code,
        "expires_at": user.verification_code_expires.isoformat() if user.verification_code_expires else None,
        "is_expired": is_expired,
        "is_verified": user.is_verified
    }

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    logout_data: Optional[LogoutRequest] = None,
    db: Session = Depends(get_db),
):
    """Revoke the current refresh session and clear its browser cookie."""
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token and logout_data:
        refresh_token = logout_data.refresh_token
    if refresh_token:
        login_session = db.query(LoginSession).filter(
            LoginSession.refresh_token == hash_refresh_token(refresh_token),
            LoginSession.is_active == True,
        ).first()
        if login_session:
            login_session.is_active = False
            login_session.last_activity = datetime.utcnow()
            db.commit()
    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully"}
