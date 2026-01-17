from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
from typing import Optional, List
from datetime import date, datetime
import math
import logging
from pydantic import BaseModel, Field

from database import get_db
from models.change_of_name import ChangeOfName

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/change-of-name", tags=["change-of-name"])


class ChangeOfNameResult(BaseModel):
    id: int
    item_number: Optional[str] = None
    old_name: Optional[str] = None
    new_name: Optional[str] = None
    alias_name: Optional[str] = None
    profession: Optional[str] = None
    gazette_number: Optional[str] = None
    gazette_date: Optional[date] = None
    effective_date: Optional[date] = None
    page_number: Optional[int] = None
    document_filename: Optional[str] = None
    person_id: Optional[int] = None
    created_at: Optional[datetime] = None


class ChangeOfNameListResponse(BaseModel):
    results: List[ChangeOfNameResult]
    total: int
    page: int
    limit: int
    total_pages: int


class ChangeOfNameCreate(BaseModel):
    item_number: str = Field(..., min_length=1, max_length=50)
    old_name: str = Field(..., min_length=1, max_length=500)
    new_name: str = Field(..., min_length=1, max_length=500)
    alias_name: Optional[str] = None
    profession: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    town_city: Optional[str] = None
    region: Optional[str] = None
    effective_date: Optional[date] = None
    remarks: Optional[str] = None
    source: Optional[str] = None
    source_details: Optional[str] = None
    gazette_number: str = Field(..., min_length=1, max_length=50)
    gazette_date: date
    page_number: Optional[int] = None
    document_filename: str = Field(..., min_length=1, max_length=255)
    person_id: Optional[int] = None


class ChangeOfNameUpdate(BaseModel):
    item_number: Optional[str] = None
    old_name: Optional[str] = None
    new_name: Optional[str] = None
    alias_name: Optional[str] = None
    profession: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    town_city: Optional[str] = None
    region: Optional[str] = None
    effective_date: Optional[date] = None
    remarks: Optional[str] = None
    source: Optional[str] = None
    source_details: Optional[str] = None
    gazette_number: Optional[str] = None
    gazette_date: Optional[date] = None
    page_number: Optional[int] = None
    document_filename: Optional[str] = None
    person_id: Optional[int] = None


@router.get("/", response_model=ChangeOfNameListResponse)
def list_change_of_name(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by new_name, old_name, alias_name, profession"),
    sort_by: str = Query("gazette_date", regex="^(gazette_date|new_name|old_name|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """List change of name entries with optional search and pagination."""
    try:
        query = db.query(ChangeOfName)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    ChangeOfName.new_name.ilike(search_term),
                    ChangeOfName.old_name.ilike(search_term),
                    ChangeOfName.alias_name.ilike(search_term),
                    ChangeOfName.profession.ilike(search_term)
                )
            )

        sort_column = getattr(ChangeOfName, sort_by, ChangeOfName.gazette_date)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        total = query.count()
        offset = (page - 1) * limit
        entries = query.offset(offset).limit(limit).all()

        results = [
            {
                "id": entry.id,
                "item_number": entry.item_number,
                "old_name": entry.old_name,
                "new_name": entry.new_name,
                "alias_name": entry.alias_name,
                "profession": entry.profession,
                "gazette_number": entry.gazette_number,
                "gazette_date": entry.gazette_date,
                "effective_date": entry.effective_date,
                "page_number": entry.page_number,
                "document_filename": entry.document_filename,
                "person_id": entry.person_id,
                "created_at": entry.created_at,
            }
            for entry in entries
        ]

        return ChangeOfNameListResponse(
            results=results,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if limit > 0 else 0
        )
    except Exception as e:
        logger.error(f"Error listing change_of_name: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing change of name: {str(e)}")


@router.post("/", response_model=ChangeOfNameResult)
def create_change_of_name(entry: ChangeOfNameCreate, db: Session = Depends(get_db)):
    """Create a change of name entry."""
    try:
        new_entry = ChangeOfName(**entry.dict())
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return ChangeOfNameResult(
            id=new_entry.id,
            item_number=new_entry.item_number,
            old_name=new_entry.old_name,
            new_name=new_entry.new_name,
            alias_name=new_entry.alias_name,
            profession=new_entry.profession,
            gazette_number=new_entry.gazette_number,
            gazette_date=new_entry.gazette_date,
            effective_date=new_entry.effective_date,
            page_number=new_entry.page_number,
            document_filename=new_entry.document_filename,
            person_id=new_entry.person_id,
            created_at=new_entry.created_at,
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating change_of_name: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating change of name: {str(e)}")


@router.put("/{entry_id}", response_model=ChangeOfNameResult)
def update_change_of_name(entry_id: int, entry: ChangeOfNameUpdate, db: Session = Depends(get_db)):
    """Update a change of name entry."""
    try:
        existing = db.query(ChangeOfName).filter(ChangeOfName.id == entry_id).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Change of name entry not found")

        update_data = entry.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing, field, value)

        db.commit()
        db.refresh(existing)
        return ChangeOfNameResult(
            id=existing.id,
            item_number=existing.item_number,
            old_name=existing.old_name,
            new_name=existing.new_name,
            alias_name=existing.alias_name,
            profession=existing.profession,
            gazette_number=existing.gazette_number,
            gazette_date=existing.gazette_date,
            effective_date=existing.effective_date,
            page_number=existing.page_number,
            document_filename=existing.document_filename,
            person_id=existing.person_id,
            created_at=existing.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating change_of_name: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating change of name: {str(e)}")


@router.delete("/{entry_id}")
def delete_change_of_name(entry_id: int, db: Session = Depends(get_db)):
    """Delete a change of name entry."""
    try:
        existing = db.query(ChangeOfName).filter(ChangeOfName.id == entry_id).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Change of name entry not found")
        db.delete(existing)
        db.commit()
        return {"message": "Change of name entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting change_of_name: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting change of name: {str(e)}")
