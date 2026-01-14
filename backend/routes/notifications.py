from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models.notification import Notification, NotificationType, NotificationStatus, NotificationPriority
from models.user import User
from schemas.notification import (
    NotificationResponse, NotificationCreateRequest, NotificationUpdateRequest,
    NotificationListResponse, NotificationStatsResponse
)

router = APIRouter()

@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of notifications"""
    try:
        query = db.query(Notification)
        
        # Filter by user if provided
        if user_id:
            query = query.filter(Notification.user_id == user_id)
        
        # Filter by status
        if status:
            query = query.filter(Notification.status == status)
        
        # Filter by type
        if type:
            query = query.filter(Notification.type == type)
        
        # Filter by category
        if category:
            query = query.filter(Notification.category == category)
        
        # Search in title and message
        if search:
            query = query.filter(
                or_(
                    Notification.title.ilike(f"%{search}%"),
                    Notification.message.ilike(f"%{search}%")
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        notifications = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit).all()
        
        return NotificationListResponse(
            notifications=notifications,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

@router.get("/stats", response_model=NotificationStatsResponse)
async def get_notification_stats(
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get notification statistics"""
    try:
        query = db.query(Notification)
        
        if user_id:
            query = query.filter(Notification.user_id == user_id)
        
        total = query.count()
        unread = query.filter(Notification.status == NotificationStatus.UNREAD).count()
        read = query.filter(Notification.status == NotificationStatus.READ).count()
        archived = query.filter(Notification.status == NotificationStatus.ARCHIVED).count()
        
        # Count by type
        system = query.filter(Notification.type == NotificationType.SYSTEM).count()
        subscription = query.filter(Notification.type == NotificationType.SUBSCRIPTION).count()
        security = query.filter(Notification.type == NotificationType.SECURITY).count()
        search = query.filter(Notification.type == NotificationType.SEARCH).count()
        case_update = query.filter(Notification.type == NotificationType.CASE_UPDATE).count()
        payment = query.filter(Notification.type == NotificationType.PAYMENT).count()
        general = query.filter(Notification.type == NotificationType.GENERAL).count()
        
        # Recent notifications (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent = query.filter(Notification.created_at >= week_ago).count()
        
        return NotificationStatsResponse(
            total=total,
            unread=unread,
            read=read,
            archived=archived,
            by_type={
                "system": system,
                "subscription": subscription,
                "security": security,
                "search": search,
                "case_update": case_update,
                "payment": payment,
                "general": general
            },
            recent=recent
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notification stats: {str(e)}")

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == notification_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        notification = Notification(**notification_data.dict())
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating notification: {str(e)}")

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific notification by ID"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return notification
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notification: {str(e)}")

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_data: NotificationUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update a notification"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        # Update fields
        update_data = notification_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(notification, field, value)
        
        db.commit()
        db.refresh(notification)
        
        return notification
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating notification: {str(e)}")

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.mark_as_read()
        db.commit()
        
        return {"message": "Notification marked as read", "notification_id": notification_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error marking notification as read: {str(e)}")

@router.put("/{notification_id}/unread")
async def mark_as_unread(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Mark a notification as unread"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.mark_as_unread()
        db.commit()
        
        return {"message": "Notification marked as unread", "notification_id": notification_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error marking notification as unread: {str(e)}")

@router.put("/mark-all-read")
async def mark_all_as_read(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for a user"""
    try:
        notifications = db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.status == NotificationStatus.UNREAD
            )
        ).all()
        
        for notification in notifications:
            notification.mark_as_read()
        
        db.commit()
        
        return {"message": f"Marked {len(notifications)} notifications as read"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error marking notifications as read: {str(e)}")

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        db.delete(notification)
        db.commit()
        
        return {"message": "Notification deleted", "notification_id": notification_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting notification: {str(e)}")

@router.delete("/bulk")
async def delete_notifications_bulk(
    notification_ids: List[int],
    db: Session = Depends(get_db)
):
    """Delete multiple notifications"""
    try:
        notifications = db.query(Notification).filter(Notification.id.in_(notification_ids)).all()
        
        for notification in notifications:
            db.delete(notification)
        
        db.commit()
        
        return {"message": f"Deleted {len(notifications)} notifications"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting notifications: {str(e)}")