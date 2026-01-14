from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey, DECIMAL, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    UNPAID = "unpaid"

class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

# PostgreSQL ENUM types with proper names
subscriptionstatus_enum = Enum(SubscriptionStatus, name="subscription_status")
subscriptionplan_enum = Enum(SubscriptionPlan, name="subscription_plan")
paymentstatus_enum = Enum(PaymentStatus, name="payment_status")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Subscription details
    plan = Column(subscriptionplan_enum, nullable=False, default=SubscriptionPlan.FREE)
    status = Column(subscriptionstatus_enum, nullable=False, default=SubscriptionStatus.ACTIVE)
    
    # Billing
    amount = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    currency = Column(String(3), nullable=False, default="USD")
    billing_cycle = Column(String(20), nullable=False, default="monthly")  # monthly, yearly
    
    # Dates
    start_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    trial_end = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # External payment provider
    stripe_subscription_id = Column(String(255), nullable=True, index=True)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    
    # Features and limits
    features = Column(JSON, nullable=True)  # JSON array of features
    limits = Column(JSON, nullable=True)    # JSON object with usage limits
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    payments = relationship("Payment", back_populates="subscription")
    usage_records = relationship("UsageRecord", back_populates="subscription")

class UsageRecord(Base):
    __tablename__ = "usage_records"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Usage tracking
    resource_type = Column(String(50), nullable=False)  # searches, api_calls, exports, etc.
    count = Column(Integer, nullable=False, default=1)
    
    # Metadata
    usage_metadata = Column(JSON, nullable=True)  # Additional usage data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="usage_records")
    user = relationship("User")



