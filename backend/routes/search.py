from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc, String
from database import get_db
from models.people import People
from models.banks import Banks
from models.insurance import Insurance
from models.companies import Companies
from models.user import User
from models.gazette import Gazette
from schemas.search import (
    UnifiedSearchRequest,
    UnifiedSearchResponse,
    SearchResultItem,
    QuickSearchRequest,
    QuickSearchResponse,
    AdvancedSearchRequest,
    AdvancedSearchResponse,
    SearchStats
)
from auth import get_current_user
from typing import List, Optional, Dict, Any
import logging
import math
import time
from services.usage_tracking_service import UsageTrackingService

router = APIRouter()

@router.get("/unified", response_model=UnifiedSearchResponse)
async def unified_search(
    query: Optional[str] = Query(None, description="General search query"),
    search_type: str = Query("all", description="Type of search (all, people, banks, insurance, companies)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(1000, ge=1, le=5000, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unified search across people, banks, and insurance"""
    
    start_time = time.time()
    results = []
    people_results = []
    banks_results = []
    insurance_results = []
    
    # Search people
    if search_type in ["all", "people"]:
        people_query = db.query(People).filter(People.is_verified == True)
        if query:
            search_term = f"%{query.lower()}%"
            people_query = people_query.filter(
                or_(
                    func.lower(People.full_name).like(search_term),
                    func.lower(People.first_name).like(search_term),
                    func.lower(People.last_name).like(search_term),
                    func.lower(People.id_number).like(search_term),
                    func.lower(People.phone_number).like(search_term),
                    func.lower(People.email).like(search_term),
                    func.lower(People.address).like(search_term),
                    func.lower(People.city).like(search_term),
                    func.lower(People.region).like(search_term),
                    # Search in previous_names (alias names) JSON array
                    func.cast(People.previous_names, String).ilike(search_term)
                )
            )
        
        people_results = people_query.all()
        
        # Add to unified results with case statistics
        for person in people_results:
            # Add case statistics if available (same logic as people search endpoint)
            if hasattr(person, 'case_statistics') and person.case_statistics:
                stats = person.case_statistics
                total_cases = stats.total_cases
                resolved_cases = stats.resolved_cases
                unresolved_cases = stats.unresolved_cases
                case_outcome = stats.case_outcome
            else:
                # Default values if no statistics available
                total_cases = 0
                resolved_cases = 0
                unresolved_cases = 0
                case_outcome = "N/A"
            
            results.append(SearchResultItem(
                id=person.id,
                name=person.full_name,
                type="people",
                description=f"{person.risk_level} Risk • {person.case_count} cases",
                city=person.city,
                region=person.region,
                additional_info={
                    "risk_level": person.risk_level,
                    "case_count": person.case_count,
                    "total_cases": total_cases,
                    "resolved_cases": resolved_cases,
                    "unresolved_cases": unresolved_cases,
                    "case_outcome": case_outcome,
                    "phone": person.phone_number,
                    "email": person.email
                }
            ))
    
    # Search banks
    if search_type in ["all", "banks"]:
        banks_query = db.query(Banks).filter(Banks.is_active == True)
        if query:
            search_term = f"%{query.lower()}%"
            banks_query = banks_query.filter(
                or_(
                    func.lower(Banks.name).like(search_term),
                    func.lower(Banks.short_name).like(search_term),
                    func.lower(Banks.bank_code).like(search_term),
                    func.lower(Banks.city).like(search_term),
                    func.lower(Banks.region).like(search_term),
                    func.lower(Banks.description).like(search_term)
                )
            )
        
        banks_results = banks_query.all()
        
        # Add to unified results
        for bank in banks_results:
            results.append(SearchResultItem(
                id=bank.id,
                name=bank.name,
                type="banks",
                description=f"{bank.bank_type} • {bank.city}, {bank.region}",
                city=bank.city,
                region=bank.region,
                logo_url=bank.logo_url,
                additional_info={
                    "bank_type": bank.bank_type,
                    "rating": bank.rating,
                    "phone": bank.phone,
                    "website": bank.website,
                    "has_mobile_app": bank.has_mobile_app,
                    "has_online_banking": bank.has_online_banking
                }
            ))
    
    # Search insurance
    if search_type in ["all", "insurance"]:
        insurance_query = db.query(Insurance).filter(Insurance.is_active == True)
        if query:
            search_term = f"%{query.lower()}%"
            insurance_query = insurance_query.filter(
                or_(
                    func.lower(Insurance.name).like(search_term),
                    func.lower(Insurance.short_name).like(search_term),
                    func.lower(Insurance.license_number).like(search_term),
                    func.lower(Insurance.city).like(search_term),
                    func.lower(Insurance.region).like(search_term),
                    func.lower(Insurance.description).like(search_term)
                )
            )
        
        insurance_results = insurance_query.all()
        
        # Add to unified results
        for insurance in insurance_results:
            results.append(SearchResultItem(
                id=insurance.id,
                name=insurance.name,
                type="insurance",
                description=f"{insurance.insurance_type} • {insurance.city}, {insurance.region}",
                city=insurance.city,
                region=insurance.region,
                logo_url=insurance.logo_url,
                additional_info={
                    "insurance_type": insurance.insurance_type,
                    "rating": insurance.rating,
                    "phone": insurance.phone,
                    "website": insurance.website,
                    "has_mobile_app": insurance.has_mobile_app,
                    "has_online_portal": insurance.has_online_portal
                }
            ))
    
    # Search companies
    if search_type in ["all", "companies"]:
        companies_query = db.query(Companies).filter(Companies.is_active == True)
        if query:
            search_term = f"%{query.lower()}%"
            companies_query = companies_query.filter(
                or_(
                    func.lower(Companies.name).like(search_term),
                    func.lower(Companies.short_name).like(search_term),
                    func.lower(Companies.registration_number).like(search_term),
                    func.lower(Companies.city).like(search_term),
                    func.lower(Companies.region).like(search_term),
                    func.lower(Companies.industry).like(search_term),
                    func.lower(Companies.description).like(search_term)
                )
            )
        
        companies_results = companies_query.all()
        
        # Add to unified results
        for company in companies_results:
            results.append(SearchResultItem(
                id=company.id,
                name=company.name,
                type="companies",
                description=f"{company.company_type} • {company.industry} • {company.city}, {company.region}",
                city=company.city,
                region=company.region,
                logo_url=company.logo_url,
                additional_info={
                    "company_type": company.company_type,
                    "industry": company.industry,
                    "registration_number": company.registration_number,
                    "phone": company.phone,
                    "website": company.website,
                    "employee_count": company.employee_count,
                    "annual_revenue": company.annual_revenue
                }
            ))
    
    # Calculate total results
    total_results = len(results)
    
    # Apply pagination to unified results
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_results = results[start_idx:end_idx]
    
    # Calculate pagination info
    total_pages = math.ceil(total_results / limit)
    has_next = page < total_pages
    has_prev = page > 1
    
    search_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    # Track usage for billing
    try:
        usage_service = UsageTrackingService(db)
        usage_service.track_search_usage(
            user_id=current_user.id if current_user else None,
            session_id=None,  # Could be extracted from headers
            query=query or "",
            endpoint="/api/search/unified",
            results_count=total_results,
            response_time_ms=int(search_time),
            filters_applied={"search_type": search_type, "page": page, "limit": limit}
        )
    except Exception as e:
        logging.error(f"Error tracking search usage: {e}")
    
    return UnifiedSearchResponse(
        results=paginated_results,
        people=people_results if search_type in ["all", "people"] else None,
        banks=banks_results if search_type in ["all", "banks"] else None,
        insurance=insurance_results if search_type in ["all", "insurance"] else None,
        total=total_results,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev,
        search_type=search_type,
        query=query,
        search_time_ms=search_time
    )

@router.get("/quick", response_model=QuickSearchResponse)
async def quick_search(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    db: Session = Depends(get_db)
    # Temporarily removed authentication for home page search
    # current_user: User = Depends(get_current_user)
):
    """Quick search for suggestions and autocomplete"""
    
    search_term = f"%{query.lower()}%"
    suggestions = []
    
    # Search people
    people = db.query(People).filter(
        People.is_verified == True,
        or_(
            func.lower(People.full_name).like(search_term),
            func.lower(People.first_name).like(search_term),
            func.lower(People.last_name).like(search_term),
            # Search in previous_names (alias names) JSON array
            func.cast(People.previous_names, String).ilike(search_term)
        )
    ).limit(limit).all()
    
    for person in people:
        suggestions.append(SearchResultItem(
            id=person.id,
            name=person.full_name,
            type="people",
            description=f"{person.risk_level} Risk",
            city=person.city,
            region=person.region
        ))
    
    # Search banks
    banks = db.query(Banks).filter(
        Banks.is_active == True,
        or_(
            func.lower(Banks.name).like(search_term),
            func.lower(Banks.short_name).like(search_term)
        )
    ).limit(limit // 3).all()
    
    for bank in banks:
        suggestions.append(SearchResultItem(
            id=bank.id,
            name=bank.name,
            type="banks",
            description=f"{bank.bank_type}",
            city=bank.city,
            region=bank.region,
            logo_url=bank.logo_url
        ))
    
    # Search insurance
    insurance = db.query(Insurance).filter(
        Insurance.is_active == True,
        or_(
            func.lower(Insurance.name).like(search_term),
            func.lower(Insurance.short_name).like(search_term)
        )
    ).limit(limit // 3).all()
    
    for ins in insurance:
        suggestions.append(SearchResultItem(
            id=ins.id,
            name=ins.name,
            type="insurance",
            description=f"{ins.insurance_type}",
            city=ins.city,
            region=ins.region,
            logo_url=ins.logo_url
        ))
    
    # Search companies
    companies = db.query(Companies).filter(
        Companies.is_active == True,
        or_(
            func.lower(Companies.name).like(search_term),
            func.lower(Companies.short_name).like(search_term)
        )
    ).limit(limit // 4).all()
    
    for company in companies:
        suggestions.append(SearchResultItem(
            id=company.id,
            name=company.name,
            type="companies",
            description=f"{company.company_type} • {company.industry or 'N/A'}",
            city=company.city,
            region=company.region,
            logo_url=company.logo_url
        ))
    
    # Search gazette entries (names)
    gazettes = db.query(Gazette).filter(
        Gazette.is_public == True,
        or_(
            func.lower(Gazette.old_name).like(search_term),
            func.lower(Gazette.new_name).like(search_term),
            func.lower(Gazette.title).like(search_term),
            func.lower(Gazette.reference_number).like(search_term)
        )
    ).limit(limit // 5).all()
    
    for gazette in gazettes:
        # Determine the primary name to display
        display_name = gazette.new_name or gazette.old_name or gazette.title
        gazette_type = gazette.gazette_type.replace('_', ' ').title() if gazette.gazette_type else 'Gazette Entry'
        
        suggestions.append(SearchResultItem(
            id=gazette.id,
            name=display_name,
            type="gazette",
            description=f"{gazette_type} • {gazette.gazette_number or 'N/A'}",
            city=gazette.court_location,
            region=gazette.jurisdiction,
            person_id=gazette.person_id
        ))
    
    return QuickSearchResponse(
        suggestions=suggestions[:limit],
        total=len(suggestions)
    )

@router.post("/advanced", response_model=AdvancedSearchResponse)
async def advanced_search(
    request: AdvancedSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Advanced search with detailed filters"""
    
    start_time = time.time()
    results = {}
    total_results = 0
    
    # Search people
    if request.search_people:
        people_query = db.query(People).filter(People.is_verified == True)
        
        if request.query:
            search_term = f"%{request.query.lower()}%"
            people_query = people_query.filter(
                or_(
                    func.lower(People.full_name).like(search_term),
                    func.lower(People.first_name).like(search_term),
                    func.lower(People.last_name).like(search_term),
                    func.lower(People.id_number).like(search_term),
                    func.lower(People.phone_number).like(search_term),
                    func.lower(People.email).like(search_term)
                )
            )
        
        # Apply people filters
        if request.people_filters:
            filters = request.people_filters
            if "risk_level" in filters:
                people_query = people_query.filter(People.risk_level == filters["risk_level"])
            if "city" in filters:
                people_query = people_query.filter(func.lower(People.city).like(f"%{filters['city'].lower()}%"))
            if "region" in filters:
                people_query = people_query.filter(func.lower(People.region).like(f"%{filters['region'].lower()}%"))
            if "min_case_count" in filters:
                people_query = people_query.filter(People.case_count >= filters["min_case_count"])
            if "max_case_count" in filters:
                people_query = people_query.filter(People.case_count <= filters["max_case_count"])
        
        people_count = people_query.count()
        people_results = people_query.offset((request.page - 1) * request.limit).limit(request.limit).all()
        results["people"] = {
            "data": people_results,
            "total": people_count,
            "page": request.page,
            "limit": request.limit
        }
        total_results += people_count
    
    # Search banks
    if request.search_banks:
        banks_query = db.query(Banks).filter(Banks.is_active == True)
        
        if request.query:
            search_term = f"%{request.query.lower()}%"
            banks_query = banks_query.filter(
                or_(
                    func.lower(Banks.name).like(search_term),
                    func.lower(Banks.short_name).like(search_term),
                    func.lower(Banks.bank_code).like(search_term)
                )
            )
        
        # Apply banks filters
        if request.banks_filters:
            filters = request.banks_filters
            if "bank_type" in filters:
                banks_query = banks_query.filter(Banks.bank_type == filters["bank_type"])
            if "city" in filters:
                banks_query = banks_query.filter(func.lower(Banks.city).like(f"%{filters['city'].lower()}%"))
            if "region" in filters:
                banks_query = banks_query.filter(func.lower(Banks.region).like(f"%{filters['region'].lower()}%"))
            if "has_mobile_app" in filters:
                banks_query = banks_query.filter(Banks.has_mobile_app == filters["has_mobile_app"])
            if "has_online_banking" in filters:
                banks_query = banks_query.filter(Banks.has_online_banking == filters["has_online_banking"])
        
        banks_count = banks_query.count()
        banks_results = banks_query.offset((request.page - 1) * request.limit).limit(request.limit).all()
        results["banks"] = {
            "data": banks_results,
            "total": banks_count,
            "page": request.page,
            "limit": request.limit
        }
        total_results += banks_count
    
    # Search insurance
    if request.search_insurance:
        insurance_query = db.query(Insurance).filter(Insurance.is_active == True)
        
        if request.query:
            search_term = f"%{request.query.lower()}%"
            insurance_query = insurance_query.filter(
                or_(
                    func.lower(Insurance.name).like(search_term),
                    func.lower(Insurance.short_name).like(search_term),
                    func.lower(Insurance.license_number).like(search_term)
                )
            )
        
        # Apply insurance filters
        if request.insurance_filters:
            filters = request.insurance_filters
            if "insurance_type" in filters:
                insurance_query = insurance_query.filter(Insurance.insurance_type == filters["insurance_type"])
            if "city" in filters:
                insurance_query = insurance_query.filter(func.lower(Insurance.city).like(f"%{filters['city'].lower()}%"))
            if "region" in filters:
                insurance_query = insurance_query.filter(func.lower(Insurance.region).like(f"%{filters['region'].lower()}%"))
            if "has_mobile_app" in filters:
                insurance_query = insurance_query.filter(Insurance.has_mobile_app == filters["has_mobile_app"])
            if "has_online_portal" in filters:
                insurance_query = insurance_query.filter(Insurance.has_online_portal == filters["has_online_portal"])
        
        insurance_count = insurance_query.count()
        insurance_results = insurance_query.offset((request.page - 1) * request.limit).limit(request.limit).all()
        results["insurance"] = {
            "data": insurance_results,
            "total": insurance_count,
            "page": request.page,
            "limit": request.limit
        }
        total_results += insurance_count
    
    search_time = (time.time() - start_time) * 1000
    
    return AdvancedSearchResponse(
        results=results,
        total_results=total_results,
        search_metadata={
            "query": request.query,
            "search_time_ms": search_time,
            "filters_applied": {
                "people": request.people_filters,
                "banks": request.banks_filters,
                "insurance": request.insurance_filters
            }
        },
        pagination={
            "page": request.page,
            "limit": request.limit,
            "total_pages": math.ceil(total_results / request.limit)
        }
    )

@router.get("/stats", response_model=SearchStats)
async def get_search_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get search statistics"""
    
    total_people = db.query(People).filter(People.is_verified == True).count()
    total_banks = db.query(Banks).filter(Banks.is_active == True).count()
    total_insurance = db.query(Insurance).filter(Insurance.is_active == True).count()
    
    # This would typically come from a search logs table
    total_searches_today = 0  # Placeholder
    popular_searches = []  # Placeholder
    
    search_categories = {
        "people": total_people,
        "banks": total_banks,
        "insurance": total_insurance
    }
    
    return SearchStats(
        total_people=total_people,
        total_banks=total_banks,
        total_insurance=total_insurance,
        total_searches_today=total_searches_today,
        popular_searches=popular_searches,
        search_categories=search_categories
    )
