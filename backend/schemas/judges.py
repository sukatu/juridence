from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class JudgeStatus(str, Enum):
    active = "active"
    retired = "retired"
    deceased = "deceased"
    suspended = "suspended"
    special_prosecutor = "special_prosecutor"

class JudgeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the judge")
    title: Optional[str] = Field(None, max_length=100, description="Title of the judge")
    gender: Optional[str] = Field(None, max_length=20, description="Gender of the judge")
    court_type: Optional[str] = Field(None, max_length=50, description="Type of court")
    court_division: Optional[str] = Field(None, max_length=100, description="Court division")
    region: Optional[str] = Field(None, max_length=50, description="Region or jurisdiction")
    status: JudgeStatus = Field(default=JudgeStatus.active, description="Current status of the judge")
    bio: Optional[str] = Field(None, description="Brief biography or background")
    
    # New comprehensive fields
    date_of_birth: Optional[date] = Field(None, description="Date of birth")
    date_of_call_to_bar: Optional[date] = Field(None, description="Date of call to the bar")
    schools_attended: Optional[List[Dict[str, Any]]] = Field(None, description="Schools attended")
    date_appointment_high_court: Optional[date] = Field(None, description="Date of appointment to High Court")
    date_appointment_court_appeal: Optional[date] = Field(None, description="Date of appointment to Court of Appeal")
    date_appointment_supreme_court: Optional[date] = Field(None, description="Date of appointment to Supreme Court")
    
    cases_as_lawyer_high_court: Optional[List[Dict[str, Any]]] = Field(None, description="Cases conducted at High Court as lawyer")
    cases_as_lawyer_court_appeal: Optional[List[Dict[str, Any]]] = Field(None, description="Cases conducted at Court of Appeal as lawyer")
    cases_as_lawyer_supreme_court: Optional[List[Dict[str, Any]]] = Field(None, description="Cases conducted at Supreme Court as lawyer")
    
    judgments_high_court: Optional[List[Dict[str, Any]]] = Field(None, description="Judgments delivered at High Court")
    judgments_court_appeal: Optional[List[Dict[str, Any]]] = Field(None, description="Judgments delivered at Court of Appeal")
    judgments_supreme_court: Optional[List[Dict[str, Any]]] = Field(None, description="Judgments delivered at Supreme Court")
    
    articles_written: Optional[List[Dict[str, Any]]] = Field(None, description="Articles written")
    books_written: Optional[List[Dict[str, Any]]] = Field(None, description="Books written")
    
    appointment_date: Optional[datetime] = Field(None, description="Date of appointment")
    retirement_date: Optional[datetime] = Field(None, description="Date of retirement")
    contact_info: Optional[str] = Field(None, description="Contact information")
    specializations: Optional[str] = Field(None, description="Areas of law expertise")

class JudgeCreate(JudgeBase):
    pass

class JudgeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, max_length=20)
    court_type: Optional[str] = Field(None, max_length=50)
    court_division: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=50)
    status: Optional[JudgeStatus] = None
    bio: Optional[str] = None
    date_of_birth: Optional[date] = None
    date_of_call_to_bar: Optional[date] = None
    schools_attended: Optional[List[Dict[str, Any]]] = None
    date_appointment_high_court: Optional[date] = None
    date_appointment_court_appeal: Optional[date] = None
    date_appointment_supreme_court: Optional[date] = None
    cases_as_lawyer_high_court: Optional[List[Dict[str, Any]]] = None
    cases_as_lawyer_court_appeal: Optional[List[Dict[str, Any]]] = None
    cases_as_lawyer_supreme_court: Optional[List[Dict[str, Any]]] = None
    judgments_high_court: Optional[List[Dict[str, Any]]] = None
    judgments_court_appeal: Optional[List[Dict[str, Any]]] = None
    judgments_supreme_court: Optional[List[Dict[str, Any]]] = None
    articles_written: Optional[List[Dict[str, Any]]] = None
    books_written: Optional[List[Dict[str, Any]]] = None
    appointment_date: Optional[datetime] = None
    retirement_date: Optional[datetime] = None
    contact_info: Optional[str] = None
    specializations: Optional[str] = None
    is_active: Optional[bool] = None

class JudgeResponse(JudgeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    updated_by: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

class JudgeListResponse(BaseModel):
    judges: List[JudgeResponse]
    total: int
    page: int
    limit: int
    total_pages: int
