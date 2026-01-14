from fastapi import APIRouter, Depends, HTTPException, status
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
    PasswordResetRequest, PasswordReset, GoogleAuth, EmailVerification
)
from auth import (
    authenticate_user, create_user_token, get_current_user,
    get_password_hash, verify_password, verify_google_token
)
from services.email_service import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["authentication"])

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
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
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
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_user_token(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@router.post("/google")
async def google_auth(google_data: GoogleAuth, db: Session = Depends(get_db)):
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
    db.commit()
    
    # Create access token
    access_token = create_user_token(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
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
async def get_verification_code(email: str, db: Session = Depends(get_db)):
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
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard token)."""
    return {"message": "Logged out successfully"}
