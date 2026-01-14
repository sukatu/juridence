"""
Gazette Statistics Routes
Dashboard endpoints for gazette processing statistics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from services.gazette_statistics import GazetteStatistics
import logging

router = APIRouter(prefix="/api/gazette-statistics", tags=["gazette-statistics"])
logger = logging.getLogger(__name__)


@router.get("/overall")
async def get_overall_statistics(db: Session = Depends(get_db)):
    """Get overall gazette processing statistics"""
    try:
        stats_service = GazetteStatistics(db)
        return stats_service.get_overall_statistics()
    except Exception as e:
        logger.error(f"Error getting overall statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-year")
async def get_statistics_by_year(db: Session = Depends(get_db)):
    """Get statistics grouped by year"""
    try:
        stats_service = GazetteStatistics(db)
        return stats_service.get_statistics_by_year()
    except Exception as e:
        logger.error(f"Error getting statistics by year: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gazettes")
async def get_gazette_list(
    year: Optional[int] = Query(None, description="Filter by year"),
    limit: int = Query(100, ge=1, le=1000, description="Limit results"),
    db: Session = Depends(get_db)
):
    """Get list of processed gazettes"""
    try:
        stats_service = GazetteStatistics(db)
        return stats_service.get_gazette_list(year=year, limit=limit)
    except Exception as e:
        logger.error(f"Error getting gazette list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/name-linking")
async def get_name_linking_statistics(db: Session = Depends(get_db)):
    """Get statistics about name linking across gazettes"""
    try:
        stats_service = GazetteStatistics(db)
        return stats_service.get_name_linking_statistics()
    except Exception as e:
        logger.error(f"Error getting name linking statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/complete")
async def get_complete_statistics(db: Session = Depends(get_db)):
    """Get complete statistics for dashboard"""
    try:
        stats_service = GazetteStatistics(db)
        return stats_service.get_complete_statistics()
    except Exception as e:
        logger.error(f"Error getting complete statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

