from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models.request_details import RequestDetails, RequestType, EntityType, RequestStatus, Priority
from schemas.request_details import (
    RequestDetailsCreate, 
    RequestDetailsUpdate, 
    RequestDetailsResponse, 
    RequestDetailsList,
    RequestStats,
    QuickCaseRequest,
    QuickProfileRequest
)

router = APIRouter(prefix="/api/request-details", tags=["request-details"])

@router.post("/submit", response_model=RequestDetailsResponse)
async def submit_request(
    request_data: RequestDetailsCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Submit a new request for details or information"""
    
    # Get client information
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent")
    referrer = request.headers.get("referer")
    
    # Create the request
    db_request = RequestDetails(
        request_type=request_data.request_type,
        entity_type=request_data.entity_type,
        entity_id=request_data.entity_id,
        entity_name=request_data.entity_name,
        case_id=request_data.case_id,
        case_suit_number=request_data.case_suit_number,
        message=request_data.message,
        requester_name=request_data.requester_name,
        requester_email=request_data.requester_email,
        requester_phone=request_data.requester_phone,
        requester_organization=request_data.requester_organization,
        priority=request_data.priority,
        is_urgent=request_data.is_urgent,
        source_ip=client_ip,
        user_agent=user_agent,
        referrer=referrer
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request

@router.post("/submit-case-request", response_model=RequestDetailsResponse)
async def submit_case_request(
    request_data: QuickCaseRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Submit a quick case request"""
    
    # Get client information
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent")
    referrer = request.headers.get("referer")
    
    # Create the request
    db_request = RequestDetails(
        request_type=request_data.request_type,
        entity_type=EntityType.CASE,
        case_id=request_data.case_id,
        case_suit_number=request_data.case_suit_number,
        message=request_data.message,
        requester_name=request_data.requester_name,
        requester_email=request_data.requester_email,
        requester_phone=request_data.requester_phone,
        source_ip=client_ip,
        user_agent=user_agent,
        referrer=referrer
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request

@router.post("/submit-profile-request", response_model=RequestDetailsResponse)
async def submit_profile_request(
    request_data: QuickProfileRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Submit a quick profile request"""
    
    # Get client information
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent")
    referrer = request.headers.get("referer")
    
    # Create the request
    db_request = RequestDetails(
        request_type=request_data.request_type,
        entity_type=request_data.entity_type,
        entity_id=request_data.entity_id,
        entity_name=request_data.entity_name,
        message=request_data.message,
        requester_name=request_data.requester_name,
        requester_email=request_data.requester_email,
        requester_phone=request_data.requester_phone,
        source_ip=client_ip,
        user_agent=user_agent,
        referrer=referrer
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request

@router.get("/", response_model=List[RequestDetailsList])
async def get_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[RequestStatus] = None,
    entity_type: Optional[EntityType] = None,
    request_type: Optional[RequestType] = None,
    priority: Optional[Priority] = None,
    is_urgent: Optional[bool] = None,
    assigned_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all requests with optional filtering"""
    
    query = db.query(RequestDetails)
    
    # Apply filters
    if status:
        query = query.filter(RequestDetails.status == status)
    if entity_type:
        query = query.filter(RequestDetails.entity_type == entity_type)
    if request_type:
        query = query.filter(RequestDetails.request_type == request_type)
    if priority:
        query = query.filter(RequestDetails.priority == priority)
    if is_urgent is not None:
        query = query.filter(RequestDetails.is_urgent == is_urgent)
    if assigned_to:
        query = query.filter(RequestDetails.assigned_to == assigned_to)
    
    # Order by created date (newest first)
    query = query.order_by(desc(RequestDetails.created_at))
    
    # Apply pagination
    requests = query.offset(skip).limit(limit).all()
    
    return requests

@router.get("/stats", response_model=RequestStats)
async def get_request_stats(db: Session = Depends(get_db)):
    """Get request statistics"""
    
    # Total requests
    total_requests = db.query(RequestDetails).count()
    
    # Requests by status
    status_counts = db.query(
        RequestDetails.status,
        func.count(RequestDetails.id)
    ).group_by(RequestDetails.status).all()
    
    status_dict = {status.value: 0 for status in RequestStatus}
    for status, count in status_counts:
        status_dict[status.value] = count
    
    # Urgent requests
    urgent_requests = db.query(RequestDetails).filter(RequestDetails.is_urgent == True).count()
    
    # Requests by type
    type_counts = db.query(
        RequestDetails.request_type,
        func.count(RequestDetails.id)
    ).group_by(RequestDetails.request_type).all()
    
    type_dict = {req_type.value: 0 for req_type in RequestType}
    for req_type, count in type_counts:
        type_dict[req_type.value] = count
    
    # Requests by entity
    entity_counts = db.query(
        RequestDetails.entity_type,
        func.count(RequestDetails.id)
    ).group_by(RequestDetails.entity_type).all()
    
    entity_dict = {entity.value: 0 for entity in EntityType}
    for entity, count in entity_counts:
        entity_dict[entity.value] = count
    
    return RequestStats(
        total_requests=total_requests,
        pending_requests=status_dict.get("pending", 0),
        in_progress_requests=status_dict.get("in_progress", 0),
        completed_requests=status_dict.get("completed", 0),
        rejected_requests=status_dict.get("rejected", 0),
        urgent_requests=urgent_requests,
        requests_by_type=type_dict,
        requests_by_entity=entity_dict,
        requests_by_status=status_dict
    )

@router.get("/{request_id}", response_model=RequestDetailsResponse)
async def get_request(request_id: int, db: Session = Depends(get_db)):
    """Get a specific request by ID"""
    
    request = db.query(RequestDetails).filter(RequestDetails.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return request

@router.put("/{request_id}", response_model=RequestDetailsResponse)
async def update_request(
    request_id: int,
    request_data: RequestDetailsUpdate,
    db: Session = Depends(get_db)
):
    """Update a request (admin/staff only)"""
    
    request = db.query(RequestDetails).filter(RequestDetails.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Update fields
    update_data = request_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(request, field, value)
    
    # Set completion time if status is completed
    if request_data.status == RequestStatus.COMPLETED:
        request.completed_at = datetime.utcnow()
    
    request.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(request)
    
    return request

@router.delete("/{request_id}")
async def delete_request(request_id: int, db: Session = Depends(get_db)):
    """Delete a request (admin only)"""
    
    request = db.query(RequestDetails).filter(RequestDetails.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db.delete(request)
    db.commit()
    
    return {"message": "Request deleted successfully"}

@router.get("/entity/{entity_type}/{entity_id}", response_model=List[RequestDetailsList])
async def get_requests_by_entity(
    entity_type: EntityType,
    entity_id: int,
    db: Session = Depends(get_db)
):
    """Get all requests for a specific entity"""
    
    requests = db.query(RequestDetails).filter(
        RequestDetails.entity_type == entity_type,
        RequestDetails.entity_id == entity_id
    ).order_by(desc(RequestDetails.created_at)).all()
    
    return requests

@router.get("/recent/{days}", response_model=List[RequestDetailsList])
async def get_recent_requests(
    days: int = Path(..., ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get recent requests from the last N days"""
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    requests = db.query(RequestDetails).filter(
        RequestDetails.created_at >= cutoff_date
    ).order_by(desc(RequestDetails.created_at)).all()
    
    return requests
