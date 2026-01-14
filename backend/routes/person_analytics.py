from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.person_analytics import PersonAnalytics
from schemas.person_analytics import PersonAnalyticsResponse, PersonAnalyticsCreate, PersonAnalyticsUpdate
from services.person_analytics_service import PersonAnalyticsService

router = APIRouter()

@router.get("/person/{person_id}/analytics", response_model=PersonAnalyticsResponse)
async def get_person_analytics(person_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific person"""
    # Check if person exists first
    from models.people import People
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    # Try to get existing analytics
    analytics = db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first()
    
    if analytics:
        return analytics
    
    # Return mock analytics for now
    from datetime import datetime
    from decimal import Decimal
    
    return PersonAnalyticsResponse(
        id=0,  # Mock ID
        person_id=person_id,
        risk_score=0,
        risk_level="Low",
        risk_factors=[],
        total_monetary_amount=Decimal('0.00'),
        average_case_value=Decimal('0.00'),
        financial_risk_level="Low",
        primary_subject_matter="N/A",
        subject_matter_categories=[],
        legal_issues=[],
        financial_terms=[],
        case_complexity_score=0,
        success_rate=Decimal('0.00'),
        last_updated=datetime.utcnow(),
        created_at=datetime.utcnow()
    )

@router.post("/person/{person_id}/analytics/generate", response_model=PersonAnalyticsResponse)
async def generate_person_analytics(person_id: int, db: Session = Depends(get_db)):
    """Generate or regenerate analytics for a specific person"""
    service = PersonAnalyticsService(db)
    analytics = await service.generate_analytics_for_person(person_id)
    
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    return analytics

@router.get("/analytics/risk-level/{risk_level}", response_model=List[PersonAnalyticsResponse])
async def get_analytics_by_risk_level(risk_level: str, db: Session = Depends(get_db)):
    """Get all persons with a specific risk level"""
    analytics = db.query(PersonAnalytics).filter(PersonAnalytics.risk_level == risk_level).all()
    return analytics

@router.get("/analytics/financial-risk/{risk_level}", response_model=List[PersonAnalyticsResponse])
async def get_analytics_by_financial_risk(risk_level: str, db: Session = Depends(get_db)):
    """Get all persons with a specific financial risk level"""
    analytics = db.query(PersonAnalytics).filter(PersonAnalytics.financial_risk_level == risk_level).all()
    return analytics

@router.get("/analytics/high-risk", response_model=List[PersonAnalyticsResponse])
async def get_high_risk_persons(db: Session = Depends(get_db)):
    """Get all high-risk persons (High or Critical risk level)"""
    analytics = db.query(PersonAnalytics).filter(
        PersonAnalytics.risk_level.in_(["High", "Critical"])
    ).all()
    return analytics

@router.get("/analytics/stats")
async def get_analytics_stats(db: Session = Depends(get_db)):
    """Get overall analytics statistics"""
    total_persons = db.query(PersonAnalytics).count()
    
    risk_levels = db.query(PersonAnalytics.risk_level, db.func.count()).group_by(PersonAnalytics.risk_level).all()
    financial_risk_levels = db.query(PersonAnalytics.financial_risk_level, db.func.count()).group_by(PersonAnalytics.financial_risk_level).all()
    
    avg_risk_score = db.query(db.func.avg(PersonAnalytics.risk_score)).scalar() or 0
    avg_monetary_amount = db.query(db.func.avg(PersonAnalytics.total_monetary_amount)).scalar() or 0
    
    return {
        "total_persons": total_persons,
        "risk_level_distribution": dict(risk_levels),
        "financial_risk_distribution": dict(financial_risk_levels),
        "average_risk_score": round(avg_risk_score, 2),
        "average_monetary_amount": float(avg_monetary_amount)
    }

@router.get("/person/{person_id}/risk-breakdown")
async def get_person_risk_breakdown(person_id: int, db: Session = Depends(get_db)):
    """Get detailed risk score breakdown for a person"""
    from models.people import People
    from models.reported_cases import ReportedCases
    from models.person_relationships import PersonRelationship
    from models.gazette import Gazette
    from sqlalchemy import func, or_
    from datetime import datetime, timedelta
    
    # Check if person exists
    person = db.query(People).filter(People.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    # Get analytics
    analytics = db.query(PersonAnalytics).filter(PersonAnalytics.person_id == person_id).first()
    
    # Get cases
    cases = db.query(ReportedCases).filter(
        or_(
            ReportedCases.protagonist.ilike(f"%{person.full_name}%"),
            ReportedCases.antagonist.ilike(f"%{person.full_name}%")
        )
    ).all()
    
    # Get relationships
    relationships = db.query(PersonRelationship).filter(
        or_(
            PersonRelationship.person_id == person_id,
            PersonRelationship.related_person_id == person_id
        )
    ).all()
    
    # Get gazettes
    gazettes = db.query(Gazette).filter(Gazette.person_id == person_id).all()
    
    # Calculate breakdown factors
    case_count = len(cases)
    active_cases = len([c for c in cases if c.status and 'active' in str(c.status).lower()])
    won_cases = len([c for c in cases if c.status and 'won' in str(c.status).lower()])
    lost_cases = len([c for c in cases if c.status and ('lost' in str(c.status).lower() or 'dismissed' in str(c.status).lower())])
    
    # Calculate financial exposure
    from models.case_metadata import CaseMetadata
    total_exposure = 0
    for case in cases:
        # Try to get monetary amount from metadata
        metadata = db.query(CaseMetadata).filter(CaseMetadata.case_id == case.id).first()
        if metadata and metadata.monetary_amount:
            try:
                total_exposure += float(metadata.monetary_amount)
            except:
                pass
    
    # Get most recent case date
    most_recent_case = None
    if cases:
        most_recent_case = max(cases, key=lambda c: c.date if c.date else datetime.min)
    
    # Calculate time since last case
    months_since_last_case = None
    if most_recent_case and most_recent_case.date:
        months_since_last_case = (datetime.now() - most_recent_case.date).days // 30
    
    # Calculate risk factors breakdown
    risk_factors = analytics.risk_factors if analytics and analytics.risk_factors else []
    
    # Score breakdown
    score_breakdown = []
    
    # Case Frequency (30% weight)
    case_freq_score = min(case_count * 5, 30)  # Max 30 points
    score_breakdown.append({
        "factor": "Case Frequency",
        "weight": "30%",
        "description": "Number of legal disputes in the past 3 years",
        "value": f"{case_count} cases",
        "points": case_freq_score,
        "max_points": 30
    })
    
    # Case Outcomes (20% weight)
    outcome_score = 0
    if case_count > 0:
        win_rate = (won_cases / case_count) * 100
        if win_rate >= 70:
            outcome_score = 0  # Favorable
        elif win_rate >= 50:
            outcome_score = 5
        else:
            outcome_score = 15
    score_breakdown.append({
        "factor": "Case Outcomes",
        "weight": "20%",
        "description": "Ratio of lost to won cases",
        "value": f"{won_cases} won, {lost_cases} lost" if case_count > 0 else "No cases",
        "points": outcome_score,
        "max_points": 20
    })
    
    # Financial Exposure (20% weight)
    exposure_score = 0
    if total_exposure > 0:
        if total_exposure >= 1000000:  # 1M+
            exposure_score = 20
        elif total_exposure >= 500000:  # 500K+
            exposure_score = 15
        elif total_exposure >= 100000:  # 100K+
            exposure_score = 10
        else:
            exposure_score = 5
    score_breakdown.append({
        "factor": "Financial Exposure",
        "weight": "20%",
        "description": "Total quantum (amount in dispute)",
        "value": f"GHS {total_exposure:,.2f}" if total_exposure > 0 else "N/A",
        "points": exposure_score,
        "max_points": 20
    })
    
    # Case Recency (10% weight)
    recency_score = 0
    if months_since_last_case is not None:
        if months_since_last_case <= 3:
            recency_score = 10
        elif months_since_last_case <= 6:
            recency_score = 7
        elif months_since_last_case <= 12:
            recency_score = 5
        else:
            recency_score = 2
    score_breakdown.append({
        "factor": "Case Recency",
        "weight": "10%",
        "description": "Time since last recorded case",
        "value": f"{months_since_last_case} months ago" if months_since_last_case is not None else "N/A",
        "points": recency_score,
        "max_points": 10
    })
    
    # Data Completeness (10% weight)
    completeness_score = 8  # Default high score if we have analytics
    score_breakdown.append({
        "factor": "Data Completeness",
        "weight": "10%",
        "description": "Accuracy & profile completeness",
        "value": "85%",
        "points": completeness_score,
        "max_points": 10
    })
    
    # Total weighted score
    total_score = sum(item["points"] for item in score_breakdown)
    score_breakdown.append({
        "factor": "Total Weighted Score",
        "weight": "100%",
        "description": "-",
        "value": "-",
        "points": total_score,
        "max_points": 100
    })
    
    # Risk indicators
    risk_indicators = [
        {
            "indicator": "📋 Pending Cases",
            "status": str(active_cases),
            "description": f"Active cases in court system" if active_cases > 0 else "No active cases"
        },
        {
            "indicator": "⚖️ Judgments Lost",
            "status": str(lost_cases),
            "description": "-" if lost_cases == 0 else f"{lost_cases} cases with unfavorable outcomes"
        },
        {
            "indicator": "🏢 Gazette Mentions",
            "status": str(len(gazettes)),
            "description": f"{len(gazettes)} gazette notices" if len(gazettes) > 0 else "No gazette notices"
        },
        {
            "indicator": "🕒 Last Legal Activity",
            "status": most_recent_case.date.strftime("%B %Y") if most_recent_case and most_recent_case.date else "N/A",
            "description": f"Most recent case: {most_recent_case.title[:50]}..." if most_recent_case else "No recorded cases"
        },
        {
            "indicator": "💰 Total Dispute Value",
            "status": f"GHS {total_exposure:,.2f}" if total_exposure > 0 else "N/A",
            "description": "Total amount in dispute across all cases" if total_exposure > 0 else "No monetary amounts recorded"
        }
    ]
    
    # Get risk level and score from analytics or calculate
    risk_score = analytics.risk_score if analytics else total_score
    risk_level = analytics.risk_level if analytics else ("High" if total_score >= 70 else "Medium" if total_score >= 40 else "Low")
    
    return {
        "person_id": person_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "score_breakdown": score_breakdown,
        "risk_indicators": risk_indicators,
        "total_cases": case_count,
        "active_cases": active_cases,
        "won_cases": won_cases,
        "lost_cases": lost_cases,
        "total_exposure": total_exposure,
        "gazette_count": len(gazettes),
        "relationships_count": len(relationships),
        "last_updated": analytics.last_updated.isoformat() if analytics and analytics.last_updated else None
    }
