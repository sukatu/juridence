from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
from datetime import datetime

from database import get_db
from models.user import User
from schemas.user import UserUpdate, UserResponse, PasswordChange
from auth import get_current_user, get_password_hash, verify_password

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile information."""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile information."""
    # Get the user from the current database session to ensure it's bound
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the database user
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    
    return db_user

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
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile picture."""
    print(f"Upload request received for user {current_user.id}")
    print(f"File details: {file.filename}, {file.content_type}, {file.size}")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        print(f"Invalid file type: {file.content_type}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (5MB max)
    file_content = await file.read()
    print(f"File content size: {len(file_content)} bytes")
    
    if len(file_content) > 5 * 1024 * 1024:
        print("File too large")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    print(f"Generated filename: {unique_filename}")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    print(f"Upload directory: {upload_dir}")
    
    # Save file
    file_path = os.path.join(upload_dir, unique_filename)
    print(f"Saving file to: {file_path}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Update user profile picture
    profile_picture_url = f"/uploads/avatars/{unique_filename}"
    current_user.profile_picture = profile_picture_url
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    print(f"Profile picture updated to: {profile_picture_url}")
    
    return {
        "message": "Avatar uploaded successfully",
        "profile_picture": profile_picture_url
    }

@router.delete("/avatar")
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete profile picture."""
    if current_user.profile_picture:
        # Delete file from filesystem
        file_path = current_user.profile_picture.lstrip('/')
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Update database
        current_user.profile_picture = None
        current_user.updated_at = datetime.utcnow()
        db.commit()
    
    return {"message": "Avatar deleted successfully"}

@router.get("/activity")
async def get_user_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user activity summary."""
    return {
        "last_login": current_user.last_login,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "is_verified": current_user.is_verified,
        "failed_login_attempts": current_user.failed_login_attempts,
        "is_locked": current_user.is_locked,
        "account_age_days": (datetime.utcnow() - current_user.created_at).days if current_user.created_at else 0
    }

@router.post("/deactivate")
async def deactivate_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate user account."""
    current_user.status = "inactive"
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Account deactivated successfully"}

# Admin-only endpoints for managing other users
@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all users (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_by_id(
    user_id: int,
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user by ID (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update only provided fields
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}")
async def delete_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user by ID (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete profile picture if exists
    if user.profile_picture:
        file_path = user.profile_picture.lstrip('/')
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle user active/inactive status (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status"
        )
    
    # Toggle status
    user.status = "inactive" if user.status == "active" else "active"
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "message": f"User status changed to {user.status}",
        "status": user.status
    }