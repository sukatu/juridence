from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    PREMIUM = "premium"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

# PostgreSQL ENUM types with proper names
user_role_enum = Enum(UserRole, name="user_role")
user_status_enum = Enum(UserStatus, name="user_status")

class User(Base):
    __tablename__ = "users"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Basic user information
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    
    # Authentication
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True)
    verification_code = Column(String(6), nullable=True)  # 6-digit OTP code
    verification_code_expires = Column(DateTime, nullable=True)  # OTP expiration time
    
    # OAuth
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    google_email = Column(String(255), nullable=True)
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'facebook', etc.
    
    # Password reset
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    
    # User status and role
    role = Column(user_role_enum, default=UserRole.USER, nullable=False)
    status = Column(user_status_enum, default=UserStatus.PENDING, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # Multi-tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    is_tenant_admin = Column(Boolean, default=False, nullable=False)
    
    # Profile information
    profile_picture = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    organization = Column(String(200), nullable=True)
    job_title = Column(String(100), nullable=True)
    user_type = Column(String(50), nullable=True)  # Selected role: administrator, court_registrar, corporate_client
    court_type = Column(String(50), nullable=True)  # Court type for court registrar: high_court, supreme_court, court_of_appeal
    entity_type = Column(String(50), nullable=True)  # For corporate_client: 'company', 'bank', or 'insurance'
    entity_id = Column(Integer, nullable=True)  # ID of the selected company, bank, or insurance
    
    # Preferences
    email_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=False, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Subscription and billing
    subscription_plan = Column(String(50), nullable=True)  # 'free', 'basic', 'premium'
    subscription_expires = Column(DateTime, nullable=True)
    is_premium = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Security
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", foreign_keys=[tenant_id], back_populates="users")
    admin_tenants = relationship("Tenant", foreign_keys="Tenant.admin_user_id", back_populates="admin_user")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    payments = relationship("Payment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False)
    security_events = relationship("SecurityEvent", back_populates="user")
    two_factor_auth = relationship("TwoFactorAuth", back_populates="user", uselist=False)
    api_keys = relationship("ApiKey", back_populates="user")
    login_sessions = relationship("LoginSession", back_populates="user")
    user_roles = relationship("UserRole", foreign_keys="UserRole.user_id", back_populates="user")
    # Logging relationships - temporarily disabled to avoid import issues
    # access_logs = relationship("AccessLog", back_populates="user", lazy="dynamic")
    # activity_logs = relationship("ActivityLog", back_populates="user", lazy="dynamic")
    # audit_logs = relationship("AuditLog", back_populates="user", lazy="dynamic")
    
    # Usage tracking relationships
    usage_records = relationship("UsageTracking", back_populates="user", lazy="dynamic")
    billing_summaries = relationship("BillingSummary", back_populates="user", lazy="dynamic")
    # error_logs = relationship("ErrorLog", foreign_keys="ErrorLog.user_id", back_populates="user", lazy="dynamic")
    # security_logs = relationship("SecurityLog", back_populates="user", lazy="dynamic")
    # cases = relationship("Case", back_populates="user")
    # searches = relationship("Search", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.first_name} {self.last_name}')>"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_active(self):
        return self.status == UserStatus.ACTIVE and not self.locked_until
    
    @property
    def is_locked(self):
        return self.locked_until is not None and self.locked_until > func.now()
