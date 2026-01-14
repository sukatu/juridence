from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from database import get_db
from services.legal_history_service import LegalHistoryService
from models.legal_history import LegalHistory, CaseMention, LegalSearchIndex
from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from schemas.legal_history import (
    LegalHistorySearchRequest,
    LegalHistorySearchResponse,
    EntityLegalSummary,
    CaseWithMentions
)
from auth import get_current_user

router = APIRouter()

@router.get("/search/{entity_type}/{entity_id}", response_model=EntityLegalSummary)
async def get_entity_legal_history(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get legal history for a specific entity (person, bank, or insurance)"""
    
    # Validate entity type
    if entity_type not in ['person', 'bank', 'insurance']:
        raise HTTPException(status_code=400, detail="Entity type must be 'person', 'bank', or 'insurance'")
    
    # Get entity details
    entity = None
    entity_name = ""
    
    if entity_type == 'person':
        entity = db.query(People).filter(People.id == entity_id).first()
        if entity:
            entity_name = entity.full_name or f"{entity.first_name} {entity.last_name}"
    elif entity_type == 'bank':
        entity = db.query(Banks).filter(Banks.id == entity_id).first()
        if entity:
            entity_name = entity.name
    elif entity_type == 'insurance':
        entity = db.query(Insurance).filter(Insurance.id == entity_id).first()
        if entity:
            entity_name = entity.name
    
    if not entity:
        raise HTTPException(status_code=404, detail=f"{entity_type.capitalize()} not found")
    
    # Initialize legal history service
    legal_service = LegalHistoryService(db)
    
    # Search for legal history
    search_results = legal_service.search_entity_in_cases(entity_name, entity_type, entity_id)
    
    # Save legal history entries to database
    for entry in search_results['legal_history_entries']:
        # Check if entry already exists
        existing = db.query(LegalHistory).filter(
            LegalHistory.entity_type == entry.entity_type,
            LegalHistory.entity_id == entry.entity_id,
            LegalHistory.case_id == entry.case_id
        ).first()
        
        if not existing:
            db.add(entry)
    
    # Save case mentions
    for mention in search_results['case_mentions']:
        # Check if mention already exists
        existing = db.query(CaseMention).filter(
            CaseMention.entity_type == mention.entity_type,
            CaseMention.entity_id == mention.entity_id,
            CaseMention.case_id == mention.case_id
        ).first()
        
        if not existing:
            db.add(mention)
    
    db.commit()
    
    # Get comprehensive legal summary
    legal_summary = legal_service.get_entity_legal_summary(entity_type, entity_id, entity_name)
    
    return legal_summary

@router.get("/cases/{entity_type}/{entity_id}", response_model=LegalHistorySearchResponse)
async def get_entity_cases(
    entity_type: str,
    entity_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    mention_type: Optional[str] = Query(None, description="Filter by mention type"),
    min_relevance_score: Optional[float] = Query(None, description="Minimum relevance score"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get paginated list of cases for an entity"""
    
    # Validate entity type
    if entity_type not in ['person', 'bank', 'insurance']:
        raise HTTPException(status_code=400, detail="Entity type must be 'person', 'bank', or 'insurance'")
    
    # Build query for legal history
    query = db.query(LegalHistory).filter(
        LegalHistory.entity_type == entity_type,
        LegalHistory.entity_id == entity_id
    )
    
    # Apply filters
    if mention_type:
        query = query.filter(LegalHistory.mention_type == mention_type)
    
    if min_relevance_score is not None:
        query = query.filter(LegalHistory.relevance_score >= min_relevance_score)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    legal_history = query.offset(offset).limit(limit).all()
    
    # Get case mentions for these cases
    case_ids = [entry.case_id for entry in legal_history]
    case_mentions = db.query(CaseMention).filter(CaseMention.case_id.in_(case_ids)).all()
    
    # Get entity info
    entity = None
    entity_name = ""
    
    if entity_type == 'person':
        entity = db.query(People).filter(People.id == entity_id).first()
        if entity:
            entity_name = entity.full_name or f"{entity.first_name} {entity.last_name}"
    elif entity_type == 'bank':
        entity = db.query(Banks).filter(Banks.id == entity_id).first()
        if entity:
            entity_name = entity.name
    elif entity_type == 'insurance':
        entity = db.query(Insurance).filter(Insurance.id == entity_id).first()
        if entity:
            entity_name = entity.name
    
    # Calculate total pages
    total_pages = math.ceil(total / limit)
    
    return LegalHistorySearchResponse(
        legal_history=legal_history,
        case_mentions=case_mentions,
        total_cases=total,
        total_mentions=sum(entry.mention_count for entry in legal_history),
        page=page,
        limit=limit,
        total_pages=total_pages,
        entity_info={
            "entity_type": entity_type,
            "entity_id": entity_id,
            "entity_name": entity_name
        }
    )

@router.get("/mentions/{entity_type}/{entity_id}")
async def get_entity_mentions(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed mention information for an entity"""
    
    # Validate entity type
    if entity_type not in ['person', 'bank', 'insurance']:
        raise HTTPException(status_code=400, detail="Entity type must be 'person', 'bank', or 'insurance'")
    
    # Get case mentions
    case_mentions = db.query(CaseMention).filter(
        CaseMention.entity_type == entity_type,
        CaseMention.entity_id == entity_id
    ).all()
    
    # Get legal history
    legal_history = db.query(LegalHistory).filter(
        LegalHistory.entity_type == entity_type,
        LegalHistory.entity_id == entity_id
    ).all()
    
    # Calculate statistics
    total_mentions = sum(mention.total_mentions for mention in case_mentions)
    title_mentions = sum(1 for mention in case_mentions if mention.mention_in_title)
    party_mentions = sum(1 for mention in case_mentions if mention.mention_in_antagonist or mention.mention_in_protagonist)
    content_mentions = sum(1 for mention in case_mentions if mention.mention_in_content)
    
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "total_mentions": total_mentions,
        "title_mentions": title_mentions,
        "party_mentions": party_mentions,
        "content_mentions": content_mentions,
        "case_mentions": case_mentions,
        "legal_history": legal_history
    }

@router.post("/rebuild-index/{entity_type}/{entity_id}")
async def rebuild_legal_index(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Rebuild legal history index for an entity"""
    
    # Validate entity type
    if entity_type not in ['person', 'bank', 'insurance']:
        raise HTTPException(status_code=400, detail="Entity type must be 'person', 'bank', or 'insurance'")
    
    # Get entity details
    entity = None
    entity_name = ""
    
    if entity_type == 'person':
        entity = db.query(People).filter(People.id == entity_id).first()
        if entity:
            entity_name = entity.full_name or f"{entity.first_name} {entity.last_name}"
    elif entity_type == 'bank':
        entity = db.query(Banks).filter(Banks.id == entity_id).first()
        if entity:
            entity_name = entity.name
    elif entity_type == 'insurance':
        entity = db.query(Insurance).filter(Insurance.id == entity_id).first()
        if entity:
            entity_name = entity.name
    
    if not entity:
        raise HTTPException(status_code=404, detail=f"{entity_type.capitalize()} not found")
    
    # Delete existing legal history for this entity
    db.query(LegalHistory).filter(
        LegalHistory.entity_type == entity_type,
        LegalHistory.entity_id == entity_id
    ).delete()
    
    db.query(CaseMention).filter(
        CaseMention.entity_type == entity_type,
        CaseMention.entity_id == entity_id
    ).delete()
    
    # Rebuild index
    legal_service = LegalHistoryService(db)
    search_results = legal_service.search_entity_in_cases(entity_name, entity_type, entity_id)
    
    # Save new entries
    for entry in search_results['legal_history_entries']:
        db.add(entry)
    
    for mention in search_results['case_mentions']:
        db.add(mention)
    
    db.commit()
    
    return {
        "message": f"Legal history index rebuilt for {entity_name}",
        "cases_found": len(search_results['cases']),
        "mentions_created": len(search_results['case_mentions'])
    }
