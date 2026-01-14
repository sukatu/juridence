from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import json
import os
import uuid

from database import get_db
from models.tenant import Tenant, SubscriptionPlan, SubscriptionRequest, TenantSetting
from models.subscription import SubscriptionStatus
from models.user import User
from schemas.tenant import (
    TenantResponse, TenantCreateRequest, TenantUpdateRequest, TenantListResponse,
    SubscriptionPlanResponse, SubscriptionPlanListResponse,
    SubscriptionRequestResponse, SubscriptionRequestCreateRequest, SubscriptionRequestListResponse,
    TenantSettingResponse, TenantSettingCreateRequest, TenantSettingUpdateRequest
)

router = APIRouter()

# Tenant Statistics (must be before parameterized routes)
@router.get("/tenants/stats")
async def get_tenant_stats(db: Session = Depends(get_db)):
    """Get tenant statistics"""
    try:
        total_tenants = db.query(Tenant).count()
        active_tenants = db.query(Tenant).filter(Tenant.is_active == True).count()
        approved_tenants = db.query(Tenant).filter(Tenant.is_approved == True).count()
        pending_approval = db.query(Tenant).filter(Tenant.is_approved == False).count()
        
        # Subscription status breakdown
        status_breakdown = db.query(
            Tenant.subscription_status,
            func.count(Tenant.id).label('count')
        ).group_by(Tenant.subscription_status).all()
        
        # Recent tenants (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_tenants = db.query(Tenant).filter(
            Tenant.created_at >= thirty_days_ago
        ).count()
        
        # Pending subscription requests
        pending_requests = db.query(SubscriptionRequest).filter(
            SubscriptionRequest.status == "pending"
        ).count()
        
        return {
            "total": total_tenants,
            "active": active_tenants,
            "pending": pending_approval,
            "trial": db.query(Tenant).filter(Tenant.subscription_status == SubscriptionStatus.TRIALING).count(),
            "cancelled": db.query(Tenant).filter(Tenant.subscription_status == SubscriptionStatus.CANCELLED).count(),
            "approved_tenants": approved_tenants,
            "recent_tenants": recent_tenants,
            "pending_requests": pending_requests,
            "subscription_status_breakdown": [
                {"status": status, "count": count} 
                for status, count in status_breakdown
            ],
            "last_updated": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tenant statistics: {str(e)}")

# Tenant Management
@router.get("/tenants", response_model=TenantListResponse)
async def get_tenants(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    is_approved: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of tenants with filtering"""
    try:
        query = db.query(Tenant)
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Tenant.name.ilike(f"%{search}%"),
                    Tenant.email.ilike(f"%{search}%"),
                    Tenant.slug.ilike(f"%{search}%")
                )
            )
        
        if status:
            query = query.filter(Tenant.subscription_status == status)
        
        if is_approved is not None:
            query = query.filter(Tenant.is_approved == is_approved)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        tenants = query.order_by(Tenant.created_at.desc()).offset(offset).limit(limit).all()
        
        return TenantListResponse(
            tenants=tenants,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tenants: {str(e)}")

@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    """Get tenant by ID"""
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        return tenant
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tenant: {str(e)}")

@router.post("/tenants", response_model=TenantResponse)
async def create_tenant(tenant_data: TenantCreateRequest, db: Session = Depends(get_db)):
    """Create a new tenant"""
    try:
        # Check if slug already exists
        existing_tenant = db.query(Tenant).filter(Tenant.slug == tenant_data.slug).first()
        if existing_tenant:
            raise HTTPException(status_code=400, detail="Tenant slug already exists")
        
        # Create tenant
        tenant = Tenant(**tenant_data.dict())
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        return tenant
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating tenant: {str(e)}")

@router.put("/tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int, 
    tenant_data: TenantUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Update tenant"""
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Update fields
        update_data = tenant_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tenant, field, value)
        
        db.commit()
        db.refresh(tenant)
        
        return tenant
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating tenant: {str(e)}")

@router.delete("/tenants/{tenant_id}")
async def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    """Delete tenant (soft delete by setting is_active to False)"""
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Soft delete
        tenant.is_active = False
        db.commit()
        
        return {"message": "Tenant deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting tenant: {str(e)}")

# Subscription Plans
@router.get("/plans", response_model=SubscriptionPlanListResponse)
async def get_subscription_plans(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of subscription plans"""
    try:
        query = db.query(SubscriptionPlan)
        
        if is_active is not None:
            query = query.filter(SubscriptionPlan.is_active == is_active)
        
        total = query.count()
        offset = (page - 1) * limit
        plans = query.order_by(SubscriptionPlan.sort_order, SubscriptionPlan.price_monthly).offset(offset).limit(limit).all()
        
        return SubscriptionPlanListResponse(
            plans=plans,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subscription plans: {str(e)}")

@router.get("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
async def get_subscription_plan(plan_id: int, db: Session = Depends(get_db)):
    """Get subscription plan by ID"""
    try:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Subscription plan not found")
        
        return plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subscription plan: {str(e)}")

# Subscription Requests
@router.get("/subscription-requests", response_model=SubscriptionRequestListResponse)
async def get_subscription_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    tenant_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of subscription requests"""
    try:
        query = db.query(SubscriptionRequest)
        
        if status:
            query = query.filter(SubscriptionRequest.status == status)
        
        if tenant_id:
            query = query.filter(SubscriptionRequest.tenant_id == tenant_id)
        
        total = query.count()
        offset = (page - 1) * limit
        requests = query.order_by(SubscriptionRequest.created_at.desc()).offset(offset).limit(limit).all()
        
        # Enrich with related data
        enriched_requests = []
        for req in requests:
            req_dict = req.__dict__.copy()
            
            # Get tenant info
            tenant = db.query(Tenant).filter(Tenant.id == req.tenant_id).first()
            req_dict['tenant_name'] = tenant.name if tenant else None
            
            # Get plan info
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == req.plan_id).first()
            req_dict['plan_name'] = plan.name if plan else None
            
            # Get requester info
            if req.requested_by:
                requester = db.query(User).filter(User.id == req.requested_by).first()
                req_dict['requester_name'] = f"{requester.first_name} {requester.last_name}".strip() if requester else None
                req_dict['requester_email'] = requester.email if requester else None
            else:
                req_dict['requester_name'] = None
                req_dict['requester_email'] = None
            
            enriched_requests.append(SubscriptionRequestResponse(**req_dict))
        
        return SubscriptionRequestListResponse(
            requests=enriched_requests,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subscription requests: {str(e)}")

@router.post("/subscription-requests", response_model=SubscriptionRequestResponse)
async def create_subscription_request(
    request_data: SubscriptionRequestCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new subscription request"""
    try:
        # Verify tenant exists
        tenant = db.query(Tenant).filter(Tenant.id == request_data.tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Verify plan exists
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == request_data.plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Subscription plan not found")
        
        # Create request
        request = SubscriptionRequest(**request_data.dict())
        db.add(request)
        db.commit()
        db.refresh(request)
        
        # Enrich response
        req_dict = request.__dict__.copy()
        req_dict['tenant_name'] = tenant.name
        req_dict['plan_name'] = plan.name
        
        # Only query for requester if requested_by is not None
        if request.requested_by:
            requester = db.query(User).filter(User.id == request.requested_by).first()
            req_dict['requester_name'] = f"{requester.first_name} {requester.last_name}".strip() if requester else None
            req_dict['requester_email'] = requester.email if requester else None
        else:
            req_dict['requester_name'] = None
            req_dict['requester_email'] = None
        
        return SubscriptionRequestResponse(**req_dict)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating subscription request: {str(e)}")

@router.put("/subscription-requests/{request_id}/approve")
async def approve_subscription_request(
    request_id: int,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Approve a subscription request"""
    try:
        request = db.query(SubscriptionRequest).filter(SubscriptionRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Subscription request not found")
        
        if request.status != "pending":
            raise HTTPException(status_code=400, detail="Request is not pending")
        
        # Update request status
        request.status = "approved"
        request.reviewed_at = datetime.utcnow()
        request.admin_notes = admin_notes
        
        # Update tenant subscription
        tenant = db.query(Tenant).filter(Tenant.id == request.tenant_id).first()
        if tenant:
            tenant.subscription_plan_id = request.plan_id
            tenant.subscription_status = "active"
            tenant.is_approved = True
            
            # Set subscription end date based on billing cycle
            if request.billing_cycle == "monthly":
                tenant.subscription_ends_at = datetime.utcnow() + timedelta(days=30)
            elif request.billing_cycle == "yearly":
                tenant.subscription_ends_at = datetime.utcnow() + timedelta(days=365)
        
        db.commit()
        
        return {"message": "Subscription request approved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error approving subscription request: {str(e)}")

@router.put("/subscription-requests/{request_id}/reject")
async def reject_subscription_request(
    request_id: int,
    admin_notes: str,
    db: Session = Depends(get_db)
):
    """Reject a subscription request"""
    try:
        request = db.query(SubscriptionRequest).filter(SubscriptionRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Subscription request not found")
        
        if request.status != "pending":
            raise HTTPException(status_code=400, detail="Request is not pending")
        
        # Update request status
        request.status = "rejected"
        request.reviewed_at = datetime.utcnow()
        request.admin_notes = admin_notes
        
        db.commit()
        
        return {"message": "Subscription request rejected"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error rejecting subscription request: {str(e)}")

# Tenant Settings
@router.get("/tenants/{tenant_id}/settings", response_model=List[TenantSettingResponse])
async def get_tenant_settings(tenant_id: int, db: Session = Depends(get_db)):
    """Get tenant settings"""
    try:
        settings = db.query(TenantSetting).filter(TenantSetting.tenant_id == tenant_id).all()
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tenant settings: {str(e)}")

@router.post("/tenants/{tenant_id}/settings", response_model=TenantSettingResponse)
async def create_tenant_setting(
    tenant_id: int,
    setting_data: TenantSettingCreateRequest,
    db: Session = Depends(get_db)
):
    """Create tenant setting"""
    try:
        # Check if tenant exists
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Check if setting already exists
        existing = db.query(TenantSetting).filter(
            TenantSetting.tenant_id == tenant_id,
            TenantSetting.key == setting_data.key
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Setting already exists")
        
        # Create setting
        setting = TenantSetting(
            tenant_id=tenant_id,
            **setting_data.dict()
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating tenant setting: {str(e)}")

@router.put("/tenants/{tenant_id}/settings/{setting_id}", response_model=TenantSettingResponse)
async def update_tenant_setting(
    tenant_id: int,
    setting_id: int,
    setting_data: TenantSettingUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update tenant setting"""
    try:
        setting = db.query(TenantSetting).filter(
            TenantSetting.id == setting_id,
            TenantSetting.tenant_id == tenant_id
        ).first()
        
        if not setting:
            raise HTTPException(status_code=404, detail="Tenant setting not found")
        
        # Update fields
        update_data = setting_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(setting, field, value)
        
        db.commit()
        db.refresh(setting)
        
        return setting
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating tenant setting: {str(e)}")


# Tenant CRUD Operations
@router.get("/tenants", response_model=TenantListResponse)
async def get_tenants(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(""),
    status: str = Query(""),
    plan: str = Query(""),
    db: Session = Depends(get_db)
):
    """Get all tenants with filtering and pagination"""
    try:
        # Build query
        query = db.query(Tenant)
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Tenant.name.ilike(f"%{search}%"),
                    Tenant.app_name.ilike(f"%{search}%"),
                    Tenant.email.ilike(f"%{search}%")
                )
            )
        
        if status:
            if status == "active":
                query = query.filter(Tenant.is_active == True)
            elif status == "inactive":
                query = query.filter(Tenant.is_active == False)
            elif status == "pending":
                query = query.filter(Tenant.is_approved == False)
            elif status == "trial":
                query = query.filter(Tenant.subscription_status == SubscriptionStatus.TRIAL)
            elif status == "cancelled":
                query = query.filter(Tenant.subscription_status == SubscriptionStatus.CANCELLED)
        
        if plan:
            query = query.join(SubscriptionPlan).filter(SubscriptionPlan.slug == plan)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        tenants = query.offset((page - 1) * limit).limit(limit).all()
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        return TenantListResponse(
            tenants=tenants,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting tenants: {str(e)}")

@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    """Get a specific tenant by ID"""
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        return tenant
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting tenant: {str(e)}")

@router.post("/tenants", response_model=TenantResponse)
async def create_tenant(tenant_data: TenantCreateRequest, db: Session = Depends(get_db)):
    """Create a new tenant"""
    try:
        # Check if slug already exists
        existing_tenant = db.query(Tenant).filter(Tenant.slug == tenant_data.slug).first()
        if existing_tenant:
            raise HTTPException(status_code=400, detail="Tenant with this slug already exists")
        
        # Create tenant
        tenant = Tenant(**tenant_data.dict())
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        return tenant
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating tenant: {str(e)}")

@router.put("/tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int, 
    tenant_data: TenantUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Update a tenant"""
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Update fields
        update_data = tenant_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tenant, field, value)
        
        db.commit()
        db.refresh(tenant)
        
        return tenant
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating tenant: {str(e)}")

@router.delete("/tenants/{tenant_id}")
async def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    """Delete a tenant"""
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        db.delete(tenant)
        db.commit()
        
        return {"message": "Tenant deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting tenant: {str(e)}")
