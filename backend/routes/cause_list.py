from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
import math
from datetime import date, datetime
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from database import get_db
from models.cause_list import CauseList
from schemas.cause_list import CauseListCreate, CauseListUpdate, CauseListResponse
from auth import get_current_user
from models.user import User

router = APIRouter()

@router.get("/admin/cause-lists", response_model=dict)
async def get_cause_lists(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[str] = Query(None, description="Filter by status"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    judge_id: Optional[int] = Query(None, description="Filter by judge ID"),
    registry_id: Optional[int] = Query(None, description="Filter by registry ID"),
    court_id: Optional[int] = Query(None, description="Filter by court ID"),
    hearing_date_from: Optional[date] = Query(None, description="Filter by hearing date from"),
    hearing_date_to: Optional[date] = Query(None, description="Filter by hearing date to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of cause lists with filtering and pagination"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query
    query = db.query(CauseList).filter(CauseList.is_active == True)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CauseList.case_title.ilike(search_term),
                CauseList.suit_no.ilike(search_term),
                CauseList.first_party_name.ilike(search_term),
                CauseList.second_party_name.ilike(search_term),
                CauseList.judge_name.ilike(search_term)
            )
        )
    
    if status:
        query = query.filter(CauseList.status == status)
    
    if case_type:
        query = query.filter(CauseList.case_type == case_type)

    if court_type:
        query = query.filter(CauseList.court_type == court_type)
    
    if judge_id:
        query = query.filter(CauseList.judge_id == judge_id)
    
    if registry_id:
        query = query.filter(CauseList.registry_id == registry_id)
    
    if court_id:
        query = query.filter(CauseList.court_id == court_id)
    
    if hearing_date_from:
        query = query.filter(CauseList.hearing_date >= hearing_date_from)
    
    if hearing_date_to:
        query = query.filter(CauseList.hearing_date <= hearing_date_to)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    cause_lists = query.order_by(CauseList.hearing_date.desc(), CauseList.hearing_time).offset(offset).limit(limit).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return {
        "cause_lists": cause_lists,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@router.get("/cause-lists/public", response_model=dict)
async def get_public_cause_lists(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    hearing_date_from: Optional[date] = Query(None, description="Filter by hearing date from"),
    hearing_date_to: Optional[date] = Query(None, description="Filter by hearing date to"),
    db: Session = Depends(get_db),
):
    """Public cause list lookup (no auth)."""
    query = db.query(CauseList).filter(CauseList.is_active == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CauseList.case_title.ilike(search_term),
                CauseList.suit_no.ilike(search_term),
                CauseList.first_party_name.ilike(search_term),
                CauseList.second_party_name.ilike(search_term),
                CauseList.judge_name.ilike(search_term)
            )
        )

    if case_type:
        query = query.filter(CauseList.case_type == case_type)

    if court_type:
        query = query.filter(CauseList.court_type == court_type)

    if hearing_date_from:
        query = query.filter(CauseList.hearing_date >= hearing_date_from)

    if hearing_date_to:
        query = query.filter(CauseList.hearing_date <= hearing_date_to)

    total = query.count()
    offset = (page - 1) * limit
    cause_lists = query.order_by(CauseList.hearing_date.desc(), CauseList.hearing_time).offset(offset).limit(limit).all()
    serialized = [CauseListResponse.model_validate(cl).model_dump() for cl in cause_lists]
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "cause_lists": serialized,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@router.get("/cause-lists/public/news/supreme-court", response_model=dict)
async def get_supreme_court_news():
    """Public Supreme Court news (scraped from Dennislaw News)."""
    base_url = "https://www.dennislawnews.com/general-news/supreme-court-news"
    try:
        response = requests.get(base_url, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch news: {exc}") from exc

    soup = BeautifulSoup(response.text, "html.parser")
    items = []
    for h3 in soup.select("h3"):
        link = h3.find("a")
        if not link:
            continue
        title = link.get_text(strip=True)
        href = link.get("href")
        if not href:
            continue
        article_url = urljoin(base_url, href)
        date_node = h3.find_next_sibling("p")
        excerpt_node = date_node.find_next_sibling("p") if date_node else None
        published = date_node.get_text(strip=True) if date_node else None
        excerpt = excerpt_node.get_text(strip=True) if excerpt_node else None

        image_url = None
        try:
            article_response = requests.get(article_url, timeout=15)
            article_response.raise_for_status()
            article_soup = BeautifulSoup(article_response.text, "html.parser")
            og_image = article_soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                image_url = og_image.get("content")
            if not image_url:
                twitter_image = article_soup.find("meta", attrs={"name": "twitter:image"})
                if twitter_image and twitter_image.get("content"):
                    image_url = twitter_image.get("content")
        except requests.RequestException:
            image_url = None

        items.append(
            {
                "title": title,
                "url": article_url,
                "published": published,
                "excerpt": excerpt,
                "image_url": image_url,
            }
        )
        if len(items) >= 5:
            break

    return {"items": items}

@router.get("/admin/cause-lists/{cause_list_id}", response_model=CauseListResponse)
async def get_cause_list(
    cause_list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific cause list by ID"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cause_list = db.query(CauseList).filter(CauseList.id == cause_list_id).first()
    if not cause_list:
        raise HTTPException(status_code=404, detail="Cause list not found")
    
    return cause_list

@router.post("/admin/cause-lists", response_model=CauseListResponse)
async def create_cause_list(
    cause_list_data: CauseListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new cause list entry"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create new cause list
    db_cause_list = CauseList(
        **cause_list_data.dict(),
        created_by=current_user.email or current_user.username,
        updated_by=current_user.email or current_user.username
    )
    
    db.add(db_cause_list)
    db.commit()
    db.refresh(db_cause_list)
    
    return db_cause_list

@router.put("/admin/cause-lists/{cause_list_id}", response_model=CauseListResponse)
async def update_cause_list(
    cause_list_id: int,
    cause_list_data: CauseListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a cause list entry"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cause_list = db.query(CauseList).filter(CauseList.id == cause_list_id).first()
    if not cause_list:
        raise HTTPException(status_code=404, detail="Cause list not found")
    
    # Update fields - schema validator will handle time parsing from string
    update_data = cause_list_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(cause_list, field, value)
    
    cause_list.updated_by = current_user.email or current_user.username
    
    db.commit()
    db.refresh(cause_list)
    
    return cause_list

@router.delete("/admin/cause-lists/{cause_list_id}")
async def delete_cause_list(
    cause_list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a cause list entry (soft delete)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cause_list = db.query(CauseList).filter(CauseList.id == cause_list_id).first()
    if not cause_list:
        raise HTTPException(status_code=404, detail="Cause list not found")
    
    # Soft delete
    cause_list.is_active = False
    cause_list.updated_by = current_user.email or current_user.username
    
    db.commit()
    
    return {"message": "Cause list deleted successfully"}

@router.get("/admin/cause-lists/calendar/events", response_model=List[dict])
async def get_calendar_events(
    start_date: date = Query(..., description="Start date for calendar view"),
    end_date: date = Query(..., description="End date for calendar view"),
    judge_id: Optional[int] = Query(None, description="Filter by judge ID"),
    registry_id: Optional[int] = Query(None, description="Filter by registry ID"),
    court_id: Optional[int] = Query(None, description="Filter by court ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cause list events for calendar view"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(CauseList).filter(
        and_(
            CauseList.is_active == True,
            CauseList.hearing_date >= start_date,
            CauseList.hearing_date <= end_date
        )
    )
    
    if judge_id:
        query = query.filter(CauseList.judge_id == judge_id)
    
    if registry_id:
        query = query.filter(CauseList.registry_id == registry_id)
    
    if court_id:
        query = query.filter(CauseList.court_id == court_id)
    
    cause_lists = query.order_by(CauseList.hearing_date, CauseList.hearing_time).all()
    
    # Format for calendar
    events = []
    for cl in cause_lists:
        events.append({
            "id": cl.id,
            "title": cl.case_title or cl.suit_no or "Untitled Case",
            "date": cl.hearing_date.isoformat(),
            "time": cl.hearing_time.strftime("%H:%M") if cl.hearing_time else None,
            "suit_no": cl.suit_no,
            "judge_name": cl.judge_name,
            "first_party": cl.first_party_name,
            "second_party": cl.second_party_name,
            "status": cl.status
        })
    
    return events

