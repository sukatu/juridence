from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, DECIMAL, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from enum import Enum

class EmploymentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"
    RESIGNED = "resigned"
    RETIRED = "retired"

class EmployeeType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERN = "intern"
    CONSULTANT = "consultant"

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    phone_number = Column(String(20))
    date_of_birth = Column(Date)
    gender = Column(String(10))
    nationality = Column(String(100))
    marital_status = Column(String(20))
    
    # Professional Information
    professional_title = Column(String(200))
    job_title = Column(String(200))
    department = Column(String(100))
    employee_id = Column(String(50), unique=True, index=True)
    employee_type = Column(String(20), default=EmployeeType.FULL_TIME)
    employment_status = Column(String(20), default=EmploymentStatus.ACTIVE)
    
    # Current Employment
    current_employer_id = Column(Integer, ForeignKey("companies.id"))
    current_employer_type = Column(String(20))  # 'bank', 'company', 'insurance'
    current_employer_name = Column(String(200))
    start_date = Column(Date)
    end_date = Column(Date)
    salary = Column(DECIMAL(12, 2))
    currency = Column(String(3), default="GHS")
    
    # Contact Information
    address = Column(Text)
    city = Column(String(100))
    region = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100), default="Ghana")
    
    # Professional Profile
    bio = Column(Text)
    summary = Column(Text)
    skills = Column(JSON)  # Array of skills
    languages = Column(JSON)  # Array of languages with proficiency
    certifications = Column(JSON)  # Array of certifications
    awards = Column(JSON)  # Array of awards and recognitions
    
    # Social Media and Online Presence
    linkedin_url = Column(String(500))
    twitter_url = Column(String(500))
    facebook_url = Column(String(500))
    personal_website = Column(String(500))
    portfolio_url = Column(String(500))
    
    # File Attachments
    profile_picture = Column(String(500))
    cv_file = Column(String(500))
    cover_letter = Column(String(500))
    other_documents = Column(JSON)  # Array of document URLs
    
    # Legal and Compliance
    has_criminal_record = Column(Boolean, default=False)
    criminal_record_details = Column(Text)
    legal_cases = Column(JSON)  # Array of legal case references
    background_check_status = Column(String(20))
    background_check_date = Column(Date)
    
    # System Fields
    is_verified = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    current_employer = relationship("Companies", foreign_keys=[current_employer_id])
    employment_history = relationship("EmploymentHistory", back_populates="employee")
    education_history = relationship("EducationHistory", back_populates="employee")
    legal_cases_list = relationship("EmployeeLegalCase", back_populates="employee")

class EmploymentHistory(Base):
    __tablename__ = "employment_history"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    # Employment Details
    company_name = Column(String(200), nullable=False)
    company_type = Column(String(20))  # 'bank', 'company', 'insurance'
    job_title = Column(String(200), nullable=False)
    department = Column(String(100))
    employment_type = Column(String(20))
    
    # Duration
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_current = Column(Boolean, default=False)
    
    # Job Details
    description = Column(Text)
    responsibilities = Column(JSON)  # Array of responsibilities
    achievements = Column(JSON)  # Array of achievements
    salary = Column(DECIMAL(12, 2))
    currency = Column(String(3), default="GHS")
    
    # References
    supervisor_name = Column(String(200))
    supervisor_contact = Column(String(100))
    reason_for_leaving = Column(Text)
    
    # System Fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("Employee", back_populates="employment_history")

class EducationHistory(Base):
    __tablename__ = "education_history"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    # Education Details
    institution_name = Column(String(200), nullable=False)
    degree = Column(String(100))
    field_of_study = Column(String(100))
    grade = Column(String(20))
    gpa = Column(DECIMAL(3, 2))
    
    # Duration
    start_date = Column(Date)
    end_date = Column(Date)
    is_current = Column(Boolean, default=False)
    
    # Additional Details
    description = Column(Text)
    activities = Column(JSON)  # Array of activities and societies
    achievements = Column(JSON)  # Array of academic achievements
    
    # System Fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("Employee", back_populates="education_history")

class EmployeeLegalCase(Base):
    __tablename__ = "employee_legal_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("reported_cases.id"))
    
    # Case Details
    case_title = Column(String(500), nullable=False)
    case_number = Column(String(100))
    case_type = Column(String(100))
    case_status = Column(String(50))
    
    # Involvement Details
    role_in_case = Column(String(100))  # 'plaintiff', 'defendant', 'witness', 'lawyer', etc.
    involvement_description = Column(Text)
    
    # Dates
    case_start_date = Column(Date)
    case_end_date = Column(Date)
    resolution_date = Column(Date)
    
    # Outcome
    outcome = Column(String(200))
    outcome_description = Column(Text)
    
    # System Fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("Employee", back_populates="legal_cases_list")
    case = relationship("ReportedCases")

class EmployeeSkill(Base):
    __tablename__ = "employee_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(String(20))  # 'beginner', 'intermediate', 'advanced', 'expert'
    years_of_experience = Column(Integer)
    certification = Column(String(200))
    
    # System Fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("Employee")
