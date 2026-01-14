"""
API routes for case summaries.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.case_summary import CaseSummary
from models.reported_cases import ReportedCases
from schemas.case_summary import CaseSummaryResponse, CaseSummaryCreate
from services.case_summary_service import CaseSummaryService

router = APIRouter(prefix="/case-summaries", tags=["case-summaries"])

@router.post("/generate/{case_id}", response_model=CaseSummaryResponse)
async def generate_case_summary(
    case_id: int,
    db: Session = Depends(get_db)
):
    """Generate a case summary for a specific case."""
    # Verify case exists
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        service = CaseSummaryService(db)
        summary = service.generate_summary(case_id)
        
        if not summary:
            raise HTTPException(status_code=500, detail="Failed to generate summary")
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@router.get("/{case_id}", response_model=CaseSummaryResponse)
async def get_case_summary(
    case_id: int,
    db: Session = Depends(get_db)
):
    """Get case summary for a specific case."""
    # Verify case exists
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        service = CaseSummaryService(db)
        summary = service.get_summary(case_id)
        
        if not summary:
            raise HTTPException(status_code=404, detail="Case summary not found. Generate one first.")
        
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")

@router.get("/{case_id}/generate-or-get", response_model=CaseSummaryResponse)
async def get_or_generate_case_summary(
    case_id: int,
    db: Session = Depends(get_db)
):
    """Get case summary if it exists, otherwise generate it."""
    # Verify case exists
    case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        service = CaseSummaryService(db)
        summary = service.get_summary(case_id)
        
        if not summary:
            # Generate if not exists
            print(f"Generating summary for case {case_id}...")
            summary = service.generate_summary(case_id)
            if not summary:
                # Try to generate a basic summary as fallback
                print(f"Summary generation returned None for case {case_id}, creating minimal summary...")
                from models.case_summary import CaseSummary
                # Create a minimal summary from case data
                plaintiff = case.protagonist or "Plaintiff"
                defendant = case.antagonist or "Defendant"
                minimal_summary = f"This case involves {plaintiff} (Plaintiff) against {defendant} (Defendant)."
                if case.area_of_law:
                    minimal_summary += f" The case relates to {case.area_of_law} law."
                
                # Check if summary already exists (race condition)
                existing = db.query(CaseSummary).filter(CaseSummary.case_id == case_id).first()
                if existing:
                    summary = existing
                else:
                    summary = CaseSummary(
                        case_id=case_id,
                        summary=minimal_summary,
                        monetary_value=None,
                        monetary_currency="GHS",
                        has_monetary_value=False
                    )
                    db.add(summary)
                    db.commit()
                    db.refresh(summary)
        
        return summary
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error generating summary for case {case_id}: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
