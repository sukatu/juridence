"""
Case Summarization Routes
Uses local LLM to generate case summaries and outcomes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.reported_cases import ReportedCases
from models.case_metadata import CaseMetadata
from auth import get_current_user
from typing import Dict, Any
from services.local_llm_service import LocalLLMService
import logging

router = APIRouter(prefix="/api/case-summarization", tags=["case_summarization"])
logger = logging.getLogger(__name__)

@router.post("/{case_id}/summarize")
async def summarize_case(
    case_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """
    Generate AI-powered summary and outcome for a case using local LLM
    """
    try:
        # Fetch case with metadata
        case = db.query(ReportedCases).outerjoin(
            CaseMetadata, ReportedCases.id == CaseMetadata.case_id
        ).filter(ReportedCases.id == case_id).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Prepare case data - prioritize decision column
        case_data = {
            "id": case.id,
            "title": case.title,
            "suit_reference_number": case.suit_reference_number,
            "date": case.date.isoformat() if case.date else None,
            "protagonist": case.protagonist,
            "antagonist": case.antagonist,
            "case_summary": case.case_summary,
            "detail_content": case.detail_content,
            "decision": case.decision or "",  # Primary source - ensure it's always included
            "judgement": case.judgement or "",
            "area_of_law": case.area_of_law,
            "court_type": case.court_type,
            "court_division": case.court_division,
            "region": case.region,
            "town": case.town,
            "presiding_judge": case.presiding_judge,
            "lawyers": case.lawyers,
            "metadata": {}
        }
        
        # Add metadata if available
        if case.case_metadata:
            case_data["metadata"] = {
                "case_summary": case.case_metadata.case_summary,
                "outcome": case.case_metadata.outcome,
                "resolution_status": case.case_metadata.resolution_status,
                "decision_type": case.case_metadata.decision_type,
                "monetary_amount": case.case_metadata.monetary_amount
            }
        
        logger.info(f"Case data prepared for case {case_id}. Decision column: {bool(case_data.get('decision'))}")
        
        # Initialize local LLM service
        llm_service = LocalLLMService(db=db)
        
        # Check cache first
        cache_key = llm_service._get_cache_key(case_data)
        cached_result = llm_service._get_cached_summary(case_id, cache_key)
        
        if cached_result:
            return {
                "case_id": case_id,
                "summary": cached_result["summary"],
                "outcome": cached_result["outcome"],
                "success": True,
                "cached": True
            }
        
        # Generate summary and outcome
        try:
            summary = llm_service.generate_case_summary(case_data)
            outcome = llm_service.generate_case_outcome(case_data)
            
            # Cache the results
            llm_service._cache_summary(case_id, cache_key, summary, outcome)
            
            return {
                "case_id": case_id,
                "summary": summary,
                "outcome": outcome,
                "success": True,
                "cached": False
            }
        except Exception as llm_error:
            logger.error(f"Error generating summary with local LLM: {llm_error}")
            logger.info("Using fallback summary based on decision column")
            
            # Return fallback summary using decision column
            fallback_summary = llm_service._generate_fallback_summary(case_data)
            
            # Generate fallback outcome from decision with financial lawyer perspective
            decision = case_data.get("decision", "")
            judgement = case_data.get("judgement", "")
            outcome_metadata = case_data.get("metadata", {}).get("outcome", "") if isinstance(case_data.get("metadata"), dict) else ""
            
            # Create financial lawyer perspective outcome from decision
            if decision:
                fallback_outcome = f"From a financial law perspective: {decision}"
            elif judgement:
                fallback_outcome = f"From a financial law perspective: {judgement}"
            elif outcome_metadata:
                fallback_outcome = f"From a financial law perspective: {outcome_metadata}"
            else:
                fallback_outcome = "Outcome not available in case records."
            
            # Cache the fallback results too
            cache_key = llm_service._get_cache_key(case_data)
            llm_service._cache_summary(case_id, cache_key, fallback_summary, fallback_outcome)
            
            return {
                "case_id": case_id,
                "summary": fallback_summary,
                "outcome": fallback_outcome,
                "success": True,  # Still successful, just using fallback
                "cached": False,
                "fallback": True,
                "note": "Generated from case decision column (LLM unavailable)"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in summarize_case: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating case summary: {str(e)}"
        )

@router.get("/{case_id}/summary")
async def get_case_summary(
    case_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """
    Get or generate case summary and outcome
    Always generates fresh AI summary (uses cache if available)
    Summary is NOT saved to database, only cached in memory
    """
    try:
        # Fetch case with metadata
        case = db.query(ReportedCases).outerjoin(
            CaseMetadata, ReportedCases.id == CaseMetadata.case_id
        ).filter(ReportedCases.id == case_id).first()
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Always generate AI summary (will use cache if available)
        # This ensures fresh perspective from financial lawyer
        return await summarize_case(case_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_case_summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting case summary: {str(e)}"
        )
