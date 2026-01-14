from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from config import settings

# JWT token scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt directly."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly."""
    try:
        return bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt(rounds=10)
        ).decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
        
        if payload is None:
            raise credentials_exception
        
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        import logging
        logging.error(f"Authentication error: {str(e)}")
        raise credentials_exception

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current active user."""
    from models.user import UserStatus
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current user if authenticated, otherwise return None."""
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        if not token:
            return None
            
        payload = verify_token(token)
        
        if payload is None:
            return None
        
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except HTTPException:
        # If it's an HTTPException, re-raise it
        raise
    except Exception as e:
        # For any other exception, log it and return None
        import logging
        logging.debug(f"Optional authentication failed: {str(e)}")
        return None

def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Get the current admin user."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def authenticate_user(db: Session, email: str, password: str) -> Union[User, bool]:
    """Authenticate a user with email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not user.hashed_password:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_user_token(user: User) -> str:
    """Create an access token for a user."""
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return access_token

def verify_google_token(token: str) -> Optional[dict]:
    """Verify Google OAuth token and extract user info."""
    # This would typically involve calling Google's API to verify the token
    # For now, we'll implement a basic structure
    try:
        # In a real implementation, you would:
        # 1. Call Google's tokeninfo endpoint
        # 2. Verify the token signature
        # 3. Extract user information
        # For now, we'll return a mock response
        return {
            "sub": "google_user_id",
            "email": "user@example.com",
            "name": "Google User",
            "picture": "https://example.com/picture.jpg"
        }
    except Exception:
        return None
