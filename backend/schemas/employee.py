from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class EmploymentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINED = "terminated"
    RESIGNED = "resigned"
    RETIRED = "retired"

class EmployeeType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERN = "intern"
    CONSULTANT = "consultant"

class ProficiencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

# Base Employee Schema
class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    phone_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=10)
    nationality: Optional[str] = Field(None, max_length=100)
    marital_status: Optional[str] = Field(None, max_length=20)
    
    # Professional Information
    professional_title: Optional[str] = Field(None, max_length=200)
    job_title: Optional[str] = Field(None, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=50)
    employee_type: EmployeeType = EmployeeType.FULL_TIME
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    
    # Current Employment
    current_employer_id: Optional[int] = None
    current_employer_type: Optional[str] = Field(None, max_length=20)
    current_employer_name: Optional[str] = Field(None, max_length=200)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    salary: Optional[float] = None
    currency: str = Field("GHS", max_length=3)
    
    # Contact Information
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field("Ghana", max_length=100)
    
    # Professional Profile
    bio: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    awards: Optional[List[Dict[str, Any]]] = None
    
    # Social Media
    linkedin_url: Optional[str] = Field(None, max_length=500)
    twitter_url: Optional[str] = Field(None, max_length=500)
    facebook_url: Optional[str] = Field(None, max_length=500)
    personal_website: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)
    
    # Legal and Compliance
    has_criminal_record: bool = False
    criminal_record_details: Optional[str] = None
    background_check_status: Optional[str] = Field(None, max_length=20)
    background_check_date: Optional[date] = None
    
    # System Fields
    is_verified: bool = False
    is_public: bool = True
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=10)
    nationality: Optional[str] = Field(None, max_length=100)
    marital_status: Optional[str] = Field(None, max_length=20)
    
    professional_title: Optional[str] = Field(None, max_length=200)
    job_title: Optional[str] = Field(None, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=50)
    employee_type: Optional[EmployeeType] = None
    employment_status: Optional[EmploymentStatus] = None
    
    current_employer_id: Optional[int] = None
    current_employer_type: Optional[str] = Field(None, max_length=20)
    current_employer_name: Optional[str] = Field(None, max_length=200)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    salary: Optional[float] = None
    currency: Optional[str] = Field(None, max_length=3)
    
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    
    bio: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    awards: Optional[List[Dict[str, Any]]] = None
    
    linkedin_url: Optional[str] = Field(None, max_length=500)
    twitter_url: Optional[str] = Field(None, max_length=500)
    facebook_url: Optional[str] = Field(None, max_length=500)
    personal_website: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)
    
    has_criminal_record: Optional[bool] = None
    criminal_record_details: Optional[str] = None
    background_check_status: Optional[str] = Field(None, max_length=20)
    background_check_date: Optional[date] = None
    
    is_verified: Optional[bool] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: int
    profile_picture: Optional[str] = None
    cv_file: Optional[str] = None
    cover_letter: Optional[str] = None
    other_documents: Optional[List[Dict[str, Any]]] = None
    legal_cases: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# Employment History Schemas
class EmploymentHistoryBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    company_type: Optional[str] = Field(None, max_length=20)
    job_title: str = Field(..., min_length=1, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    employment_type: Optional[str] = Field(None, max_length=20)
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    salary: Optional[float] = None
    currency: str = Field("GHS", max_length=3)
    supervisor_name: Optional[str] = Field(None, max_length=200)
    supervisor_contact: Optional[str] = Field(None, max_length=100)
    reason_for_leaving: Optional[str] = None

class EmploymentHistoryCreate(EmploymentHistoryBase):
    employee_id: int

class EmploymentHistoryUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    company_type: Optional[str] = Field(None, max_length=20)
    job_title: Optional[str] = Field(None, min_length=1, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    employment_type: Optional[str] = Field(None, max_length=20)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    salary: Optional[float] = None
    currency: Optional[str] = Field(None, max_length=3)
    supervisor_name: Optional[str] = Field(None, max_length=200)
    supervisor_contact: Optional[str] = Field(None, max_length=100)
    reason_for_leaving: Optional[str] = None

class EmploymentHistoryResponse(EmploymentHistoryBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Education History Schemas
class EducationHistoryBase(BaseModel):
    institution_name: str = Field(..., min_length=1, max_length=200)
    degree: Optional[str] = Field(None, max_length=100)
    field_of_study: Optional[str] = Field(None, max_length=100)
    grade: Optional[str] = Field(None, max_length=20)
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    activities: Optional[List[str]] = None
    achievements: Optional[List[str]] = None

class EducationHistoryCreate(EducationHistoryBase):
    employee_id: int

class EducationHistoryUpdate(BaseModel):
    institution_name: Optional[str] = Field(None, min_length=1, max_length=200)
    degree: Optional[str] = Field(None, max_length=100)
    field_of_study: Optional[str] = Field(None, max_length=100)
    grade: Optional[str] = Field(None, max_length=20)
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    activities: Optional[List[str]] = None
    achievements: Optional[List[str]] = None

class EducationHistoryResponse(EducationHistoryBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Legal Case Schemas
class EmployeeLegalCaseBase(BaseModel):
    case_title: str = Field(..., min_length=1, max_length=500)
    case_number: Optional[str] = Field(None, max_length=100)
    case_type: Optional[str] = Field(None, max_length=100)
    case_status: Optional[str] = Field(None, max_length=50)
    role_in_case: Optional[str] = Field(None, max_length=100)
    involvement_description: Optional[str] = None
    case_start_date: Optional[date] = None
    case_end_date: Optional[date] = None
    resolution_date: Optional[date] = None
    outcome: Optional[str] = Field(None, max_length=200)
    outcome_description: Optional[str] = None

class EmployeeLegalCaseCreate(EmployeeLegalCaseBase):
    employee_id: int
    case_id: Optional[int] = None

class EmployeeLegalCaseRequest(EmployeeLegalCaseBase):
    """Schema for creating legal cases via API (without employee_id)"""
    pass

class EmployeeLegalCaseUpdate(BaseModel):
    case_title: Optional[str] = Field(None, min_length=1, max_length=500)
    case_number: Optional[str] = Field(None, max_length=100)
    case_type: Optional[str] = Field(None, max_length=100)
    case_status: Optional[str] = Field(None, max_length=50)
    role_in_case: Optional[str] = Field(None, max_length=100)
    involvement_description: Optional[str] = None
    case_start_date: Optional[date] = None
    case_end_date: Optional[date] = None
    resolution_date: Optional[date] = None
    outcome: Optional[str] = Field(None, max_length=200)
    outcome_description: Optional[str] = None

class EmployeeLegalCaseResponse(EmployeeLegalCaseBase):
    id: int
    employee_id: int
    case_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Skill Schema
class EmployeeSkillBase(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    proficiency_level: ProficiencyLevel
    years_of_experience: Optional[int] = Field(None, ge=0)
    certification: Optional[str] = Field(None, max_length=200)

class EmployeeSkillCreate(EmployeeSkillBase):
    employee_id: int

class EmployeeSkillUpdate(BaseModel):
    skill_name: Optional[str] = Field(None, min_length=1, max_length=100)
    proficiency_level: Optional[ProficiencyLevel] = None
    years_of_experience: Optional[int] = Field(None, ge=0)
    certification: Optional[str] = Field(None, max_length=200)

class EmployeeSkillResponse(EmployeeSkillBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Comprehensive Employee Profile
class EmployeeProfileResponse(EmployeeResponse):
    employment_history: List[EmploymentHistoryResponse] = []
    education_history: List[EducationHistoryResponse] = []
    legal_cases_list: List[EmployeeLegalCaseResponse] = []
    skills_list: List[EmployeeSkillResponse] = []
    
    class Config:
        from_attributes = True

# Search and Filter Schemas
class EmployeeSearchRequest(BaseModel):
    query: Optional[str] = None
    company_id: Optional[int] = None
    company_type: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    employment_status: Optional[EmploymentStatus] = None
    employee_type: Optional[EmployeeType] = None
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)

class EmployeeSearchResponse(BaseModel):
    employees: List[EmployeeResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool
