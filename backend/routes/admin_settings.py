from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.settings import Settings
from schemas.admin import SettingsListResponse, SettingsResponse, SettingsCreateRequest, SettingsUpdateRequest
from typing import List, Optional
import math

router = APIRouter()

@router.get("/stats")
async def get_settings_stats(db: Session = Depends(get_db)):
    """Get comprehensive settings statistics for admin dashboard"""
    try:
        # Basic counts
        total_settings = db.query(Settings).count()
        
        # Category breakdown
        categories = db.query(Settings.category).distinct().all()
        category_count = len(categories)
        
        # Public vs Private settings
        public_settings = db.query(Settings).filter(Settings.is_public == True).count()
        private_settings = total_settings - public_settings
        
        # Editable vs Non-editable settings
        editable_settings = db.query(Settings).filter(Settings.is_editable == True).count()
        non_editable_settings = total_settings - editable_settings
        
        # Required vs Optional settings
        required_settings = db.query(Settings).filter(Settings.is_required == True).count()
        optional_settings = total_settings - required_settings
        
        return {
            "total_settings": total_settings,
            "category_count": category_count,
            "public_settings": public_settings,
            "private_settings": private_settings,
            "editable_settings": editable_settings,
            "non_editable_settings": non_editable_settings,
            "required_settings": required_settings,
            "optional_settings": optional_settings,
            "last_updated": db.query(Settings.updated_at).order_by(Settings.updated_at.desc()).first()[0].isoformat() if db.query(Settings.updated_at).first() else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching settings stats: {str(e)}")

@router.get("", response_model=SettingsListResponse)
async def get_settings(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_public: Optional[bool] = Query(None),
    is_editable: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of settings with optional filtering"""
    try:
        query = db.query(Settings)
        
        # Apply search filter
        if search:
            query = query.filter(
                Settings.key.ilike(f"%{search}%") |
                Settings.description.ilike(f"%{search}%") |
                Settings.value.ilike(f"%{search}%")
            )
        
        # Apply category filter
        if category:
            query = query.filter(Settings.category == category)
        
        # Apply public filter
        if is_public is not None:
            query = query.filter(Settings.is_public == is_public)
        
        # Apply editable filter
        if is_editable is not None:
            query = query.filter(Settings.is_editable == is_editable)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        settings = query.offset(offset).limit(limit).all()
        
        # Calculate total pages
        total_pages = math.ceil(total / limit)
        
        return SettingsListResponse(
            settings=settings,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching settings: {str(e)}")

@router.get("/{setting_id}", response_model=SettingsResponse)
async def get_setting(setting_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific setting"""
    try:
        setting = db.query(Settings).filter(Settings.id == setting_id).first()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching setting: {str(e)}")

@router.get("/key/{key}", response_model=SettingsResponse)
async def get_setting_by_key(key: str, db: Session = Depends(get_db)):
    """Get setting by key"""
    try:
        setting = db.query(Settings).filter(Settings.key == key).first()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching setting: {str(e)}")

@router.post("", response_model=SettingsResponse)
async def create_setting(setting_data: SettingsCreateRequest, db: Session = Depends(get_db)):
    """Create a new setting"""
    try:
        # Check if key already exists
        existing_setting = db.query(Settings).filter(Settings.key == setting_data.key).first()
        if existing_setting:
            raise HTTPException(status_code=400, detail="Setting with this key already exists")
        
        # Create setting
        setting = Settings(**setting_data.dict())
        db.add(setting)
        db.commit()
        db.refresh(setting)
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating setting: {str(e)}")

@router.put("/{setting_id}", response_model=SettingsResponse)
async def update_setting(setting_id: int, setting_data: SettingsUpdateRequest, db: Session = Depends(get_db)):
    """Update an existing setting"""
    try:
        setting = db.query(Settings).filter(Settings.id == setting_id).first()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        # Check if setting is editable
        if not setting.is_editable:
            raise HTTPException(status_code=400, detail="This setting cannot be edited")
        
        # Update only provided fields
        update_data = setting_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(setting, field, value)
        
        db.commit()
        db.refresh(setting)
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating setting: {str(e)}")

@router.put("/key/{key}", response_model=SettingsResponse)
async def update_setting_by_key(key: str, setting_data: SettingsUpdateRequest, db: Session = Depends(get_db)):
    """Update setting by key"""
    try:
        setting = db.query(Settings).filter(Settings.key == key).first()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        # Check if setting is editable
        if not setting.is_editable:
            raise HTTPException(status_code=400, detail="This setting cannot be edited")
        
        # Update only provided fields
        update_data = setting_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(setting, field, value)
        
        db.commit()
        db.refresh(setting)
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating setting: {str(e)}")

@router.delete("/{setting_id}")
async def delete_setting(setting_id: int, db: Session = Depends(get_db)):
    """Delete a setting record"""
    try:
        setting = db.query(Settings).filter(Settings.id == setting_id).first()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        # Check if setting is required
        if setting.is_required:
            raise HTTPException(status_code=400, detail="Cannot delete required setting")
        
        # Delete the setting
        db.delete(setting)
        db.commit()
        
        return {"message": "Setting deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting setting: {str(e)}")

@router.get("/category/{category}", response_model=SettingsListResponse)
async def get_settings_by_category(
    category: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all settings in a specific category"""
    try:
        query = db.query(Settings).filter(Settings.category == category)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        settings = query.offset(offset).limit(limit).all()
        
        # Calculate total pages
        total_pages = math.ceil(total / limit)
        
        return SettingsListResponse(
            settings=settings,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching settings by category: {str(e)}")
