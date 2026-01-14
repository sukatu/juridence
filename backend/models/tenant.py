from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)  # Institution/Organization name
    slug = Column(String(100), unique=True, nullable=False, index=True)  # URL-friendly identifier
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Address Information
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Branding & Customization
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#3B82F6", nullable=False)  # Hex color
    secondary_color = Column(String(7), default="#1E40AF", nullable=False)
    accent_color = Column(String(7), default="#F59E0B", nullable=False)
    font_family = Column(String(100), default="Inter", nullable=False)
    
    # App Customization
    app_name = Column(String(100), default="Legal Search Engine", nullable=False)
    app_tagline = Column(String(255), default="Advanced Legal Research Platform", nullable=False)
    favicon_url = Column(String(500), nullable=True)
    
    # Subscription & Billing
    subscription_plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
    subscription_status = Column(String(50), default="trial", nullable=False)  # trial, active, suspended, cancelled
    trial_ends_at = Column(DateTime, nullable=True)
    subscription_ends_at = Column(DateTime, nullable=True)
    
    # Limits & Usage
    max_users = Column(Integer, default=5, nullable=False)
    max_cases_per_month = Column(Integer, default=1000, nullable=False)
    max_storage_gb = Column(Float, default=1.0, nullable=False)
    features_enabled = Column(JSON, nullable=True)  # List of enabled features
    
    # Status & Settings
    is_active = Column(Boolean, default=True, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)  # Admin approval required
    is_verified = Column(Boolean, default=False, nullable=False)  # Email/domain verification
    
    # Admin & Contact
    admin_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    contact_person_name = Column(String(255), nullable=True)
    contact_person_email = Column(String(255), nullable=True)
    contact_person_phone = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    admin_user = relationship("User", foreign_keys=[admin_user_id], back_populates="admin_tenants")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    subscription_plan = relationship("SubscriptionPlan", back_populates="tenants")
    users = relationship("User", foreign_keys="User.tenant_id", back_populates="tenant")
    settings = relationship("TenantSetting", back_populates="tenant")
    subscription_requests = relationship("SubscriptionRequest", back_populates="tenant")

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Plan Information
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    
    # Pricing
    price_monthly = Column(Float, nullable=False, default=0.0)
    price_yearly = Column(Float, nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Features & Limits
    max_users = Column(Integer, nullable=False, default=1)
    max_cases_per_month = Column(Integer, nullable=False, default=100)
    max_storage_gb = Column(Float, nullable=False, default=0.1)
    features = Column(JSON, nullable=True)  # List of features included
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_popular = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    tenants = relationship("Tenant", back_populates="subscription_plan")
    subscription_requests = relationship("SubscriptionRequest", back_populates="plan")

class SubscriptionRequest(Base):
    __tablename__ = "subscription_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Request Information
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    billing_cycle = Column(String(20), nullable=False)  # monthly, yearly
    
    # Request Details
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected, cancelled
    notes = Column(Text, nullable=True)
    
    # Admin Actions
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="subscription_requests")
    plan = relationship("SubscriptionPlan", back_populates="subscription_requests")
    requester = relationship("User", foreign_keys=[requested_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

class TenantSetting(Base):
    __tablename__ = "tenant_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Setting Information
    key = Column(String(255), nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(50), default="string", nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="settings")
    updater = relationship("User")
