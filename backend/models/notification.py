from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base

class NotificationType(str, enum.Enum):
    SYSTEM = "SYSTEM"
    SUBSCRIPTION = "SUBSCRIPTION"
    SECURITY = "SECURITY"
    SEARCH = "SEARCH"
    CASE_UPDATE = "CASE_UPDATE"
    PAYMENT = "PAYMENT"
    GENERAL = "GENERAL"

class NotificationPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class NotificationStatus(str, enum.Enum):
    UNREAD = "UNREAD"
    READ = "READ"
    ARCHIVED = "ARCHIVED"

# PostgreSQL ENUM types with proper names
notificationtype_enum = Enum(NotificationType, name="notification_type")
notificationpriority_enum = Enum(NotificationPriority, name="notification_priority")
notificationstatus_enum = Enum(NotificationStatus, name="notification_status")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # User who receives the notification
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(notificationtype_enum, default=NotificationType.GENERAL, nullable=False)
    priority = Column(notificationpriority_enum, default=NotificationPriority.MEDIUM, nullable=False)
    status = Column(notificationstatus_enum, default=NotificationStatus.UNREAD, nullable=False)
    
    # Optional metadata
    category = Column(String(100), nullable=True)  # e.g., 'subscription', 'cases', 'billing'
    action_url = Column(String(500), nullable=True)  # URL to navigate to when clicked
    notification_data = Column(JSON, nullable=True)  # Additional data as JSON
    
    # Email/SMS/Push flags
    is_email_sent = Column(Boolean, default=False, nullable=False)
    is_sms_sent = Column(Boolean, default=False, nullable=False)
    is_push_sent = Column(Boolean, default=False, nullable=False)
    
    # Additional fields
    action_text = Column(String(100), nullable=True)
    notification_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, title='{self.title}')>"
    
    @property
    def is_read(self):
        return self.status == NotificationStatus.READ
    
    @property
    def is_expired(self):
        return self.expires_at and self.expires_at < func.now()
    
    def mark_as_read(self):
        self.status = NotificationStatus.READ
        self.read_at = func.now()
    
    def mark_as_unread(self):
        self.status = NotificationStatus.UNREAD
        self.read_at = None
    
    def archive(self):
        self.status = NotificationStatus.ARCHIVED

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Email notifications
    email_notifications = Column(Boolean, default=True, nullable=False)
    email_success = Column(Boolean, default=True, nullable=False)
    email_info = Column(Boolean, default=True, nullable=False)
    email_warning = Column(Boolean, default=True, nullable=False)
    email_error = Column(Boolean, default=True, nullable=False)
    
    # In-app notifications
    in_app_notifications = Column(Boolean, default=True, nullable=False)
    in_app_success = Column(Boolean, default=True, nullable=False)
    in_app_info = Column(Boolean, default=True, nullable=False)
    in_app_warning = Column(Boolean, default=True, nullable=False)
    in_app_error = Column(Boolean, default=True, nullable=False)
    
    # Category preferences
    subscription_notifications = Column(Boolean, default=True, nullable=False)
    case_notifications = Column(Boolean, default=True, nullable=False)
    billing_notifications = Column(Boolean, default=True, nullable=False)
    system_notifications = Column(Boolean, default=True, nullable=False)
    security_notifications = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="notification_preferences")
    
    def __repr__(self):
        return f"<NotificationPreference(user_id={self.user_id})>"