from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union
from datetime import date, time, datetime

class CauseListBase(BaseModel):
    case_type: Optional[str] = Field(None, max_length=50)
    suit_no: Optional[str] = Field(None, max_length=100)
    case_title: Optional[str] = None
    hearing_date: date = Field(..., description="Date of hearing")
    hearing_time: Optional[time] = Field(None, description="Time of hearing")
    judge_id: Optional[int] = None
    judge_name: Optional[str] = Field(None, max_length=255)
    first_party_title: Optional[str] = Field(None, max_length=50)
    first_party_name: Optional[str] = Field(None, max_length=255)
    second_party_title: Optional[str] = Field(None, max_length=50)
    second_party_name: Optional[str] = Field(None, max_length=255)
    first_party_counsel_title: Optional[str] = Field(None, max_length=50)
    first_party_counsel_name: Optional[str] = Field(None, max_length=255)
    first_party_counsel_contact: Optional[str] = Field(None, max_length=100)
    second_party_counsel_title: Optional[str] = Field(None, max_length=50)
    second_party_counsel_name: Optional[str] = Field(None, max_length=255)
    second_party_counsel_contact: Optional[str] = Field(None, max_length=100)
    remarks: Optional[str] = None
    status: Optional[str] = Field("Active", max_length=50)
    registry_id: Optional[int] = None
    court_id: Optional[int] = None
    court_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    venue: Optional[str] = Field(None, max_length=255)
    case_id: Optional[int] = None

class CauseListCreate(CauseListBase):
    pass

class CauseListUpdate(BaseModel):
    case_type: Optional[str] = Field(None, max_length=50)
    suit_no: Optional[str] = Field(None, max_length=100)
    case_title: Optional[str] = None
    hearing_date: Optional[date] = None
    hearing_time: Optional[Union[time, str]] = None  # Accept both time object and string
    
    @field_validator('hearing_time', mode='before')
    @classmethod
    def parse_time(cls, v):
        """Parse time string to time object if needed"""
        if v is None:
            return None
        if isinstance(v, time):
            return v
        if isinstance(v, str):
            # Handle "HH:MM" or "HH:MM:SS" format
            try:
                parts = v.split(':')
                hours = int(parts[0])
                minutes = int(parts[1]) if len(parts) > 1 else 0
                seconds = int(parts[2]) if len(parts) > 2 else 0
                return time(hours, minutes, seconds)
            except (ValueError, IndexError):
                return None
        return v
    judge_id: Optional[int] = None
    judge_name: Optional[str] = Field(None, max_length=255)
    first_party_title: Optional[str] = Field(None, max_length=50)
    first_party_name: Optional[str] = Field(None, max_length=255)
    second_party_title: Optional[str] = Field(None, max_length=50)
    second_party_name: Optional[str] = Field(None, max_length=255)
    first_party_counsel_title: Optional[str] = Field(None, max_length=50)
    first_party_counsel_name: Optional[str] = Field(None, max_length=255)
    first_party_counsel_contact: Optional[str] = Field(None, max_length=100)
    second_party_counsel_title: Optional[str] = Field(None, max_length=50)
    second_party_counsel_name: Optional[str] = Field(None, max_length=255)
    second_party_counsel_contact: Optional[str] = Field(None, max_length=100)
    remarks: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)
    registry_id: Optional[int] = None
    court_id: Optional[int] = None
    court_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    venue: Optional[str] = Field(None, max_length=255)
    case_id: Optional[int] = None
    is_active: Optional[bool] = None

class CauseListResponse(CauseListBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    updated_by: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

