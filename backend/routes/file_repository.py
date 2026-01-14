from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path

from database import get_db
from models.user import User
from auth import get_current_user

router = APIRouter(prefix="/api/files", tags=["file-repository"])

# Base upload directory
BASE_UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', 
    '.mp4', '.avi', '.mov', '.zip', '.rar', '.xlsx', '.xls', '.ppt', '.pptx'
}

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower()

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def get_file_type(extension: str) -> str:
    """Get file type category based on extension"""
    if extension in ['.jpg', '.jpeg', '.png', '.gif']:
        return 'image'
    elif extension in ['.pdf', '.doc', '.docx', '.txt']:
        return 'document'
    elif extension in ['.mp4', '.avi', '.mov']:
        return 'video'
    elif extension in ['.zip', '.rar']:
        return 'archive'
    elif extension in ['.xlsx', '.xls', '.ppt', '.pptx']:
        return 'office'
    else:
        return 'other'

def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB"""
    try:
        size_bytes = os.path.getsize(file_path)
        return round(size_bytes / (1024 * 1024), 2)
    except:
        return 0.0

def ensure_directory(path: str):
    """Ensure directory exists"""
    os.makedirs(path, exist_ok=True)

@router.get("/repository")
async def get_file_repository(
    path: str = Query("", description="Directory path to browse"),
    file_type: Optional[str] = Query(None, description="Filter by file type"),
    search: Optional[str] = Query(None, description="Search files by name"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get file repository contents with pagination and filtering"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access file repository"
        )
    
    # Build full path
    full_path = os.path.join(BASE_UPLOAD_DIR, path) if path else BASE_UPLOAD_DIR
    
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Directory not found"
        )
    
    # Get all items in directory
    items = []
    try:
        for item_name in os.listdir(full_path):
            item_path = os.path.join(full_path, item_name)
            
            # Skip hidden files
            if item_name.startswith('.'):
                continue
            
            is_directory = os.path.isdir(item_path)
            file_info = {
                "name": item_name,
                "path": os.path.join(path, item_name) if path else item_name,
                "is_directory": is_directory,
                "size": 0,
                "file_type": "folder" if is_directory else get_file_type(get_file_extension(item_name)),
                "extension": "" if is_directory else get_file_extension(item_name),
                "created_at": datetime.fromtimestamp(os.path.getctime(item_path)).isoformat(),
                "modified_at": datetime.fromtimestamp(os.path.getmtime(item_path)).isoformat(),
            }
            
            if not is_directory:
                file_info["size"] = get_file_size_mb(item_path)
            
            items.append(file_info)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading directory: {str(e)}"
        )
    
    # Apply filters
    if file_type and file_type != "all":
        items = [item for item in items if item["file_type"] == file_type]
    
    if search:
        items = [item for item in items if search.lower() in item["name"].lower()]
    
    # Sort items (directories first, then files)
    items.sort(key=lambda x: (not x["is_directory"], x["name"].lower()))
    
    # Apply pagination
    total_items = len(items)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_items = items[start_index:end_index]
    
    # Calculate pagination info
    total_pages = (total_items + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1
    
    # Get directory statistics
    total_files = len([item for item in items if not item["is_directory"]])
    total_folders = len([item for item in items if item["is_directory"]])
    total_size = sum(item["size"] for item in items if not item["is_directory"])
    
    return {
        "items": paginated_items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_items,
            "totalPages": total_pages,
            "has_next": has_next,
            "has_prev": has_prev
        },
        "statistics": {
            "totalFiles": total_files,
            "totalFolders": total_folders,
            "totalSize": round(total_size, 2)
        },
        "current_path": path,
        "parent_path": os.path.dirname(path) if path else None
    }

@router.post("/repository/upload")
async def upload_file_to_repository(
    file: UploadFile = File(...),
    folder_path: str = Query("", description="Target folder path"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload file to repository"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can upload files"
        )
    
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (100MB limit)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 100 * 1024 * 1024:  # 100MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 100MB"
        )
    
    # Build target path
    target_dir = os.path.join(BASE_UPLOAD_DIR, folder_path) if folder_path else BASE_UPLOAD_DIR
    ensure_directory(target_dir)
    
    # Generate unique filename
    file_extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(target_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Get file info
    file_info = {
        "filename": file.filename,
        "saved_filename": unique_filename,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": get_file_type(file_extension),
        "extension": file_extension,
        "upload_date": datetime.utcnow().isoformat(),
        "uploaded_by": current_user.username
    }
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "File uploaded successfully",
            "file_info": file_info
        }
    )

@router.post("/repository/create-folder")
async def create_folder(
    folder_name: str = Query(..., description="Folder name"),
    parent_path: str = Query("", description="Parent folder path"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new folder in repository"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create folders"
        )
    
    # Validate folder name
    if not folder_name or '/' in folder_name or '\\' in folder_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid folder name"
        )
    
    # Build target path
    target_dir = os.path.join(BASE_UPLOAD_DIR, parent_path, folder_name) if parent_path else os.path.join(BASE_UPLOAD_DIR, folder_name)
    
    if os.path.exists(target_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder already exists"
        )
    
    try:
        os.makedirs(target_dir, exist_ok=True)
        return JSONResponse(
            status_code=200,
            content={
                "message": "Folder created successfully",
                "folder_path": os.path.join(parent_path, folder_name) if parent_path else folder_name
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating folder: {str(e)}"
        )

@router.get("/repository/download/{file_path:path}")
async def download_file(
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download file from repository"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can download files"
        )
    
    full_path = os.path.join(BASE_UPLOAD_DIR, file_path)
    
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if os.path.isdir(full_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot download directory"
        )
    
    # Determine media type based on file extension
    file_extension = get_file_extension(file_path)
    media_type = 'application/octet-stream'  # default
    
    if file_extension == '.pdf':
        media_type = 'application/pdf'
    elif file_extension in ['.jpg', '.jpeg']:
        media_type = 'image/jpeg'
    elif file_extension == '.png':
        media_type = 'image/png'
    elif file_extension == '.gif':
        media_type = 'image/gif'
    elif file_extension == '.txt':
        media_type = 'text/plain'
    elif file_extension in ['.doc', '.docx']:
        media_type = 'application/msword'
    
    return FileResponse(
        path=full_path,
        filename=os.path.basename(file_path),
        media_type=media_type
    )

@router.get("/repository/preview/{file_path:path}")
async def preview_file(
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview file in browser (for iframe embedding)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can preview files"
        )
    
    full_path = os.path.join(BASE_UPLOAD_DIR, file_path)
    
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if os.path.isdir(full_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot preview directory"
        )
    
    # Determine media type based on file extension
    file_extension = get_file_extension(file_path)
    media_type = 'application/octet-stream'  # default
    
    if file_extension == '.pdf':
        media_type = 'application/pdf'
    elif file_extension in ['.jpg', '.jpeg']:
        media_type = 'image/jpeg'
    elif file_extension == '.png':
        media_type = 'image/png'
    elif file_extension == '.gif':
        media_type = 'image/gif'
    elif file_extension == '.txt':
        media_type = 'text/plain'
    elif file_extension in ['.doc', '.docx']:
        media_type = 'application/msword'
    
    # Create response with proper headers for iframe embedding
    response = FileResponse(
        path=full_path,
        media_type=media_type,
        headers={
            "Content-Disposition": "inline",  # Display inline instead of download
            "X-Frame-Options": "ALLOWALL",  # Allow iframe embedding from any origin
            "Content-Security-Policy": "frame-ancestors 'self' https://juridence.net https://www.juridence.net",
            "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
        }
    )
    
    return response

@router.get("/repository/pdf-viewer")
async def pdf_viewer(
    url: str = Query(..., description="PDF URL to display"),
    filename: str = Query("Document.pdf", description="PDF filename")
):
    """Serve PDF viewer page for iframe embedding"""
    try:
        with open("static/pdf_viewer.html", "r") as f:
            html_content = f.read()
        
        # Replace placeholders with actual values
        html_content = html_content.replace('{{PDF_URL}}', url)
        html_content = html_content.replace('{{FILENAME}}', filename)
        
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF viewer template not found"
        )

@router.get("/repository/public-preview/{file_path:path}")
async def public_preview_file(file_path: str):
    """Public preview file endpoint (no authentication required for iframe embedding)"""
    full_path = os.path.join(BASE_UPLOAD_DIR, file_path)
    
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if os.path.isdir(full_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot preview directory"
        )
    
    # Determine media type based on file extension
    file_extension = get_file_extension(file_path)
    media_type = 'application/octet-stream'  # default
    
    if file_extension == '.pdf':
        media_type = 'application/pdf'
    elif file_extension in ['.jpg', '.jpeg']:
        media_type = 'image/jpeg'
    elif file_extension == '.png':
        media_type = 'image/png'
    elif file_extension == '.gif':
        media_type = 'image/gif'
    elif file_extension == '.txt':
        media_type = 'text/plain'
    elif file_extension in ['.doc', '.docx']:
        media_type = 'application/msword'
    
    # Create response with proper headers for iframe embedding
    response = FileResponse(
        path=full_path,
        media_type=media_type,
        headers={
            "Content-Disposition": "inline",  # Display inline instead of download
            "X-Frame-Options": "ALLOWALL",  # Allow iframe embedding from any origin
            "Content-Security-Policy": "frame-ancestors 'self' https://juridence.net https://www.juridence.net",
            "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
        }
    )
    
    return response

@router.delete("/repository/delete/{file_path:path}")
async def delete_file_or_folder(
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete file or folder from repository"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete files"
        )
    
    full_path = os.path.join(BASE_UPLOAD_DIR, file_path)
    
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File or folder not found"
        )
    
    try:
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
            message = "Folder deleted successfully"
        else:
            os.remove(full_path)
            message = "File deleted successfully"
        
        return JSONResponse(
            status_code=200,
            content={"message": message}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting: {str(e)}"
        )

@router.get("/repository/stats")
async def get_repository_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get repository statistics"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view statistics"
        )
    
    def get_directory_stats(path: str) -> Dict[str, Any]:
        total_files = 0
        total_folders = 0
        total_size = 0
        file_types = {}
        
        try:
            for root, dirs, files in os.walk(path):
                total_folders += len(dirs)
                for file in files:
                    if not file.startswith('.'):
                        total_files += 1
                        file_path = os.path.join(root, file)
                        file_size = os.path.getsize(file_path)
                        total_size += file_size
                        
                        ext = get_file_extension(file)
                        file_type = get_file_type(ext)
                        file_types[file_type] = file_types.get(file_type, 0) + 1
        except Exception:
            pass
        
        return {
            "total_files": total_files,
            "total_folders": total_folders,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "file_types": file_types
        }
    
    stats = get_directory_stats(BASE_UPLOAD_DIR)
    
    return {
        "repository_stats": stats,
        "base_path": BASE_UPLOAD_DIR,
        "allowed_extensions": list(ALLOWED_EXTENSIONS)
    }
