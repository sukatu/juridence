"""
API routes for banking summary generation and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from models.reported_cases import ReportedCases
from services.banking_summary_service import BankingSummaryService

router = APIRouter(prefix="/api/banking-summary", tags=["banking-summary"])

@router.post("/generate/{case_id}")
async def generate_banking_summary(case_id: int, db: Session = Depends(get_db)):
    """Generate and save AI-powered banking summary for a case."""
    try:
        # Get the case
        case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Generate banking summary
        banking_service = BankingSummaryService(db)
        summary_data = banking_service.generate_banking_summary(case)
        
        # Save to database
        success = banking_service.save_banking_summary(case_id, summary_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save banking summary")
        
        return {
            "message": "Banking summary generated and saved successfully",
            "case_id": case_id,
            "summary": summary_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating banking summary: {str(e)}")

@router.get("/{case_id}")
async def get_banking_summary(case_id: int, db: Session = Depends(get_db)):
    """Get existing banking summary for a case."""
    try:
        banking_service = BankingSummaryService(db)
        summary = banking_service.get_banking_summary(case_id)
        
        if not summary:
            raise HTTPException(status_code=404, detail="Banking summary not found for this case")
        
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting banking summary: {str(e)}")

@router.post("/generate-batch")
async def generate_banking_summaries_batch(
    case_ids: list[int], 
    db: Session = Depends(get_db)
):
    """Generate banking summaries for multiple cases."""
    try:
        banking_service = BankingSummaryService(db)
        results = []
        
        for case_id in case_ids:
            try:
                case = db.query(ReportedCases).filter(ReportedCases.id == case_id).first()
                if not case:
                    results.append({"case_id": case_id, "status": "error", "message": "Case not found"})
                    continue
                
                summary_data = banking_service.generate_banking_summary(case)
                success = banking_service.save_banking_summary(case_id, summary_data)
                
                if success:
                    results.append({"case_id": case_id, "status": "success", "message": "Summary generated"})
                else:
                    results.append({"case_id": case_id, "status": "error", "message": "Failed to save"})
                    
            except Exception as e:
                results.append({"case_id": case_id, "status": "error", "message": str(e)})
        
        return {
            "message": f"Batch processing completed for {len(case_ids)} cases",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in batch processing: {str(e)}")

@router.get("/stats/summary")
async def get_summary_stats(db: Session = Depends(get_db)):
    """Get statistics about generated banking summaries."""
    try:
        total_cases = db.query(ReportedCases).count()
        cases_with_summaries = db.query(ReportedCases).filter(
            ReportedCases.ai_summary_generated_at.isnot(None)
        ).count()
        
        # Count by outcome
        outcome_stats = db.query(
            ReportedCases.ai_case_outcome,
            db.func.count(ReportedCases.id)
        ).filter(
            ReportedCases.ai_case_outcome.isnot(None)
        ).group_by(ReportedCases.ai_case_outcome).all()
        
        # Count by financial impact
        financial_stats = db.query(
            ReportedCases.ai_financial_impact,
            db.func.count(ReportedCases.id)
        ).filter(
            ReportedCases.ai_financial_impact.isnot(None)
        ).group_by(ReportedCases.ai_financial_impact).all()
        
        return {
            "total_cases": total_cases,
            "cases_with_summaries": cases_with_summaries,
            "coverage_percentage": round((cases_with_summaries / total_cases * 100) if total_cases > 0 else 0, 2),
            "outcome_distribution": dict(outcome_stats),
            "financial_impact_distribution": dict(financial_stats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting summary stats: {str(e)}")
