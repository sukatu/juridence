from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class LogLevel(enum.Enum):
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class ActivityType(enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    SEARCH = "search"
    DOWNLOAD = "download"
    UPLOAD = "upload"
    NAVIGATION = "navigation"
    API_CALL = "api_call"
    ERROR = "error"
    SECURITY = "security"
    ADMIN_ACTION = "admin_action"

# PostgreSQL ENUM types with proper names
log_level_enum = Enum(LogLevel, name="log_level")
activity_type_enum = Enum(ActivityType, name="activity_type")

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    method = Column(String(10), nullable=False)  # GET, POST, PUT, DELETE, etc.
    url = Column(Text, nullable=False)
    endpoint = Column(String(255), nullable=True)
    status_code = Column(Integer, nullable=False)
    response_time = Column(Integer, nullable=True)  # in milliseconds
    request_size = Column(Integer, nullable=True)  # in bytes
    response_size = Column(Integer, nullable=True)  # in bytes
    referer = Column(Text, nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=True)  # desktop, mobile, tablet
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships - temporarily disabled to avoid circular import issues
    # user = relationship("User", back_populates="access_logs")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    activity_type = Column(activity_type_enum, nullable=False, index=True)
    action = Column(String(255), nullable=False)  # e.g., "User logged in", "Profile updated"
    description = Column(Text, nullable=True)
    resource_type = Column(String(100), nullable=True)  # e.g., "User", "Case", "Document"
    resource_id = Column(String(100), nullable=True)  # ID of the affected resource
    old_values = Column(JSON, nullable=True)  # Previous values for updates
    new_values = Column(JSON, nullable=True)  # New values for updates
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    log_metadata = Column(JSON, nullable=True)  # Additional context data
    severity = Column(log_level_enum, default=LogLevel.INFO, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships - temporarily disabled to avoid circular import issues
    # user = relationship("User", back_populates="activity_logs")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    table_name = Column(String(100), nullable=False, index=True)
    record_id = Column(String(100), nullable=False, index=True)
    action = Column(String(20), nullable=False)  # INSERT, UPDATE, DELETE
    field_name = Column(String(100), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships - temporarily disabled to avoid circular import issues
    # user = relationship("User", back_populates="audit_logs")

class ErrorLog(Base):
    __tablename__ = "error_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    error_type = Column(String(100), nullable=False)
    error_message = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    method = Column(String(10), nullable=True)
    status_code = Column(Integer, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    log_metadata = Column(JSON, nullable=True)
    severity = Column(log_level_enum, default=LogLevel.ERROR, nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships - temporarily disabled to avoid circular import issues
    # user = relationship("User", foreign_keys=[user_id], back_populates="error_logs")
    # resolver = relationship("User", foreign_keys=[resolved_by])

class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)  # e.g., "failed_login", "suspicious_activity"
    description = Column(Text, nullable=False)
    severity = Column(log_level_enum, default=LogLevel.WARNING, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    log_metadata = Column(JSON, nullable=True)
    blocked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships - temporarily disabled to avoid circular import issues
    # user = relationship("User", back_populates="security_logs")



