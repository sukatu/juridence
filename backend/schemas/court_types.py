from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CourtLevel(str, Enum):
    supreme_court = "supreme_court"
    court_of_appeal = "court_of_appeal"
    high_court = "high_court"
    circuit_court = "circuit_court"
    district_court = "district_court"
    magistrate_court = "magistrate_court"

class CourtTypeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the court type")
    code: str = Field(..., min_length=1, max_length=20, description="Short code for the court type")
    level: CourtLevel = Field(..., description="Level of the court in the hierarchy")
    description: Optional[str] = Field(None, description="Description of the court type")
    jurisdiction: Optional[str] = Field(None, description="Geographic or subject matter jurisdiction")
    region: Optional[str] = Field(None, max_length=50, description="Region or jurisdiction")
    address: Optional[str] = Field(None, description="Physical address of the court")
    contact_info: Optional[str] = Field(None, description="Contact information")
    presiding_judge: Optional[str] = Field(None, max_length=255, description="Name of presiding judge")
    established_date: Optional[datetime] = Field(None, description="Date when the court was established")

class CourtTypeCreate(CourtTypeBase):
    pass

class CourtTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    level: Optional[CourtLevel] = None
    description: Optional[str] = None
    jurisdiction: Optional[str] = None
    region: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    contact_info: Optional[str] = None
    presiding_judge: Optional[str] = Field(None, max_length=255)
    established_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class CourtTypeResponse(CourtTypeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    updated_by: Optional[str]

    class Config:
        from_attributes = True

class CourtTypeListResponse(BaseModel):
    court_types: List[CourtTypeResponse]
    total: int
    page: int
    limit: int
    total_pages: int
