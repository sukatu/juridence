from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, String
from database import get_db
from models.reported_cases import ReportedCases
from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from models.user import User
from auth import get_current_user
from typing import List, Optional, Dict, Any
import logging
import math
import asyncio
import time

router = APIRouter()

@router.get("/search")
async def enhanced_search(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    court_type: Optional[str] = Query(None, description="Filter by court type"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    region: Optional[str] = Query(None, description="Filter by region"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    sort_by: str = Query("relevance", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enhanced search across all entities with progress indication"""
    try:
        start_time = time.time()
        all_results = []
        
        # Search people first (prioritize people for name searches)
        people_results = await search_people(db, q, risk_level, region, limit)
        all_results.extend(people_results)
        
        # Search cases (lower priority for name searches)
        cases_results = await search_cases(db, q, court_type, region, case_type, limit // 2)
        all_results.extend(cases_results)
        
        # Search banks
        banks_results = await search_banks(db, q, region, limit)
        all_results.extend(banks_results)
        
        # Search insurance
        insurance_results = await search_insurance(db, q, region, limit)
        all_results.extend(insurance_results)
        
        # Sort results
        sorted_results = sort_results(all_results, sort_by, sort_order)
        
        # Paginate results
        total = len(sorted_results)
        total_pages = math.ceil(total / limit)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_results = sorted_results[start_idx:end_idx]
        
        search_time = round(time.time() - start_time, 2)
        
        return {
            "results": paginated_results,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "search_time": search_time,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        logging.error(f"Error in enhanced search: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

async def search_cases(db: Session, query: str, court_type: Optional[str], region: Optional[str], case_type: Optional[str], limit: int) -> List[Dict]:
    """Search cases"""
    try:
        query_obj = db.query(ReportedCases)
        
        # Apply search filters
        search_conditions = or_(
            ReportedCases.title.ilike(f"%{query}%"),
            ReportedCases.suit_reference_number.ilike(f"%{query}%"),
            ReportedCases.court_type.ilike(f"%{query}%"),
            ReportedCases.presiding_judge.ilike(f"%{query}%")
        )
        query_obj = query_obj.filter(search_conditions)
        
        # Apply additional filters
        if court_type:
            query_obj = query_obj.filter(ReportedCases.court_type.ilike(f"%{court_type}%"))
        if region:
            query_obj = query_obj.filter(ReportedCases.region.ilike(f"%{region}%"))
        if case_type:
            query_obj = query_obj.filter(ReportedCases.area_of_law.ilike(f"%{case_type}%"))
        
        cases = query_obj.limit(limit).all()
        
        results = []
        for case in cases:
            results.append({
                "id": case.id,
                "type": "case",
                "title": case.title,
                "suit_reference_number": case.suit_reference_number,
                "court_type": case.court_type,
                "region": case.region,
                "date": case.date,
                "case_summary": case.case_summary,
                "area_of_law": case.area_of_law,
                "relevance_score": calculate_relevance_score(case, query),
                "risk_level": "medium",  # Default risk level for cases
                "created_at": case.created_at,
                "updated_at": case.updated_at
            })
        
        return results
    except Exception as e:
        logging.error(f"Error searching cases: {e}")
        return []

async def search_people(db: Session, query: str, risk_level: Optional[str], region: Optional[str], limit: int) -> List[Dict]:
    """Search people"""
    try:
        query_obj = db.query(People)
        
        # Apply search filters - prioritize name matches
        search_conditions = or_(
            People.full_name.ilike(f"%{query}%"),
            People.first_name.ilike(f"%{query}%"),
            People.last_name.ilike(f"%{query}%"),
            People.occupation.ilike(f"%{query}%"),
            People.city.ilike(f"%{query}%"),
            People.region.ilike(f"%{query}%"),
            # Search in previous_names (alias names) JSON array
            func.cast(People.previous_names, String).ilike(f"%{query}%")
        )
        query_obj = query_obj.filter(search_conditions)
        
        # Apply additional filters
        if risk_level:
            query_obj = query_obj.filter(People.risk_level == risk_level)
        if region:
            query_obj = query_obj.filter(People.region == region)
        
        people = query_obj.limit(limit).all()
        
        results = []
        for person in people:
            results.append({
                "id": person.id,
                "type": "person",
                "name": person.full_name,
                "full_name": person.full_name,
                "first_name": person.first_name,
                "last_name": person.last_name,
                "occupation": person.occupation,
                "city": person.city,
                "region": person.region,
                "risk_level": person.risk_level or "unknown",
                "case_count": person.case_count or 0,
                "description": person.notes or f"{person.occupation} from {person.city}",
                "relevance_score": calculate_relevance_score(person, query),
                "created_at": person.created_at,
                "updated_at": person.updated_at
            })
        
        return results
    except Exception as e:
        logging.error(f"Error searching people: {e}")
        return []

async def search_banks(db: Session, query: str, region: Optional[str], limit: int) -> List[Dict]:
    """Search banks"""
    try:
        query_obj = db.query(Banks)
        
        # Apply search filters
        search_conditions = or_(
            Banks.name.ilike(f"%{query}%"),
            Banks.short_name.ilike(f"%{query}%"),
            Banks.region.ilike(f"%{query}%")
        )
        query_obj = query_obj.filter(search_conditions)
        
        # Apply additional filters
        if region:
            query_obj = query_obj.filter(Banks.region == region)
        
        banks = query_obj.limit(limit).all()
        
        results = []
        for bank in banks:
            results.append({
                "id": bank.id,
                "type": "bank",
                "name": bank.name,
                "short_name": bank.short_name,
                "region": bank.region,
                "city": bank.city,
                "risk_level": "low",  # Banks typically have low risk
                "description": f"Banking institution in {bank.city}",
                "created_at": bank.created_at,
                "updated_at": bank.updated_at
            })
        
        return results
    except Exception as e:
        logging.error(f"Error searching banks: {e}")
        return []

async def search_insurance(db: Session, query: str, region: Optional[str], limit: int) -> List[Dict]:
    """Search insurance companies"""
    try:
        query_obj = db.query(Insurance)
        
        # Apply search filters
        search_conditions = or_(
            Insurance.name.ilike(f"%{query}%"),
            Insurance.short_name.ilike(f"%{query}%"),
            Insurance.region.ilike(f"%{query}%")
        )
        query_obj = query_obj.filter(search_conditions)
        
        # Apply additional filters
        if region:
            query_obj = query_obj.filter(Insurance.region == region)
        
        insurance_companies = query_obj.limit(limit).all()
        
        results = []
        for insurance in insurance_companies:
            results.append({
                "id": insurance.id,
                "type": "insurance",
                "name": insurance.name,
                "short_name": insurance.short_name,
                "region": insurance.region,
                "city": insurance.city,
                "risk_level": "low",  # Insurance companies typically have low risk
                "description": f"Insurance company in {insurance.city}",
                "created_at": insurance.created_at,
                "updated_at": insurance.updated_at
            })
        
        return results
    except Exception as e:
        logging.error(f"Error searching insurance: {e}")
        return []

def calculate_relevance_score(item, query: str) -> float:
    """Calculate relevance score for search results"""
    score = 0.0
    query_lower = query.lower()
    
    # Prioritize people matches with much higher scores
    if hasattr(item, 'full_name') and item.full_name:
        name_lower = item.full_name.lower()
        if query_lower in name_lower:
            score += 50.0  # Very high score for full name matches
        if name_lower.startswith(query_lower):
            score += 30.0  # High score for name starting with query
        if name_lower == query_lower:
            score += 100.0  # Perfect match gets maximum score
    
    if hasattr(item, 'first_name') and item.first_name:
        first_name_lower = item.first_name.lower()
        if query_lower in first_name_lower:
            score += 40.0  # High score for first name matches
        if first_name_lower.startswith(query_lower):
            score += 25.0  # High score for first name starting with query
    
    if hasattr(item, 'last_name') and item.last_name:
        last_name_lower = item.last_name.lower()
        if query_lower in last_name_lower:
            score += 40.0  # High score for last name matches
        if last_name_lower.startswith(query_lower):
            score += 25.0  # High score for last name starting with query
    
    # Lower scores for case titles
    if hasattr(item, 'title') and item.title:
        title_lower = item.title.lower()
        if query_lower in title_lower:
            score += 5.0   # Much lower score for case title matches
        if title_lower.startswith(query_lower):
            score += 3.0
    
    # Lower scores for other entity names
    if hasattr(item, 'name') and item.name and not hasattr(item, 'full_name'):
        name_lower = item.name.lower()
        if query_lower in name_lower:
            score += 8.0   # Medium score for company/bank names
        if name_lower.startswith(query_lower):
            score += 5.0
    
    # Check other fields with lower scores
    for field in ['suit_reference_number', 'court_type', 'presiding_judge', 'occupation']:
        if hasattr(item, field) and getattr(item, field):
            field_value = str(getattr(item, field)).lower()
            if query_lower in field_value:
                score += 1.0  # Very low score for other field matches
    
    return min(score, 100.0)  # Cap at 100

def sort_results(results: List[Dict], sort_by: str, sort_order: str) -> List[Dict]:
    """Sort search results"""
    reverse = sort_order == "desc"
    
    if sort_by == "relevance":
        results.sort(key=lambda x: x.get("relevance_score", 0), reverse=reverse)
    elif sort_by == "date":
        results.sort(key=lambda x: x.get("date") or x.get("created_at") or x.get("updated_at") or "", reverse=reverse)
    elif sort_by == "name":
        results.sort(key=lambda x: x.get("title") or x.get("name") or x.get("full_name") or "", reverse=reverse)
    
    return results
