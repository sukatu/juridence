from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from services.pdf_gazette_analyzer import PDFGazetteAnalyzer
import logging
import time
import os
from typing import Optional

# Optional import for BatchPDFProcessor
try:
    from batch_pdf_processor import BatchPDFProcessor
    BATCH_PROCESSOR_AVAILABLE = True
except ImportError:
    BATCH_PROCESSOR_AVAILABLE = False
    BatchPDFProcessor = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Global variable to track processing status
processing_status = {
    "is_processing": False,
    "current_file": None,
    "files_processed": 0,
    "total_files": 0,
    "entries_extracted": 0,
    "entries_saved": 0,
    "errors": [],
    "start_time": None,
    "end_time": None
}

def update_processing_status(**kwargs):
    """Update the global processing status"""
    global processing_status
    processing_status.update(kwargs)

@router.post("/start-processing")
async def start_pdf_processing(
    max_files: Optional[int] = None,
    year: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """Start processing PDF gazette files"""
    global processing_status
    
    if processing_status["is_processing"]:
        raise HTTPException(status_code=400, detail="Processing is already in progress")
    
    # Reset status
    update_processing_status(
        is_processing=True,
        current_file=None,
        files_processed=0,
        total_files=0,
        entries_extracted=0,
        entries_saved=0,
        errors=[],
        start_time=None,
        end_time=None
    )
    
    # Start background processing
    if background_tasks:
        background_tasks.add_task(process_pdfs_background, max_files, year)
        return {"message": "PDF processing started in background", "status": "started"}
    else:
        # Process synchronously (for testing)
        return await process_pdfs_sync(max_files, year)

async def process_pdfs_sync(max_files: Optional[int] = None, year: Optional[str] = None):
    """Process PDFs synchronously"""
    if not BATCH_PROCESSOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="Batch PDF processor not available")
    try:
        processor = BatchPDFProcessor("uploads/gazettes")
        
        if year:
            result = processor.process_by_year(year)
        else:
            result = processor.process_all_pdfs(max_files)
        
        processor.close()
        return result
        
    except Exception as e:
        logger.error(f"Error in sync processing: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

def process_pdfs_background(max_files: Optional[int] = None, year: Optional[str] = None):
    """Process PDFs in background"""
    global processing_status
    
    if not BATCH_PROCESSOR_AVAILABLE:
        update_processing_status(
            is_processing=False,
            errors=["Batch PDF processor not available"],
            end_time=time.time()
        )
        return
    
    try:
        update_processing_status(start_time=time.time())
        
        processor = BatchPDFProcessor("uploads/gazettes")
        
        # Find files to process
        if year:
            pdf_files = []
            year_dir = f"uploads/gazettes/{year}"
            if os.path.exists(year_dir):
                for root, dirs, files in os.walk(year_dir):
                    for file in files:
                        if file.lower().endswith('.pdf'):
                            pdf_files.append(os.path.join(root, file))
        else:
            pdf_files = processor.find_pdf_files()
        
        if max_files:
            pdf_files = pdf_files[:max_files]
        
        update_processing_status(total_files=len(pdf_files))
        
        # Process each file
        analyzer = PDFGazetteAnalyzer()
        successful_files = 0
        total_entries = 0
        saved_entries = 0
        errors = []
        
        for i, pdf_file in enumerate(pdf_files, 1):
            try:
                update_processing_status(
                    current_file=os.path.basename(pdf_file),
                    files_processed=i-1
                )
                
                result = analyzer.process_pdf_file(pdf_file)
                
                if result['success']:
                    successful_files += 1
                    total_entries += result['entries_processed']
                    saved_entries += result['entries_saved']
                else:
                    errors.append(f"{os.path.basename(pdf_file)}: {result['message']}")
                
                # Update progress
                update_processing_status(
                    entries_extracted=total_entries,
                    entries_saved=saved_entries,
                    errors=errors[-10:]  # Keep only last 10 errors
                )
                
            except Exception as e:
                error_msg = f"{os.path.basename(pdf_file)}: {str(e)}"
                errors.append(error_msg)
                logger.error(f"Error processing {pdf_file}: {e}")
        
        # Final status update
        update_processing_status(
            is_processing=False,
            files_processed=len(pdf_files),
            entries_extracted=total_entries,
            entries_saved=saved_entries,
            errors=errors,
            end_time=time.time()
        )
        
        analyzer.close()
        processor.close()
        
        logger.info(f"Background processing completed: {successful_files}/{len(pdf_files)} files successful")
        
    except Exception as e:
        logger.error(f"Error in background processing: {e}")
        update_processing_status(
            is_processing=False,
            errors=errors + [f"System error: {str(e)}"],
            end_time=time.time()
        )

@router.get("/status")
async def get_processing_status():
    """Get current processing status"""
    global processing_status
    
    if processing_status["is_processing"] and processing_status["start_time"]:
        elapsed_time = time.time() - processing_status["start_time"]
    else:
        elapsed_time = 0
    
    return {
        **processing_status,
        "elapsed_time": round(elapsed_time, 2)
    }

@router.post("/stop-processing")
async def stop_processing():
    """Stop the current processing"""
    global processing_status
    
    if not processing_status["is_processing"]:
        raise HTTPException(status_code=400, detail="No processing in progress")
    
    update_processing_status(
        is_processing=False,
        end_time=time.time()
    )
    
    return {"message": "Processing stopped", "status": "stopped"}

@router.get("/test-single-pdf")
async def test_single_pdf(file_path: str):
    """Test processing on a single PDF file"""
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        analyzer = PDFGazetteAnalyzer()
        result = analyzer.process_pdf_file(file_path)
        analyzer.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Error testing single PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@router.get("/gazette-stats")
async def get_gazette_stats(db: Session = Depends(get_db)):
    """Get gazette statistics from database"""
    try:
        from models.gazette import Gazette
        from models.people import People
        
        # Count gazette entries by type
        gazette_counts = db.query(Gazette.gazette_type, db.func.count(Gazette.id)).group_by(Gazette.gazette_type).all()
        
        # Count total people
        total_people = db.query(People).count()
        
        # Count total gazette entries
        total_gazettes = db.query(Gazette).count()
        
        # Recent entries (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_entries = db.query(Gazette).filter(Gazette.created_at >= thirty_days_ago).count()
        
        return {
            "total_gazette_entries": total_gazettes,
            "total_people": total_people,
            "recent_entries_30_days": recent_entries,
            "gazette_types": {gazette_type: count for gazette_type, count in gazette_counts},
            "processing_status": processing_status
        }
        
    except Exception as e:
        logger.error(f"Error getting gazette stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
