from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class MarriageOfficerBase(BaseModel):
    """Base schema for Marriage Officer"""
    officer_name: str = Field(..., min_length=1, max_length=500)
    church: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=500)
    appointing_authority: Optional[str] = Field(None, max_length=500)
    appointment_date: Optional[date] = None
    gazette_number: Optional[str] = Field(None, max_length=50)
    gazette_date: Optional[date] = None
    page_number: Optional[int] = None
    source_details: Optional[str] = Field(None, max_length=500)
    document_filename: Optional[str] = Field(None, max_length=255)
    person_id: Optional[int] = None

class MarriageOfficerCreate(MarriageOfficerBase):
    """Schema for creating a Marriage Officer entry"""
    pass

class MarriageOfficerUpdate(BaseModel):
    """Schema for updating a Marriage Officer entry"""
    officer_name: Optional[str] = Field(None, min_length=1, max_length=500)
    church: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=500)
    appointing_authority: Optional[str] = Field(None, max_length=500)
    appointment_date: Optional[date] = None
    gazette_number: Optional[str] = Field(None, max_length=50)
    gazette_date: Optional[date] = None
    page_number: Optional[int] = None
    source_details: Optional[str] = Field(None, max_length=500)
    document_filename: Optional[str] = Field(None, max_length=255)
    person_id: Optional[int] = None

class MarriageOfficerResponse(MarriageOfficerBase):
    """Schema for Marriage Officer response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
