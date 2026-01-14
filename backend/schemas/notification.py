from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from models.notification import NotificationType, NotificationStatus, NotificationPriority

class NotificationBase(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    type: NotificationType = NotificationType.GENERAL
    priority: NotificationPriority = NotificationPriority.MEDIUM
    category: Optional[str] = Field(None, max_length=100)
    action_url: Optional[str] = Field(None, max_length=500)
    notification_data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None

class NotificationCreateRequest(NotificationBase):
    user_id: int

class NotificationUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    message: Optional[str] = None
    type: Optional[NotificationType] = None
    priority: Optional[NotificationPriority] = None
    status: Optional[NotificationStatus] = None
    category: Optional[str] = Field(None, max_length=100)
    action_url: Optional[str] = Field(None, max_length=500)
    notification_data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    status: NotificationStatus
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class NotificationStatsResponse(BaseModel):
    total: int
    unread: int
    read: int
    archived: int
    by_type: Dict[str, int]
    recent: int

# Helper function to create notification
def create_notification(
    user_id: int,
    title: str,
    message: str,
    type: NotificationType = NotificationType.GENERAL,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    category: Optional[str] = None,
    action_url: Optional[str] = None,
    notification_data: Optional[Dict[str, Any]] = None,
    expires_at: Optional[datetime] = None
) -> NotificationCreateRequest:
    """Helper function to create a notification request"""
    return NotificationCreateRequest(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        priority=priority,
        category=category,
        action_url=action_url,
        metadata=metadata,
        expires_at=expires_at
    )