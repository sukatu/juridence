"""
Pydantic schemas for case summaries.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CaseSummaryBase(BaseModel):
    summary: str = Field(..., description="Case summary text")
    monetary_value: Optional[float] = Field(None, description="Monetary value if present")
    monetary_currency: Optional[str] = Field("GHS", description="Currency of monetary value")
    has_monetary_value: bool = Field(False, description="Whether case involves monetary value")

class CaseSummaryCreate(CaseSummaryBase):
    case_id: int = Field(..., description="ID of the case")

class CaseSummaryUpdate(BaseModel):
    summary: Optional[str] = None
    monetary_value: Optional[float] = None
    monetary_currency: Optional[str] = None
    has_monetary_value: Optional[bool] = None

class CaseSummaryResponse(CaseSummaryBase):
    id: int
    case_id: int
    generated_at: datetime
    updated_at: Optional[datetime]
    version: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
