from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from database import get_db
from models.insurance import Insurance
from models.user import User
from models.insurance_analytics import InsuranceAnalytics
from models.insurance_case_statistics import InsuranceCaseStatistics
from services.insurance_analytics_service import InsuranceAnalyticsService
from schemas.insurance import (
    InsuranceCreate, 
    InsuranceUpdate, 
    InsuranceResponse, 
    InsuranceSearchRequest, 
    InsuranceSearchResponse,
    InsuranceStats
)
from auth import get_current_user
from typing import List, Optional
import logging
import math

router = APIRouter()

@router.get("/search", response_model=InsuranceSearchResponse)
async def search_insurance(
    query: Optional[str] = Query(None, description="General search query"),
    name: Optional[str] = Query(None, description="Insurance name filter"),
    city: Optional[str] = Query(None, description="City filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    insurance_type: Optional[str] = Query(None, description="Insurance type filter"),
    ownership_type: Optional[str] = Query(None, description="Ownership type filter"),
    has_mobile_app: Optional[bool] = Query(None, description="Has mobile app filter"),
    has_online_portal: Optional[bool] = Query(None, description="Has online portal filter"),
    has_online_claims: Optional[bool] = Query(None, description="Has online claims filter"),
    has_24_7_support: Optional[bool] = Query(None, description="Has 24/7 support filter"),
    rating: Optional[str] = Query(None, description="Rating filter"),
    target_market: Optional[str] = Query(None, description="Target market filter"),
    min_assets: Optional[float] = Query(None, description="Minimum assets filter"),
    max_assets: Optional[float] = Query(None, description="Maximum assets filter"),
    sort_by: str = Query("name", description="Sort by field"),
    sort_order: str = Query("asc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
    # Temporarily disabled authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Search insurance companies with various filters"""
    
    # Build query
    db_query = db.query(Insurance).filter(Insurance.is_active == True)
    
    # Apply filters
    if query:
        search_term = f"%{query.lower()}%"
        db_query = db_query.filter(
            or_(
                func.lower(Insurance.name).like(search_term),
                func.lower(Insurance.short_name).like(search_term),
                func.lower(Insurance.license_number).like(search_term),
                func.lower(Insurance.city).like(search_term),
                func.lower(Insurance.region).like(search_term),
                func.lower(Insurance.description).like(search_term)
            )
        )
    
    if name:
        db_query = db_query.filter(func.lower(Insurance.name).like(f"%{name.lower()}%"))
    
    if city:
        db_query = db_query.filter(func.lower(Insurance.city).like(f"%{city.lower()}%"))
    
    if region:
        db_query = db_query.filter(func.lower(Insurance.region).like(f"%{region.lower()}%"))
    
    if insurance_type:
        db_query = db_query.filter(Insurance.insurance_type == insurance_type)
    
    if ownership_type:
        db_query = db_query.filter(Insurance.ownership_type == ownership_type)
    
    if has_mobile_app is not None:
        db_query = db_query.filter(Insurance.has_mobile_app == has_mobile_app)
    
    if has_online_portal is not None:
        db_query = db_query.filter(Insurance.has_online_portal == has_online_portal)
    
    if has_online_claims is not None:
        db_query = db_query.filter(Insurance.has_online_claims == has_online_claims)
    
    if has_24_7_support is not None:
        db_query = db_query.filter(Insurance.has_24_7_support == has_24_7_support)
    
    if rating:
        db_query = db_query.filter(Insurance.rating == rating)
    
    if target_market:
        db_query = db_query.filter(Insurance.target_market == target_market)
    
    if min_assets is not None:
        db_query = db_query.filter(Insurance.total_assets >= min_assets)
    
    if max_assets is not None:
        db_query = db_query.filter(Insurance.total_assets <= max_assets)
    
    # Get total count
    total = db_query.count()
    
    # Apply sorting
    if sort_order.lower() == "desc":
        if sort_by == "name":
            db_query = db_query.order_by(desc(Insurance.name))
        elif sort_by == "city":
            db_query = db_query.order_by(desc(Insurance.city))
        elif sort_by == "rating":
            db_query = db_query.order_by(desc(Insurance.rating))
        elif sort_by == "total_assets":
            db_query = db_query.order_by(desc(Insurance.total_assets))
        elif sort_by == "branches_count":
            db_query = db_query.order_by(desc(Insurance.branches_count))
        else:
            db_query = db_query.order_by(desc(Insurance.name))
    else:
        if sort_by == "name":
            db_query = db_query.order_by(asc(Insurance.name))
        elif sort_by == "city":
            db_query = db_query.order_by(asc(Insurance.city))
        elif sort_by == "rating":
            db_query = db_query.order_by(asc(Insurance.rating))
        elif sort_by == "total_assets":
            db_query = db_query.order_by(asc(Insurance.total_assets))
        elif sort_by == "branches_count":
            db_query = db_query.order_by(asc(Insurance.branches_count))
        else:
            db_query = db_query.order_by(asc(Insurance.name))
    
    # Apply pagination
    offset = (page - 1) * limit
    insurance_companies = db_query.offset(offset).limit(limit).all()
    
    # Update search count for each insurance company
    for insurance in insurance_companies:
        insurance.search_count += 1
        insurance.last_searched = func.now()
    
    db.commit()
    
    # Get analytics data for each insurance company
    insurance_with_analytics = []
    for insurance in insurance_companies:
        # Get analytics data
        analytics = db.query(InsuranceAnalytics).filter(InsuranceAnalytics.insurance_id == insurance.id).first()
        case_stats = db.query(InsuranceCaseStatistics).filter(InsuranceCaseStatistics.insurance_id == insurance.id).first()
        
        # Add analytics data to insurance object
        insurance_dict = {
            "id": insurance.id,
            "name": insurance.name,
            "short_name": insurance.short_name,
            "logo_url": insurance.logo_url,
            "website": insurance.website,
            "phone": insurance.phone,
            "email": insurance.email,
            "address": insurance.address,
            "city": insurance.city,
            "region": insurance.region,
            "country": insurance.country,
            "postal_code": insurance.postal_code,
            "license_number": insurance.license_number,
            "registration_number": insurance.registration_number,
            "established_date": insurance.established_date,
            "insurance_type": insurance.insurance_type,
            "ownership_type": insurance.ownership_type,
            "services": insurance.services,
            "previous_names": insurance.previous_names,
            "coverage_areas": insurance.coverage_areas,
            "branches_count": insurance.branches_count,
            "agents_count": insurance.agents_count,
            "total_assets": insurance.total_assets,
            "net_worth": insurance.net_worth,
            "premium_income": insurance.premium_income,
            "claims_paid": insurance.claims_paid,
            "rating": insurance.rating,
            "head_office_address": insurance.head_office_address,
            "customer_service_phone": insurance.customer_service_phone,
            "customer_service_email": insurance.customer_service_email,
            "claims_phone": insurance.claims_phone,
            "claims_email": insurance.claims_email,
            "has_mobile_app": insurance.has_mobile_app,
            "has_online_portal": insurance.has_online_portal,
            "has_online_claims": insurance.has_online_claims,
            "has_24_7_support": insurance.has_24_7_support,
            "specializes_in": insurance.specializes_in,
            "target_market": insurance.target_market,
            "description": insurance.description,
            "notes": insurance.notes,
            "is_active": insurance.is_active,
            "is_verified": insurance.is_verified,
            "verification_date": insurance.verification_date,
            "verification_notes": insurance.verification_notes,
            "search_count": insurance.search_count,
            "last_searched": insurance.last_searched,
            "created_at": insurance.created_at,
            "updated_at": insurance.updated_at,
            "created_by": insurance.created_by,
            "updated_by": insurance.updated_by,
            "status": insurance.status,
            # Add analytics data
            "total_cases": case_stats.total_cases if case_stats else 0,
            "risk_score": analytics.risk_score if analytics else 0,
            "risk_level": analytics.risk_level if analytics else "Low",
            "success_rate": analytics.success_rate if analytics else 0.0,
            "analytics_available": analytics is not None,
            "case_statistics_available": case_stats is not None
        }
        insurance_with_analytics.append(insurance_dict)
    
    # Calculate pagination info
    total_pages = math.ceil(total / limit)
    has_next = page < total_pages
    has_prev = page > 1
    
    return InsuranceSearchResponse(
        insurance=insurance_with_analytics,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )

@router.get("/", response_model=List[InsuranceResponse])
async def get_insurance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all insurance companies"""
    insurance = db.query(Insurance).filter(Insurance.is_active == True).offset(skip).limit(limit).all()
    return insurance

@router.get("/{insurance_id}", response_model=InsuranceResponse)
async def get_insurance_company(
    insurance_id: int,
    db: Session = Depends(get_db)
    # Temporarily disabled authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get a specific insurance company by ID"""
    insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    return insurance

@router.post("/", response_model=InsuranceResponse)
async def create_insurance(
    insurance: InsuranceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new insurance company"""
    db_insurance = Insurance(**insurance.dict())
    db.add(db_insurance)
    db.commit()
    db.refresh(db_insurance)
    return db_insurance

@router.put("/{insurance_id}", response_model=InsuranceResponse)
async def update_insurance(
    insurance_id: int,
    insurance: InsuranceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an insurance company"""
    db_insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not db_insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    update_data = insurance.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_insurance, field, value)
    
    db.commit()
    db.refresh(db_insurance)
    return db_insurance

@router.delete("/{insurance_id}")
async def delete_insurance(
    insurance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an insurance company (soft delete)"""
    db_insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not db_insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    db_insurance.is_active = False
    db.commit()
    return {"message": "Insurance company deleted successfully"}

@router.get("/stats/overview", response_model=InsuranceStats)
async def get_insurance_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get insurance statistics"""
    
    total_insurance = db.query(Insurance).count()
    active_insurance = db.query(Insurance).filter(Insurance.is_active == True).count()
    
    # Insurance by type
    insurance_by_type = db.query(
        Insurance.insurance_type, 
        func.count(Insurance.id).label('count')
    ).filter(Insurance.is_active == True).group_by(Insurance.insurance_type).all()
    insurance_by_type_dict = {item.insurance_type or 'Unknown': item.count for item in insurance_by_type}
    
    # Insurance by region
    insurance_by_region = db.query(
        Insurance.region, 
        func.count(Insurance.id).label('count')
    ).filter(Insurance.is_active == True).group_by(Insurance.region).all()
    insurance_by_region_dict = {item.region or 'Unknown': item.count for item in insurance_by_region}
    
    # Insurance with mobile app
    insurance_with_mobile_app = db.query(Insurance).filter(
        Insurance.is_active == True,
        Insurance.has_mobile_app == True
    ).count()
    
    # Insurance with online portal
    insurance_with_online_portal = db.query(Insurance).filter(
        Insurance.is_active == True,
        Insurance.has_online_portal == True
    ).count()
    
    return InsuranceStats(
        total_insurance=total_insurance,
        active_insurance=active_insurance,
        insurance_by_type=insurance_by_type_dict,
        insurance_by_region=insurance_by_region_dict,
        insurance_with_mobile_app=insurance_with_mobile_app,
        insurance_with_online_portal=insurance_with_online_portal
    )

@router.get("/{insurance_id}/analytics")
async def get_insurance_analytics(
    insurance_id: int,
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get analytics for a specific insurance company"""
    
    # Check if insurance company exists
    insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    # Get or generate analytics
    analytics = db.query(InsuranceAnalytics).filter(InsuranceAnalytics.insurance_id == insurance_id).first()
    
    if not analytics:
        # Generate analytics if they don't exist
        analytics_service = InsuranceAnalyticsService(db)
        analytics = analytics_service.generate_insurance_analytics(insurance_id)
    
    if not analytics:
        return {
            "insurance_id": insurance_id,
            "analytics_available": False,
            "message": "No analytics available for this insurance company"
        }
    
    return {
        "insurance_id": insurance_id,
        "analytics_available": True,
        "risk_score": analytics.risk_score,
        "risk_level": analytics.risk_level,
        "risk_factors": analytics.risk_factors or [],
        "total_monetary_amount": float(analytics.total_monetary_amount) if analytics.total_monetary_amount else 0,
        "average_case_value": float(analytics.average_case_value) if analytics.average_case_value else 0,
        "financial_risk_level": analytics.financial_risk_level,
        "primary_subject_matter": analytics.primary_subject_matter,
        "subject_matter_categories": analytics.subject_matter_categories or {},
        "legal_issues": analytics.legal_issues or [],
        "financial_terms": analytics.financial_terms or [],
        "case_complexity_score": analytics.case_complexity_score,
        "success_rate": float(analytics.success_rate) if analytics.success_rate else 0,
        "regulatory_compliance_score": analytics.regulatory_compliance_score,
        "customer_dispute_rate": float(analytics.customer_dispute_rate) if analytics.customer_dispute_rate else 0,
        "operational_risk_score": analytics.operational_risk_score,
        "claims_ratio": float(analytics.claims_ratio) if analytics.claims_ratio else 0,
        "underwriting_risk_score": analytics.underwriting_risk_score,
        "solvency_ratio": float(analytics.solvency_ratio) if analytics.solvency_ratio else 0,
        "premium_adequacy_score": analytics.premium_adequacy_score,
        "last_updated": analytics.last_updated.isoformat() if analytics.last_updated else None,
        "created_at": analytics.created_at.isoformat() if analytics.created_at else None
    }

@router.get("/{insurance_id}/case-statistics")
async def get_insurance_case_statistics(
    insurance_id: int,
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get case statistics for a specific insurance company"""
    
    # Check if insurance company exists
    insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    # Get or generate statistics
    stats = db.query(InsuranceCaseStatistics).filter(InsuranceCaseStatistics.insurance_id == insurance_id).first()
    
    if not stats:
        # Generate statistics if they don't exist
        analytics_service = InsuranceAnalyticsService(db)
        stats = analytics_service.generate_insurance_case_statistics(insurance_id)
    
    if not stats:
        return {
            "insurance_id": insurance_id,
            "statistics_available": False,
            "message": "No case statistics available for this insurance company"
        }
    
    return {
        "insurance_id": insurance_id,
        "statistics_available": True,
        "total_cases": stats.total_cases,
        "resolved_cases": stats.resolved_cases,
        "unresolved_cases": stats.unresolved_cases,
        "favorable_cases": stats.favorable_cases,
        "unfavorable_cases": stats.unfavorable_cases,
        "mixed_cases": stats.mixed_cases,
        "case_outcome": stats.case_outcome,
        "last_updated": stats.last_updated.isoformat() if stats.last_updated else None,
        "created_at": stats.created_at.isoformat() if stats.created_at else None
    }

@router.get("/{insurance_id}/related-cases")
async def get_insurance_related_cases(
    insurance_id: int,
    limit: int = Query(10, ge=1, le=100, description="Maximum related cases"),
    db: Session = Depends(get_db)
    # Temporarily removed authentication for testing
    # current_user: User = Depends(get_current_user)
):
    """Get related cases for a specific insurance company"""
    
    # Check if insurance company exists
    insurance = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    
    # Find real related cases
    from services.insurance_analytics_service import InsuranceAnalyticsService
    analytics_service = InsuranceAnalyticsService(db)
    
    # Get related cases using the same logic as analytics
    related_cases = analytics_service._get_insurance_cases(insurance_id)
    
    # Format cases for API response
    def format_case_for_api(case):
        # Handle date formatting
        formatted_date = "N/A"
        if case.date:
            if hasattr(case.date, 'strftime'):
                formatted_date = case.date.strftime("%Y-%m-%d")
            elif isinstance(case.date, str):
                formatted_date = case.date
            else:
                formatted_date = str(case.date)
        
        return {
            "id": case.id,
            "title": case.title or "N/A",
            "suit_reference_number": case.suit_reference_number or "N/A",
            "court_type": case.court_type or "N/A",
            "date": formatted_date,
            "area_of_law": case.area_of_law or "N/A",
            "ai_case_outcome": case.ai_case_outcome or "N/A",
            "case_summary": case.case_summary or "N/A",
            "protagonist": case.protagonist or "N/A",
            "antagonist": case.antagonist or "N/A",
            "presiding_judge": case.presiding_judge or "N/A",
            "lawyers": case.lawyers or "N/A",
            "year": case.year or "N/A",
            "region": case.region or "N/A",
            "town": case.town or "N/A"
        }
    
    formatted_cases = [format_case_for_api(case) for case in related_cases[:limit]]
    
    return {
        "insurance_id": insurance_id,
        "related_cases": formatted_cases,
        "total_related_cases": len(related_cases)
    }
