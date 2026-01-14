"""
Gazette Error Correction Routes
Implements error correction protocol with sequential verification
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models.gazette import Gazette, GazetteType
from services.enhanced_gazette_extractor import EnhancedGazetteExtractor
import logging
import re

router = APIRouter(prefix="/api/gazette-correction", tags=["gazette-correction"])
logger = logging.getLogger(__name__)


class CorrectionRequest(BaseModel):
    gazette_number: str
    start_item_number: str
    end_item_number: str
    gazette_type: Optional[str] = "CHANGE_OF_NAME"
    note: Optional[str] = None


class SequenceVerificationRequest(BaseModel):
    gazette_number: str
    gazette_type: Optional[str] = None


@router.post("/verify-sequence")
async def verify_sequence(
    request: SequenceVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Verify Item Number sequence for a gazette
    Returns missing ranges that need to be captured
    """
    try:
        extractor = EnhancedGazetteExtractor()
        
        # Get all item numbers for this gazette
        query = db.query(Gazette.item_number).filter(
            Gazette.gazette_number == request.gazette_number,
            Gazette.item_number.isnot(None)
        )
        
        if request.gazette_type:
            gazette_type = GazetteType[request.gazette_type]
            query = query.filter(Gazette.gazette_type == gazette_type)
        
        items = query.all()
        item_numbers = [item.item_number for item in items if item.item_number]
        
        # Verify sequence
        missing_ranges = extractor.verify_item_sequence(item_numbers, request.gazette_number)
        
        return {
            'gazette_number': request.gazette_number,
            'gazette_type': request.gazette_type,
            'total_items': len(item_numbers),
            'item_numbers': sorted(item_numbers),
            'missing_ranges': missing_ranges,
            'is_complete': len(missing_ranges) == 0,
            'correction_prompts': [
                f"You missed from {start} to {end}. Please capture that data."
                for start, end in missing_ranges
            ]
        }
    except Exception as e:
        logger.error(f"Error verifying sequence: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report-missing")
async def report_missing(
    request: CorrectionRequest,
    db: Session = Depends(get_db)
):
    """
    Report missing Item Numbers using the mandated format:
    "You missed from [Start Item No.] to [End Item No.]. Please capture that data."
    """
    try:
        # Verify the format
        start_num = request.start_item_number
        end_num = request.end_item_number
        
        # Validate item numbers are numeric
        if not (start_num.isdigit() and end_num.isdigit()):
            raise HTTPException(
                status_code=400,
                detail="Item numbers must be numeric"
            )
        
        # Check if items in this range already exist
        existing_items = db.query(Gazette.item_number).filter(
            Gazette.gazette_number == request.gazette_number,
            Gazette.item_number.isnot(None),
            Gazette.item_number >= start_num,
            Gazette.item_number <= end_num
        ).all()
        
        existing_numbers = [item.item_number for item in existing_items]
        
        # Generate correction prompt
        correction_prompt = f"You missed from {start_num} to {end_num}. Please capture that data."
        
        return {
            'correction_prompt': correction_prompt,
            'gazette_number': request.gazette_number,
            'start_item_number': start_num,
            'end_item_number': end_num,
            'missing_range': f"{start_num}-{end_num}",
            'existing_items_in_range': existing_numbers,
            'items_to_capture': [
                str(i) for i in range(int(start_num), int(end_num) + 1)
                if str(i) not in existing_numbers
            ],
            'note': request.note
        }
    except Exception as e:
        logger.error(f"Error reporting missing items: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check-duplicates")
async def check_duplicates(
    gazette_number: str,
    item_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Check for duplicate entries in gazette"""
    try:
        query = db.query(Gazette).filter(
            Gazette.gazette_number == gazette_number
        )
        
        if item_number:
            query = query.filter(Gazette.item_number == item_number)
        
        duplicates = query.all()
        
        return {
            'gazette_number': gazette_number,
            'item_number': item_number,
            'duplicate_count': len(duplicates),
            'duplicates': [
                {
                    'id': dup.id,
                    'item_number': dup.item_number,
                    'title': dup.title,
                    'gazette_type': dup.gazette_type.value if dup.gazette_type else None,
                    'created_at': dup.created_at.isoformat() if dup.created_at else None
                }
                for dup in duplicates
            ]
        }
    except Exception as e:
        logger.error(f"Error checking duplicates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cross-reference")
async def cross_reference(
    gazette_number: str,
    person_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Cross-reference entries to verify completeness
    Returns list of entries that need verification
    """
    try:
        query = db.query(Gazette).filter(
            Gazette.gazette_number == gazette_number
        )
        
        if person_id:
            query = query.filter(Gazette.person_id == person_id)
        
        entries = query.order_by(Gazette.item_number).all()
        
        # Extract item numbers
        item_numbers = [e.item_number for e in entries if e.item_number]
        
        # Check for sequence gaps
        extractor = EnhancedGazetteExtractor()
        missing_ranges = extractor.verify_item_sequence(item_numbers, gazette_number)
        
        return {
            'gazette_number': gazette_number,
            'person_id': person_id,
            'total_entries': len(entries),
            'item_numbers': sorted(item_numbers),
            'missing_ranges': missing_ranges,
            'entries': [
                {
                    'id': entry.id,
                    'item_number': entry.item_number,
                    'title': entry.title,
                    'person_id': entry.person_id,
                    'person_name': entry.person.full_name if entry.person else None,
                    'gazette_type': entry.gazette_type.value if entry.gazette_type else None,
                    'created_at': entry.created_at.isoformat() if entry.created_at else None
                }
                for entry in entries
            ]
        }
    except Exception as e:
        logger.error(f"Error cross-referencing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

