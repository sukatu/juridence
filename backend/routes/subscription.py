from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.subscription import Subscription, UsageRecord, SubscriptionStatus, SubscriptionPlan
# from models.payment import Payment
from schemas.subscription import (
    SubscriptionResponse, PaymentResponse, UsageRecordResponse, 
    SubscriptionUsageResponse, SubscriptionPlanResponse, PlanFeature
)
from auth import get_current_user
from typing import List, Optional
import logging
from datetime import datetime, timedelta
from decimal import Decimal

router = APIRouter()

# Subscription Plans Configuration
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "description": "Basic access with limited features",
        "price": Decimal("0.00"),
        "currency": "USD",
        "billing_cycle": "monthly",
        "features": [
            PlanFeature(name="Basic searches", description="Up to 50 searches per month", included=True, limit=50),
            PlanFeature(name="Basic filters", description="Standard search filters", included=True),
            PlanFeature(name="Email support", description="Community support via email", included=True),
        ],
        "is_popular": False
    },
    "professional": {
        "name": "Professional",
        "description": "Advanced features for professionals",
        "price": Decimal("29.00"),
        "currency": "USD",
        "billing_cycle": "monthly",
        "features": [
            PlanFeature(name="Unlimited searches", description="No search limits", included=True),
            PlanFeature(name="Advanced filters", description="Advanced search and filtering options", included=True),
            PlanFeature(name="Priority support", description="Priority email and chat support", included=True),
            PlanFeature(name="Export capabilities", description="Export search results to PDF, Excel", included=True),
            PlanFeature(name="API access", description="REST API access", included=True, limit=1000),
        ],
        "is_popular": True
    },
    "enterprise": {
        "name": "Enterprise",
        "description": "Full-featured solution for organizations",
        "price": Decimal("99.00"),
        "currency": "USD",
        "billing_cycle": "monthly",
        "features": [
            PlanFeature(name="Everything in Professional", description="All Professional features", included=True),
            PlanFeature(name="Unlimited API access", description="No API rate limits", included=True),
            PlanFeature(name="Custom integrations", description="Custom API integrations", included=True),
            PlanFeature(name="Dedicated support", description="Dedicated account manager", included=True),
            PlanFeature(name="Advanced analytics", description="Detailed usage analytics", included=True),
        ],
        "is_popular": False
    }
}

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
async def get_subscription_plans(
    current_user: User = Depends(get_current_user)
):
    """Get available subscription plans"""
    try:
        plans = []
        current_subscription = current_user.subscription
        
        for plan_id, plan_data in SUBSCRIPTION_PLANS.items():
            is_current = current_subscription and current_subscription.plan == plan_id
            plans.append(SubscriptionPlanResponse(
                id=plan_id,
                name=plan_data["name"],
                description=plan_data["description"],
                price=plan_data["price"],
                currency=plan_data["currency"],
                billing_cycle=plan_data["billing_cycle"],
                features=plan_data["features"],
                is_popular=plan_data["is_popular"],
                is_current=is_current
            ))
        
        return plans
    except Exception as e:
        logging.error(f"Error getting subscription plans: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription plans"
        )

