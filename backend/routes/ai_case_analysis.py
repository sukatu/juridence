from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from services.on_demand_ai_analysis import analyze_case_if_needed
from models.user import User
from auth import get_current_user

router = APIRouter(prefix="/ai-case-analysis", tags=["ai-case-analysis"])

@router.post("/analyze/{case_id}", response_model=Dict[str, Any])
def analyze_case_on_demand(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze a case with AI if it hasn't been analyzed before.
    This endpoint is called when a case is first opened.
    """
    try:
        result = analyze_case_if_needed(case_id)
        
        if result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/status/{case_id}", response_model=Dict[str, Any])
def get_analysis_status(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if a case has been analyzed and get analysis status.
    """
    try:
        from services.on_demand_ai_analysis import ai_analyzer
        
        is_analyzed, generated_at = ai_analyzer.is_case_analyzed(case_id)
        
        return {
            "case_id": case_id,
            "is_analyzed": is_analyzed,
            "generated_at": generated_at.isoformat() if generated_at else None,
            "status": "analyzed" if is_analyzed else "pending"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check failed: {str(e)}"
        )

@router.get("/stats", response_model=Dict[str, Any])
def get_analysis_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics about AI analysis coverage.
    """
    try:
        from sqlalchemy import text
        
        # Total cases with content
        total_cases = db.execute(text("""
            SELECT COUNT(*) FROM reported_cases 
            WHERE (decision IS NOT NULL AND decision != '') 
            OR (judgement IS NOT NULL AND judgement != '')
        """)).scalar()
        
        # Analyzed cases
        analyzed_cases = db.execute(text("""
            SELECT COUNT(*) FROM reported_cases 
            WHERE ai_detailed_outcome IS NOT NULL 
            AND ai_detailed_outcome != ''
        """)).scalar()
        
        # Pending cases
        pending_cases = total_cases - analyzed_cases
        
        # Analysis by outcome
        outcome_stats = db.execute(text("""
            SELECT ai_case_outcome, COUNT(*) as count
            FROM reported_cases 
            WHERE ai_detailed_outcome IS NOT NULL 
            AND ai_detailed_outcome != ''
            GROUP BY ai_case_outcome
        """)).fetchall()
        
        # Analysis by financial impact
        impact_stats = db.execute(text("""
            SELECT ai_financial_impact, COUNT(*) as count
            FROM reported_cases 
            WHERE ai_detailed_outcome IS NOT NULL 
            AND ai_detailed_outcome != ''
            GROUP BY ai_financial_impact
        """)).fetchall()
        
        return {
            "total_cases": total_cases,
            "analyzed_cases": analyzed_cases,
            "pending_cases": pending_cases,
            "completion_percentage": (analyzed_cases / total_cases * 100) if total_cases > 0 else 0,
            "outcome_distribution": {row[0]: row[1] for row in outcome_stats},
            "impact_distribution": {row[0]: row[1] for row in impact_stats}
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stats retrieval failed: {str(e)}"
        )