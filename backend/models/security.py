from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class SecurityEventType(str, enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    PASSWORD_CHANGED = "password_changed"
    EMAIL_CHANGED = "email_changed"
    PHONE_CHANGED = "phone_changed"
    PROFILE_UPDATED = "profile_updated"
    SUBSCRIPTION_CHANGED = "subscription_changed"
    TWO_FA_ENABLED = "two_fa_enabled"
    TWO_FA_DISABLED = "two_fa_disabled"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    API_KEY_CREATED = "api_key_created"
    API_KEY_REVOKED = "api_key_revoked"

# PostgreSQL ENUM types with proper names
securityeventtype_enum = Enum(SecurityEventType, name="security_event_type")

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Event details
    event_type = Column(securityeventtype_enum, nullable=False)
    description = Column(Text, nullable=False)
    
    # Request details
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    country = Column(String(2), nullable=True)  # ISO country code
    city = Column(String(100), nullable=True)
    
    # Additional data
    security_metadata = Column(JSON, nullable=True)
    risk_score = Column(Integer, nullable=True)  # 0-100 risk assessment
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="security_events")

class TwoFactorAuth(Base):
    __tablename__ = "two_factor_auth"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True, unique=True)
    
    # 2FA settings
    is_enabled = Column(Boolean, default=False, nullable=False)
    method = Column(String(20), nullable=True)  # sms, authenticator, email
    
    # SMS 2FA
    phone_number = Column(String(20), nullable=True)
    sms_verified = Column(Boolean, default=False, nullable=False)
    
    # Authenticator 2FA
    secret_key = Column(String(32), nullable=True)  # Base32 encoded secret
    backup_codes = Column(JSON, nullable=True)  # Array of backup codes
    
    # Email 2FA
    email_verified = Column(Boolean, default=False, nullable=False)
    
    # Recovery
    recovery_codes = Column(JSON, nullable=True)  # Array of recovery codes
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="two_factor_auth")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Key details
    name = Column(String(100), nullable=False)
    key_hash = Column(String(255), nullable=False, unique=True, index=True)
    key_prefix = Column(String(8), nullable=False)  # First 8 chars for display
    
    # Permissions
    permissions = Column(JSON, nullable=True)  # Array of allowed permissions
    rate_limit = Column(Integer, nullable=True)  # Requests per hour
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Expiration
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="api_keys")

class LoginSession(Base):
    __tablename__ = "login_sessions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Session details
    session_token = Column(String(255), nullable=False, unique=True, index=True)
    refresh_token = Column(String(255), nullable=True, unique=True, index=True)
    
    # Request details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    country = Column(String(2), nullable=True)
    city = Column(String(100), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_mobile = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="login_sessions")



