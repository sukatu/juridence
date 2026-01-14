from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_
from database import get_db
from models.contact_request import ContactRequest, ContactRequestStatus, ContactRequestType
from schemas.contact_request import (
    ContactRequestCreate,
    ContactRequestUpdate,
    ContactRequestResponse,
    ContactRequestListResponse
)
from auth import get_current_user
from models.user import User
from typing import List, Optional
import logging
import math

router = APIRouter()

@router.post("/contact-request", response_model=ContactRequestResponse)
async def create_contact_request(
    request_data: ContactRequestCreate,
    db: Session = Depends(get_db)
):
    """Create a new contact request"""
    try:
        # Create contact request
        contact_request = ContactRequest(**request_data.dict())
        db.add(contact_request)
        db.commit()
        db.refresh(contact_request)
        
        # Log the request for admin notification
        logging.info(f"New contact request created: {contact_request.full_name} from {contact_request.organization}")
        
        return ContactRequestResponse.from_orm(contact_request)
    except Exception as e:
        db.rollback()
        logging.error(f"Error creating contact request: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating contact request: {str(e)}")

@router.get("/contact-requests", response_model=ContactRequestListResponse)
async def get_contact_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get contact requests (admin only)"""
    try:
        # Build query
        query = db.query(ContactRequest)
        
        # Apply filters
        filters = []
        
        if status:
            try:
                status_enum = ContactRequestStatus(status)
                filters.append(ContactRequest.status == status_enum)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        if type:
            try:
                type_enum = ContactRequestType(type)
                filters.append(ContactRequest.type == type_enum)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid type: {type}")
        
        if search:
            search_term = f"%{search.lower()}%"
            filters.append(
                or_(
                    ContactRequest.full_name.ilike(search_term),
                    ContactRequest.email.ilike(search_term),
                    ContactRequest.organization.ilike(search_term),
                    ContactRequest.message.ilike(search_term)
                )
            )
        
        if filters:
            query = query.filter(and_(*filters))
        
        # Apply sorting
        sort_column = getattr(ContactRequest, sort_by, ContactRequest.created_at)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        contact_requests = query.offset(offset).limit(limit).all()
        
        # Calculate pagination info
        total_pages = math.ceil(total / limit) if total > 0 else 1
        
        return ContactRequestListResponse(
            contact_requests=[ContactRequestResponse.from_orm(req) for req in contact_requests],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching contact requests: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching contact requests: {str(e)}")

@router.get("/contact-requests/{request_id}", response_model=ContactRequestResponse)
async def get_contact_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific contact request (admin only)"""
    try:
        contact_request = db.query(ContactRequest).filter(ContactRequest.id == request_id).first()
        if not contact_request:
            raise HTTPException(status_code=404, detail="Contact request not found")
        
        return ContactRequestResponse.from_orm(contact_request)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching contact request: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching contact request: {str(e)}")

@router.put("/contact-requests/{request_id}", response_model=ContactRequestResponse)
async def update_contact_request(
    request_id: int,
    update_data: ContactRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a contact request (admin only)"""
    try:
        contact_request = db.query(ContactRequest).filter(ContactRequest.id == request_id).first()
        if not contact_request:
            raise HTTPException(status_code=404, detail="Contact request not found")
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(contact_request, field, value)
        
        db.commit()
        db.refresh(contact_request)
        
        return ContactRequestResponse.from_orm(contact_request)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating contact request: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating contact request: {str(e)}")

@router.delete("/contact-requests/{request_id}")
async def delete_contact_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a contact request (admin only)"""
    try:
        contact_request = db.query(ContactRequest).filter(ContactRequest.id == request_id).first()
        if not contact_request:
            raise HTTPException(status_code=404, detail="Contact request not found")
        
        db.delete(contact_request)
        db.commit()
        
        return {"message": "Contact request deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting contact request: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting contact request: {str(e)}")

@router.get("/contact-requests/stats/overview")
async def get_contact_request_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get contact request statistics (admin only)"""
    try:
        total_requests = db.query(ContactRequest).count()
        pending_requests = db.query(ContactRequest).filter(ContactRequest.status == ContactRequestStatus.PENDING).count()
        contacted_requests = db.query(ContactRequest).filter(ContactRequest.status == ContactRequestStatus.CONTACTED).count()
        in_progress_requests = db.query(ContactRequest).filter(ContactRequest.status == ContactRequestStatus.IN_PROGRESS).count()
        completed_requests = db.query(ContactRequest).filter(ContactRequest.status == ContactRequestStatus.COMPLETED).count()
        
        return {
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "contacted_requests": contacted_requests,
            "in_progress_requests": in_progress_requests,
            "completed_requests": completed_requests
        }
    except Exception as e:
        logging.error(f"Error fetching contact request stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching contact request stats: {str(e)}")
