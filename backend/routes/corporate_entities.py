"""
API endpoint for searching companies, banks, and insurance companies
Used for corporate client selection during registration
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from database import get_db
from models.companies import Companies
from models.banks import Banks
from models.insurance import Insurance
from pydantic import BaseModel

router = APIRouter(prefix="/corporate-entities", tags=["corporate-entities"])

class CorporateEntityResponse(BaseModel):
    id: int
    name: str
    type: str  # 'company', 'bank', or 'insurance'
    short_name: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.get("/search", response_model=List[CorporateEntityResponse])
async def search_corporate_entities(
    query: Optional[str] = Query(None, description="Search term for entity name"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    """
    Search across companies, banks, and insurance companies.
    Returns combined results for corporate client selection.
    """
    results = []
    
    if not query or len(query.strip()) < 2:
        # Return empty if query is too short
        return results
    
    search_term = f"%{query.strip()}%"
    
    # Search companies
    companies = db.query(Companies).filter(
        Companies.is_active == True,
        or_(
            Companies.name.ilike(search_term),
            Companies.short_name.ilike(search_term)
        )
    ).limit(limit).all()
    
    for company in companies:
        results.append(CorporateEntityResponse(
            id=company.id,
            name=company.name,
            type='company',
            short_name=company.short_name
        ))
    
    # Search banks
    banks = db.query(Banks).filter(
        Banks.is_active == True,
        or_(
            Banks.name.ilike(search_term),
            Banks.short_name.ilike(search_term)
        )
    ).limit(limit).all()
    
    for bank in banks:
        results.append(CorporateEntityResponse(
            id=bank.id,
            name=bank.name,
            type='bank',
            short_name=bank.short_name
        ))
    
    # Search insurance companies
    insurance_companies = db.query(Insurance).filter(
        Insurance.is_active == True,
        or_(
            Insurance.name.ilike(search_term),
            Insurance.short_name.ilike(search_term)
        )
    ).limit(limit).all()
    
    for insurance in insurance_companies:
        results.append(CorporateEntityResponse(
            id=insurance.id,
            name=insurance.name,
            type='insurance',
            short_name=insurance.short_name
        ))
    
    # Sort by name and limit total results
    results.sort(key=lambda x: x.name)
    return results[:limit]

