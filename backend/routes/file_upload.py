from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import uuid
from datetime import datetime
from typing import List
import aiofiles

router = APIRouter()

# Ensure uploads directory exists
UPLOAD_DIR = "uploads/cvs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file types for CV uploads
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt'}

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower()

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

@router.post("/upload-cv")
async def upload_cv(
    file: UploadFile = File(...),
    employee_id: int = None
):
    """
    Upload a CV file for an employee
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size (10MB limit)
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
        
        # Generate unique filename
        file_extension = get_file_extension(file.filename)
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Return file information
        file_info = {
            "filename": file.filename,
            "saved_filename": unique_filename,
            "file_path": file_path,
            "file_size": file_size,
            "file_type": file_extension,
            "upload_date": datetime.utcnow().isoformat(),
            "employee_id": employee_id
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "File uploaded successfully",
                "file_info": file_info
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/download-cv/{filename}")
async def download_cv(filename: str):
    """
    Download a CV file
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        from fastapi.responses import FileResponse
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")

@router.delete("/delete-cv/{filename}")
async def delete_cv(filename: str):
    """
    Delete a CV file
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        os.remove(file_path)
        
        return JSONResponse(
            status_code=200,
            content={"message": "File deleted successfully"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

@router.get("/list-cvs")
async def list_cvs(employee_id: int = None):
    """
    List CV files, optionally filtered by employee_id
    """
    try:
        files = []
        
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                if is_allowed_file(filename):
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    file_stat = os.stat(file_path)
                    
                    file_info = {
                        "filename": filename,
                        "file_size": file_stat.st_size,
                        "upload_date": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                        "file_type": get_file_extension(filename)
                    }
                    
                    files.append(file_info)
        
        return JSONResponse(
            status_code=200,
            content={
                "files": files,
                "total_count": len(files)
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")
