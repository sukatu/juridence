from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class SubscriptionCreate(BaseModel):
    plan: str
    billing_cycle: str = "monthly"

class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = None
    status: Optional[str] = None
    billing_cycle: Optional[str] = None

class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: str
    status: str
    amount: Decimal
    currency: str
    billing_cycle: str
    start_date: datetime
    end_date: Optional[datetime]
    trial_end: Optional[datetime]
    cancelled_at: Optional[datetime]
    features: Optional[List[str]]
    limits: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    amount: Decimal
    currency: str = "USD"
    payment_method: str
    billing_period_start: datetime
    billing_period_end: datetime

class PaymentResponse(BaseModel):
    id: int
    subscription_id: int
    user_id: int
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str]
    last_four: Optional[str]
    billing_period_start: datetime
    billing_period_end: datetime
    created_at: datetime
    paid_at: Optional[datetime]

    class Config:
        from_attributes = True

class UsageRecordCreate(BaseModel):
    resource_type: str
    count: int = 1
    usage_metadata: Optional[Dict[str, Any]] = None

class UsageRecordResponse(BaseModel):
    id: int
    subscription_id: int
    user_id: int
    resource_type: str
    count: int
    usage_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    recorded_at: datetime

    class Config:
        from_attributes = True

class SubscriptionUsageResponse(BaseModel):
    plan: str
    status: str
    expires_at: Optional[datetime]
    is_premium: bool
    features: List[str]
    usage: Dict[str, Any]
    limits: Dict[str, Any]

class PlanFeature(BaseModel):
    name: str
    description: str
    included: bool
    limit: Optional[int] = None

class SubscriptionPlanResponse(BaseModel):
    id: str
    name: str
    description: str
    price: Decimal
    currency: str
    billing_cycle: str
    features: List[PlanFeature]
    is_popular: bool = False
    is_current: bool = False
