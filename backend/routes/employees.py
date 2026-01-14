from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
import os
import uuid
from datetime import datetime

from database import get_db
from models.employee import Employee, EmploymentHistory, EducationHistory, EmployeeLegalCase, EmployeeSkill
from models.user import User
from schemas.employee import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeProfileResponse,
    EmploymentHistoryCreate, EmploymentHistoryUpdate, EmploymentHistoryResponse,
    EducationHistoryCreate, EducationHistoryUpdate, EducationHistoryResponse,
    EmployeeLegalCaseCreate, EmployeeLegalCaseUpdate, EmployeeLegalCaseResponse,
    EmployeeLegalCaseRequest,
    EmployeeSkillCreate, EmployeeSkillUpdate, EmployeeSkillResponse,
    EmployeeSearchRequest, EmployeeSearchResponse, EmploymentStatus, EmployeeType
)
from auth import get_current_user
from services.employee_people_sync import sync_employee_to_people, update_people_from_employee, delete_people_when_employee_deleted

router = APIRouter(prefix="/api/employees", tags=["employees"])

# File upload directory
UPLOAD_DIR = "uploads/employees"

def ensure_upload_dir():
    """Ensure upload directory exists"""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file: UploadFile, subfolder: str = "") -> str:
    """Save uploaded file and return the file path"""
    ensure_upload_dir()
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create subfolder path
    folder_path = os.path.join(UPLOAD_DIR, subfolder) if subfolder else UPLOAD_DIR
    os.makedirs(folder_path, exist_ok=True)
    
    file_path = os.path.join(folder_path, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    return file_path

# Employee CRUD Operations
@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create employees"
        )
    
    # Check if employee with email already exists
    existing_employee = db.query(Employee).filter(Employee.email == employee_data.email).first()
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this email already exists"
        )
    
    # Create employee
    employee = Employee(
        **employee_data.dict(),
        created_by=current_user.id,
        updated_by=current_user.id
    )
    
    db.add(employee)
    db.commit()
    db.refresh(employee)
    
    # Sync employee data to people table
    try:
        sync_employee_to_people(employee, db)
    except Exception as e:
        print(f"Warning: Failed to sync employee to people table: {e}")
        # Don't fail the employee creation if people sync fails
    
    return employee

