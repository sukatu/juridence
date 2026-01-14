from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class CorrectionOfPlaceOfBirthBase(BaseModel):
    """Base schema for Correction of Place of Birth"""
    item_number: str = Field(..., min_length=1, max_length=50)
    person_name: str = Field(..., min_length=1, max_length=500)
    alias: Optional[str] = Field(None, max_length=500)
    profession: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = Field(None, max_length=10)
    new_place_of_birth: Optional[str] = Field(None, max_length=200)
    old_place_of_birth: Optional[str] = Field(None, max_length=200)
    effective_date: Optional[date] = None
    remarks: Optional[str] = None
    gazette_number: Optional[str] = Field(None, max_length=50)
    gazette_date: Optional[date] = None
    page: Optional[int] = None
    document_filename: str = Field(..., min_length=1, max_length=255)
    source_details: Optional[str] = Field(None, max_length=500)
    person_id: Optional[int] = None

class CorrectionOfPlaceOfBirthCreate(CorrectionOfPlaceOfBirthBase):
    """Schema for creating a Correction of Place of Birth entry"""
    pass

class CorrectionOfPlaceOfBirthUpdate(BaseModel):
    """Schema for updating a Correction of Place of Birth entry"""
    item_number: Optional[str] = Field(None, min_length=1, max_length=50)
    person_name: Optional[str] = Field(None, min_length=1, max_length=500)
    alias: Optional[str] = Field(None, max_length=500)
    profession: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = Field(None, max_length=10)
    new_place_of_birth: Optional[str] = Field(None, max_length=200)
    old_place_of_birth: Optional[str] = Field(None, max_length=200)
    effective_date: Optional[date] = None
    remarks: Optional[str] = None
    gazette_number: Optional[str] = Field(None, max_length=50)
    gazette_date: Optional[date] = None
    page: Optional[int] = None
    document_filename: Optional[str] = Field(None, min_length=1, max_length=255)
    source_details: Optional[str] = Field(None, max_length=500)
    person_id: Optional[int] = None

class CorrectionOfPlaceOfBirthResponse(CorrectionOfPlaceOfBirthBase):
    """Schema for Correction of Place of Birth response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