@router.get("/current", response_model=SubscriptionUsageResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription with usage data"""
    try:
        subscription = current_user.subscription
        
        if not subscription:
            # Create default free subscription
            subscription = Subscription(
                user_id=current_user.id,
                plan=SubscriptionPlan.FREE,
                status=SubscriptionStatus.ACTIVE,
                amount=Decimal("0.00"),
                currency="USD",
                billing_cycle="monthly",
                features=["Basic searches", "Basic filters", "Email support"],
                limits={"searches_per_month": 50, "api_calls_per_month": 0}
            )
            db.add(subscription)
            db.commit()
            db.refresh(subscription)
        
        # Get usage data for current month
        start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        searches_this_month = db.query(UsageRecord).filter(
            UsageRecord.user_id == current_user.id,
            UsageRecord.resource_type == "search",
            UsageRecord.recorded_at >= start_of_month
        ).count()
        
        api_calls_this_month = db.query(UsageRecord).filter(
            UsageRecord.user_id == current_user.id,
            UsageRecord.resource_type == "api_call",
            UsageRecord.recorded_at >= start_of_month
        ).count()
        
        # Get plan limits
        plan_data = SUBSCRIPTION_PLANS.get(subscription.plan.value, SUBSCRIPTION_PLANS["free"])
        limits = {
            "searches_per_month": plan_data["features"][0].limit if plan_data["features"][0].limit else None,
            "api_calls_per_month": 1000 if subscription.plan == SubscriptionPlan.PROFESSIONAL else None
        }
        
        usage = {
            "searches_this_month": searches_this_month,
            "api_calls_this_month": api_calls_this_month,
            "searches_remaining": limits["searches_per_month"] - searches_this_month if limits["searches_per_month"] else None,
            "api_calls_remaining": limits["api_calls_per_month"] - api_calls_this_month if limits["api_calls_per_month"] else None
        }
        
        return SubscriptionUsageResponse(
            plan=subscription.plan.value,
            status=subscription.status.value,
            expires_at=subscription.end_date,
            is_premium=subscription.plan != SubscriptionPlan.FREE,
            features=[f.name for f in plan_data["features"] if f.included],
            usage=usage,
            limits=limits
        )
    except Exception as e:
        logging.error(f"Error getting current subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription information"
        )

@router.post("/upgrade")
async def upgrade_subscription(
    plan: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upgrade user's subscription plan"""
    try:
        if plan not in SUBSCRIPTION_PLANS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription plan"
            )
        
        plan_data = SUBSCRIPTION_PLANS[plan]
        
        # Check if user already has this plan
        if current_user.subscription and current_user.subscription.plan.value == plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have this subscription plan"
            )
        
        # Update or create subscription
        if current_user.subscription:
            subscription = current_user.subscription
            subscription.plan = SubscriptionPlan(plan)
            subscription.amount = plan_data["price"]
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.end_date = datetime.now() + timedelta(days=30)  # 30-day billing cycle
        else:
            subscription = Subscription(
                user_id=current_user.id,
                plan=SubscriptionPlan(plan),
                status=SubscriptionStatus.ACTIVE,
                amount=plan_data["price"],
                currency=plan_data["currency"],
                billing_cycle=plan_data["billing_cycle"],
                end_date=datetime.now() + timedelta(days=30)
            )
            db.add(subscription)
        
        # Update user premium status
        current_user.is_premium = plan != "free"
        current_user.subscription_plan = plan
        
        db.commit()
        db.refresh(subscription)
        
        return {
            "message": f"Successfully upgraded to {plan_data['name']} plan",
            "subscription": SubscriptionResponse.from_orm(subscription)
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error upgrading subscription: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade subscription"
        )

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel user's subscription"""
    try:
        subscription = current_user.subscription
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscription found"
            )
        
        if subscription.plan == SubscriptionPlan.FREE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel free subscription"
            )
        
        # Cancel subscription
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.cancelled_at = datetime.now()
        
        # Downgrade to free plan
        current_user.is_premium = False
        current_user.subscription_plan = "free"
        
        db.commit()
        
        return {"message": "Subscription cancelled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error cancelling subscription: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.get("/usage", response_model=List[UsageRecordResponse])
async def get_usage_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's usage history"""
    try:
        usage_records = db.query(UsageRecord).filter(
            UsageRecord.user_id == current_user.id
        ).order_by(UsageRecord.recorded_at.desc()).offset(offset).limit(limit).all()
        
        return [UsageRecordResponse.from_orm(record) for record in usage_records]
    except Exception as e:
        logging.error(f"Error getting usage history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve usage history"
        )

@router.post("/usage")
async def record_usage(
    resource_type: str,
    count: int = 1,
    metadata: Optional[dict] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record usage for a specific resource"""
    try:
        subscription = current_user.subscription
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscription found"
            )
        
        # Check usage limits
        if resource_type == "search":
            start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            current_usage = db.query(UsageRecord).filter(
                UsageRecord.user_id == current_user.id,
                UsageRecord.resource_type == "search",
                UsageRecord.recorded_at >= start_of_month
            ).count()
            
            plan_data = SUBSCRIPTION_PLANS.get(subscription.plan.value, SUBSCRIPTION_PLANS["free"])
            search_limit = plan_data["features"][0].limit
            
            if search_limit and current_usage + count > search_limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Search limit exceeded. You have {search_limit - current_usage} searches remaining this month."
                )
        
        # Record usage
        usage_record = UsageRecord(
            subscription_id=subscription.id,
            user_id=current_user.id,
            resource_type=resource_type,
            count=count,
            usage_metadata=metadata
        )
        
        db.add(usage_record)
        db.commit()
        db.refresh(usage_record)
        
        return {"message": "Usage recorded successfully", "usage": UsageRecordResponse.from_orm(usage_record)}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error recording usage: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record usage"
        )