@router.get("/by-employer/{employer_type}/{employer_name}")
async def get_employees_by_employer(
    employer_type: str,
    employer_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employees by employer type and name (e.g., bank, company, insurance)"""
    query = db.query(Employee).filter(
        Employee.current_employer_type == employer_type,
        Employee.current_employer_name.ilike(f"%{employer_name}%")
    )
    
    total = query.count()
    employees = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "employees": employees,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "has_next": page * limit < total,
        "has_prev": page > 1
    }

@router.get("/", response_model=EmployeeSearchResponse)
async def get_employees(
    query: Optional[str] = Query(None, description="Search query"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    company_type: Optional[str] = Query(None, description="Filter by company type"),
    department: Optional[str] = Query(None, description="Filter by department"),
    job_title: Optional[str] = Query(None, description="Filter by job title"),
    skills: Optional[str] = Query(None, description="Comma-separated skills"),
    location: Optional[str] = Query(None, description="Filter by location"),
    employment_status: Optional[EmploymentStatus] = Query(None, description="Filter by employment status"),
    employee_type: Optional[EmployeeType] = Query(None, description="Filter by employee type"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get employees with search and filter options"""
    
    # Build query
    query_obj = db.query(Employee).filter(Employee.is_active == True)
    
    # Apply filters
    if query:
        search_filter = or_(
            func.concat(Employee.first_name, ' ', Employee.last_name).ilike(f"%{query}%"),
            Employee.email.ilike(f"%{query}%"),
            Employee.job_title.ilike(f"%{query}%"),
            Employee.department.ilike(f"%{query}%"),
            Employee.professional_title.ilike(f"%{query}%")
        )
        query_obj = query_obj.filter(search_filter)
    
    if company_id:
        query_obj = query_obj.filter(Employee.current_employer_id == company_id)
    
    if company_type:
        query_obj = query_obj.filter(Employee.current_employer_type == company_type)
    
    if department:
        query_obj = query_obj.filter(Employee.department.ilike(f"%{department}%"))
    
    if job_title:
        query_obj = query_obj.filter(Employee.job_title.ilike(f"%{job_title}%"))
    
    if location:
        query_obj = query_obj.filter(
            or_(
                Employee.city.ilike(f"%{location}%"),
                Employee.region.ilike(f"%{location}%"),
                Employee.country.ilike(f"%{location}%")
            )
        )
    
    if employment_status:
        query_obj = query_obj.filter(Employee.employment_status == employment_status)
    
    if employee_type:
        query_obj = query_obj.filter(Employee.employee_type == employee_type)
    
    if skills:
        skill_list = [skill.strip() for skill in skills.split(",")]
        for skill in skill_list:
            query_obj = query_obj.filter(Employee.skills.contains([skill]))
    
    # Get total count
    total = query_obj.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    employees = query_obj.offset(offset).limit(limit).all()
    
    # Calculate pagination info
    total_pages = (total + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1
    
    return EmployeeSearchResponse(
        employees=employees,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )

@router.get("/{employee_id}", response_model=EmployeeProfileResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """Get employee by ID with full profile"""
    employee = db.query(Employee).filter(
        and_(Employee.id == employee_id, Employee.is_active == True)
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update employees"
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Update fields
    update_data = employee_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    
    employee.updated_by = current_user.id
    employee.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(employee)
    
    # Sync updated employee data to people table
    try:
        update_people_from_employee(employee, db)
    except Exception as e:
        print(f"Warning: Failed to sync employee update to people table: {e}")
        # Don't fail the employee update if people sync fails
    
    return employee

@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete employees"
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Soft delete
    employee.is_active = False
    employee.updated_by = current_user.id
    employee.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Sync employee deletion to people table
    try:
        delete_people_when_employee_deleted(employee, db)
    except Exception as e:
        print(f"Warning: Failed to sync employee deletion to people table: {e}")
        # Don't fail the employee deletion if people sync fails
    
    return {"message": "Employee deleted successfully"}

# Employee Analytics and Statistics
@router.get("/analytics/overview")
async def get_employee_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee analytics overview (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view analytics"
        )
    
    # Total employees
    total_employees = db.query(Employee).count()
    
    # Active employees
    active_employees = db.query(Employee).filter(Employee.is_active == True).count()
    
    # Employees by status
    status_counts = db.query(
        Employee.employment_status,
        func.count(Employee.id).label('count')
    ).group_by(Employee.employment_status).all()
    
    # Employees by type
    type_counts = db.query(
        Employee.employee_type,
        func.count(Employee.id).label('count')
    ).group_by(Employee.employee_type).all()
    
    # Employees by employer type
    employer_type_counts = db.query(
        Employee.current_employer_type,
        func.count(Employee.id).label('count')
    ).filter(Employee.current_employer_type.isnot(None)).group_by(Employee.current_employer_type).all()
    
    # Top employers
    top_employers = db.query(
        Employee.current_employer_name,
        func.count(Employee.id).label('count')
    ).filter(Employee.current_employer_name.isnot(None)).group_by(Employee.current_employer_name).order_by(func.count(Employee.id).desc()).limit(10).all()
    
    # Recent hires (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_hires = db.query(Employee).filter(Employee.created_at >= thirty_days_ago).count()
    
    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": total_employees - active_employees,
        "recent_hires": recent_hires,
        "status_breakdown": {status: count for status, count in status_counts},
        "type_breakdown": {emp_type: count for emp_type, count in type_counts},
        "employer_type_breakdown": {emp_type: count for emp_type, count in employer_type_counts},
        "top_employers": [{"name": name, "count": count} for name, count in top_employers]
    }

@router.get("/analytics/employer/{employer_type}/{employer_name}")
async def get_employer_employee_analytics(
    employer_type: str,
    employer_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee analytics for specific employer (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view analytics"
        )
    
    # Get employees for this employer
    employees = db.query(Employee).filter(
        Employee.current_employer_type == employer_type,
        Employee.current_employer_name.ilike(f"%{employer_name}%")
    ).all()
    
    total_employees = len(employees)
    active_employees = len([emp for emp in employees if emp.is_active])
    
    # Department breakdown
    departments = {}
    for emp in employees:
        dept = emp.department or "No Department"
        departments[dept] = departments.get(dept, 0) + 1
    
    # Status breakdown
    statuses = {}
    for emp in employees:
        status = emp.employment_status or "Unknown"
        statuses[status] = statuses.get(status, 0) + 1
    
    # Type breakdown
    types = {}
    for emp in employees:
        emp_type = emp.employee_type or "Unknown"
        types[emp_type] = types.get(emp_type, 0) + 1
    
    return {
        "employer_name": employer_name,
        "employer_type": employer_type,
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": total_employees - active_employees,
        "department_breakdown": departments,
        "status_breakdown": statuses,
        "type_breakdown": types
    }

# File Upload Endpoints
@router.post("/{employee_id}/upload-profile-picture")
async def upload_profile_picture(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload profile picture for employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can upload files"
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Save file
    file_path = save_uploaded_file(file, "profile_pictures")
    
    # Update employee record
    employee.profile_picture = file_path
    employee.updated_by = current_user.id
    employee.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Profile picture uploaded successfully", "file_path": file_path}

@router.post("/{employee_id}/upload-cv")
async def upload_cv(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload CV for employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can upload files"
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Validate file type
    allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF or Word document"
        )
    
    # Save file
    file_path = save_uploaded_file(file, "cvs")
    
    # Update employee record
    employee.cv_file = file_path
    employee.updated_by = current_user.id
    employee.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "CV uploaded successfully", "file_path": file_path}

# Employment History Endpoints
@router.post("/{employee_id}/employment-history", response_model=EmploymentHistoryResponse)
async def create_employment_history(
    employee_id: int,
    employment_data: EmploymentHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add employment history for employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can add employment history"
        )
    
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    employment = EmploymentHistory(**employment_data.dict())
    db.add(employment)
    db.commit()
    db.refresh(employment)
    
    return employment

@router.get("/{employee_id}/employment-history", response_model=List[EmploymentHistoryResponse])
async def get_employment_history(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """Get employment history for employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return employee.employment_history

# Education History Endpoints
@router.post("/{employee_id}/education-history", response_model=EducationHistoryResponse)
async def create_education_history(
    employee_id: int,
    education_data: EducationHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add education history for employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can add education history"
        )
    
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    education = EducationHistory(**education_data.dict())
    db.add(education)
    db.commit()
    db.refresh(education)
    
    return education

@router.get("/{employee_id}/education-history", response_model=List[EducationHistoryResponse])
async def get_education_history(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """Get education history for employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return employee.education_history

# Legal Cases Endpoints
@router.post("/{employee_id}/legal-cases", response_model=EmployeeLegalCaseResponse)
async def create_legal_case(
    employee_id: int,
    legal_case_data: EmployeeLegalCaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add legal case for employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can add legal cases"
        )
    
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    legal_case = EmployeeLegalCase(
        employee_id=employee_id,
        **legal_case_data.dict()
    )
    db.add(legal_case)
    db.commit()
    db.refresh(legal_case)
    
    return legal_case

@router.get("/{employee_id}/legal-cases", response_model=List[EmployeeLegalCaseResponse])
async def get_legal_cases(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """Get legal cases for employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return employee.legal_cases_list

# Skills Endpoints
@router.post("/{employee_id}/skills", response_model=EmployeeSkillResponse)
async def create_skill(
    employee_id: int,
    skill_data: EmployeeSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add skill for employee (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can add skills"
        )
    
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    skill = EmployeeSkill(**skill_data.dict())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

@router.get("/{employee_id}/skills", response_model=List[EmployeeSkillResponse])
async def get_skills(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """Get skills for employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()

# Company-specific employee endpoints
@router.get("/company/{company_id}", response_model=List[EmployeeResponse])
async def get_company_employees(
    company_id: int,
    company_type: Optional[str] = Query(None, description="Company type (bank, company, insurance)"),
    db: Session = Depends(get_db)
):
    """Get employees for a specific company"""
    query = db.query(Employee).filter(
        and_(
            Employee.current_employer_id == company_id,
            Employee.is_active == True
        )
    )
    
    if company_type:
        query = query.filter(Employee.current_employer_type == company_type)
    
    employees = query.all()
    return employees

@router.get("/company/{company_id}/current", response_model=List[EmployeeResponse])
async def get_current_company_employees(
    company_id: int,
    company_type: Optional[str] = Query(None, description="Company type (bank, company, insurance)"),
    db: Session = Depends(get_db)
):
    """Get current employees for a specific company"""
    query = db.query(Employee).filter(
        and_(
            Employee.current_employer_id == company_id,
            Employee.employment_status == EmploymentStatus.ACTIVE,
            Employee.is_active == True
        )
    )
    
    if company_type:
        query = query.filter(Employee.current_employer_type == company_type)
    
    employees = query.all()
    return employees

@router.get("/company/{company_id}/former", response_model=List[EmployeeResponse])
async def get_former_company_employees(
    company_id: int,
    company_type: Optional[str] = Query(None, description="Company type (bank, company, insurance)"),
    db: Session = Depends(get_db)
):
    """Get former employees for a specific company"""
    query = db.query(Employee).filter(
        and_(
            Employee.current_employer_id == company_id,
            Employee.employment_status != EmploymentStatus.ACTIVE,
            Employee.is_active == True
        )
    )
    
    if company_type:
        query = query.filter(Employee.current_employer_type == company_type)
    
    employees = query.all()
    return employees


# Legal Cases Management - using the existing route above

@router.get("/{employee_id}/legal-cases")
async def get_employee_legal_cases(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all legal cases for an employee"""
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    legal_cases = db.query(EmployeeLegalCase).filter(
        EmployeeLegalCase.employee_id == employee_id
    ).all()
    
    return legal_cases

@router.put("/{employee_id}/legal-cases/{case_id}")
async def update_legal_case(
    employee_id: int,
    case_id: int,
    legal_case: EmployeeLegalCaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a legal case"""
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if legal case exists
    db_legal_case = db.query(EmployeeLegalCase).filter(
        EmployeeLegalCase.id == case_id,
        EmployeeLegalCase.employee_id == employee_id
    ).first()
    
    if not db_legal_case:
        raise HTTPException(status_code=404, detail="Legal case not found")
    
    # Update legal case
    update_data = legal_case.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_legal_case, field, value)
    
    db_legal_case.updated_by = current_user.id
    db_legal_case.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_legal_case)
    
    return db_legal_case

@router.delete("/{employee_id}/legal-cases/{case_id}")
async def delete_legal_case(
    employee_id: int,
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a legal case"""
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if legal case exists
    db_legal_case = db.query(EmployeeLegalCase).filter(
        EmployeeLegalCase.id == case_id,
        EmployeeLegalCase.employee_id == employee_id
    ).first()
    
    if not db_legal_case:
        raise HTTPException(status_code=404, detail="Legal case not found")
    
    db.delete(db_legal_case)
    db.commit()
    
    return {"message": "Legal case deleted successfully"}

@router.get("/{employee_id}/legal-cases/summary")
async def get_legal_cases_summary(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get legal cases summary for an employee"""
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get legal cases statistics
    total_cases = db.query(EmployeeLegalCase).filter(
        EmployeeLegalCase.employee_id == employee_id
    ).count()
    
    active_cases = db.query(EmployeeLegalCase).filter(
        EmployeeLegalCase.employee_id == employee_id,
        EmployeeLegalCase.case_status == "active"
    ).count()
    
    closed_cases = db.query(EmployeeLegalCase).filter(
        EmployeeLegalCase.employee_id == employee_id,
        EmployeeLegalCase.case_status == "closed"
    ).count()
    
    # Get cases by type
    cases_by_type = db.query(
        EmployeeLegalCase.case_type,
        func.count(EmployeeLegalCase.id).label('count')
    ).filter(
        EmployeeLegalCase.employee_id == employee_id
    ).group_by(EmployeeLegalCase.case_type).all()
    
    # Get cases by status
    cases_by_status = db.query(
        EmployeeLegalCase.case_status,
        func.count(EmployeeLegalCase.id).label('count')
    ).filter(
        EmployeeLegalCase.employee_id == employee_id
    ).group_by(EmployeeLegalCase.case_status).all()
    
    return {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "closed_cases": closed_cases,
        "cases_by_type": [{"type": case_type, "count": count} for case_type, count in cases_by_type],
        "cases_by_status": [{"status": status, "count": count} for status, count in cases_by_status]
    }
