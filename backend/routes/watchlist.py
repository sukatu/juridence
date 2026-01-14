from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from database import get_db
from models.watchlist import Watchlist
from models.user import User
from models.people import People
from models.companies import Companies
from models.banks import Banks
from models.insurance import Insurance
from auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class WatchlistCreate(BaseModel):
    entity_type: str  # 'person' or 'company' (includes banks, insurance)
    entity_id: int
    notes: Optional[str] = None
    notify_on_new_cases: Optional[bool] = True
    notify_on_risk_change: Optional[bool] = True
    notify_on_regulatory_updates: Optional[bool] = False

class WatchlistUpdate(BaseModel):
    notes: Optional[str] = None
    notify_on_new_cases: Optional[bool] = None
    notify_on_risk_change: Optional[bool] = None
    notify_on_regulatory_updates: Optional[bool] = None

class WatchlistResponse(BaseModel):
    id: int
    user_id: int
    entity_type: str
    entity_id: int
    entity_name: Optional[str]
    notes: Optional[str]
    notify_on_new_cases: bool
    notify_on_risk_change: bool
    notify_on_regulatory_updates: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

def get_entity_name(entity_type: str, entity_id: int, db: Session) -> Optional[str]:
    """Get the name of an entity by type and ID"""
    try:
        if entity_type == 'person':
            person = db.query(People).filter(People.id == entity_id).first()
            if person:
                return person.full_name
        elif entity_type == 'company':
            company = db.query(Companies).filter(Companies.id == entity_id).first()
            if company:
                return company.name
        elif entity_type == 'bank':
            bank = db.query(Banks).filter(Banks.id == entity_id).first()
            if bank:
                return bank.name
        elif entity_type == 'insurance':
            insurance = db.query(Insurance).filter(Insurance.id == entity_id).first()
            if insurance:
                return insurance.name
    except Exception as e:
        print(f"Error getting entity name: {e}")
    return None

@router.post("/", response_model=WatchlistResponse)
async def add_to_watchlist(
    watchlist_data: WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an item to the user's watchlist"""
    try:
        # Validate entity exists
        entity_name = get_entity_name(watchlist_data.entity_type, watchlist_data.entity_id, db)
        if not entity_name:
            raise HTTPException(
                status_code=404,
                detail=f"{watchlist_data.entity_type.capitalize()} with ID {watchlist_data.entity_id} not found"
            )
        
        # Check if already in watchlist
        existing = db.query(Watchlist).filter(
            and_(
                Watchlist.user_id == current_user.id,
                Watchlist.entity_type == watchlist_data.entity_type,
                Watchlist.entity_id == watchlist_data.entity_id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Item is already in your watchlist"
            )
        
        # Create watchlist entry
        watchlist_item = Watchlist(
            user_id=current_user.id,
            entity_type=watchlist_data.entity_type,
            entity_id=watchlist_data.entity_id,
            entity_name=entity_name,
            notes=watchlist_data.notes,
            notify_on_new_cases=watchlist_data.notify_on_new_cases,
            notify_on_risk_change=watchlist_data.notify_on_risk_change,
            notify_on_regulatory_updates=watchlist_data.notify_on_regulatory_updates
        )
        
        db.add(watchlist_item)
        db.commit()
        db.refresh(watchlist_item)
        
        return watchlist_item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding to watchlist: {str(e)}")

@router.get("/", response_model=List[WatchlistResponse])
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    entity_type: Optional[str] = Query(None, description="Filter by entity type")
):
    """Get user's watchlist items"""
    try:
        query = db.query(Watchlist).filter(Watchlist.user_id == current_user.id)
        
        if entity_type:
            query = query.filter(Watchlist.entity_type == entity_type)
        
        watchlist_items = query.order_by(Watchlist.created_at.desc()).all()
        return watchlist_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching watchlist: {str(e)}")

@router.get("/check/{entity_type}/{entity_id}")
async def check_watchlist_status(
    entity_type: str,
    entity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if an item is in the user's watchlist"""
    try:
        watchlist_item = db.query(Watchlist).filter(
            and_(
                Watchlist.user_id == current_user.id,
                Watchlist.entity_type == entity_type,
                Watchlist.entity_id == entity_id
            )
        ).first()
        
        return {
            "is_in_watchlist": watchlist_item is not None,
            "watchlist_id": watchlist_item.id if watchlist_item else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking watchlist status: {str(e)}")

@router.delete("/{watchlist_id}")
async def remove_from_watchlist(
    watchlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an item from the user's watchlist"""
    try:
        watchlist_item = db.query(Watchlist).filter(
            and_(
                Watchlist.id == watchlist_id,
                Watchlist.user_id == current_user.id
            )
        ).first()
        
        if not watchlist_item:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        
        db.delete(watchlist_item)
        db.commit()
        
        return {"message": "Item removed from watchlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing from watchlist: {str(e)}")

@router.delete("/entity/{entity_type}/{entity_id}")
async def remove_entity_from_watchlist(
    entity_type: str,
    entity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an entity from watchlist by entity type and ID"""
    try:
        watchlist_item = db.query(Watchlist).filter(
            and_(
                Watchlist.user_id == current_user.id,
                Watchlist.entity_type == entity_type,
                Watchlist.entity_id == entity_id
            )
        ).first()
        
        if not watchlist_item:
            raise HTTPException(status_code=404, detail="Item not found in watchlist")
        
        db.delete(watchlist_item)
        db.commit()
        
        return {"message": "Item removed from watchlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing from watchlist: {str(e)}")

@router.put("/{watchlist_id}", response_model=WatchlistResponse)
async def update_watchlist_item(
    watchlist_id: int,
    update_data: WatchlistUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a watchlist item"""
    try:
        watchlist_item = db.query(Watchlist).filter(
            and_(
                Watchlist.id == watchlist_id,
                Watchlist.user_id == current_user.id
            )
        ).first()
        
        if not watchlist_item:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        
        if update_data.notes is not None:
            watchlist_item.notes = update_data.notes
        if update_data.notify_on_new_cases is not None:
            watchlist_item.notify_on_new_cases = update_data.notify_on_new_cases
        if update_data.notify_on_risk_change is not None:
            watchlist_item.notify_on_risk_change = update_data.notify_on_risk_change
        if update_data.notify_on_regulatory_updates is not None:
            watchlist_item.notify_on_regulatory_updates = update_data.notify_on_regulatory_updates
        
        db.commit()
        db.refresh(watchlist_item)
        
        return watchlist_item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating watchlist item: {str(e)}")
