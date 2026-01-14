from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentMethod(enum.Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    CASH = "cash"
    CHECK = "check"

# PostgreSQL ENUM types with proper names
paymentstatus_enum = Enum(PaymentStatus, name="payment_status")
paymentmethod_enum = Enum(PaymentMethod, name="payment_method")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment details
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(paymentstatus_enum, nullable=False, default=PaymentStatus.PENDING)
    
    # External payment provider
    stripe_payment_intent_id = Column(String(255), nullable=True, index=True)
    stripe_charge_id = Column(String(255), nullable=True, index=True)
    
    # Payment method
    payment_method = Column(String(50), nullable=True)  # card, bank_transfer, etc.
    last_four = Column(String(4), nullable=True)  # Last 4 digits of card
    
    # Billing period
    billing_period_start = Column(DateTime(timezone=True), nullable=False)
    billing_period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="payments")
    user = relationship("User", back_populates="payments")



