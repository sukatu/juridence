"""
Pydantic schemas for person_case_statistics.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PersonCaseStatisticsBase(BaseModel):
    """Base schema for person case statistics."""
    person_id: int = Field(..., description="ID of the person")
    total_cases: int = Field(default=0, ge=0, description="Total number of cases")
    resolved_cases: int = Field(default=0, ge=0, description="Number of resolved cases")
    unresolved_cases: int = Field(default=0, ge=0, description="Number of unresolved cases")
    favorable_cases: int = Field(default=0, ge=0, description="Number of favorable cases")
    unfavorable_cases: int = Field(default=0, ge=0, description="Number of unfavorable cases")
    mixed_cases: int = Field(default=0, ge=0, description="Number of mixed outcome cases")
    case_outcome: str = Field(default="N/A", description="Overall case outcome")

class PersonCaseStatisticsCreate(PersonCaseStatisticsBase):
    """Schema for creating person case statistics."""
    pass

class PersonCaseStatisticsUpdate(BaseModel):
    """Schema for updating person case statistics."""
    total_cases: Optional[int] = Field(None, ge=0, description="Total number of cases")
    resolved_cases: Optional[int] = Field(None, ge=0, description="Number of resolved cases")
    unresolved_cases: Optional[int] = Field(None, ge=0, description="Number of unresolved cases")
    favorable_cases: Optional[int] = Field(None, ge=0, description="Number of favorable cases")
    unfavorable_cases: Optional[int] = Field(None, ge=0, description="Number of unfavorable cases")
    mixed_cases: Optional[int] = Field(None, ge=0, description="Number of mixed outcome cases")
    case_outcome: Optional[str] = Field(None, description="Overall case outcome")

class PersonCaseStatisticsResponse(PersonCaseStatisticsBase):
    """Schema for person case statistics API responses."""
    id: int = Field(..., description="Unique identifier")
    last_updated: Optional[datetime] = Field(None, description="Last update timestamp")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    
    class Config:
        from_attributes = True

class PersonCaseStatisticsSummary(BaseModel):
    """Summary schema for person case statistics."""
    person_id: int
    total_cases: int
    resolved_cases: int
    unresolved_cases: int
    case_outcome: str
    resolution_rate: float = Field(..., description="Percentage of resolved cases")
    favorable_rate: float = Field(..., description="Percentage of favorable outcomes")
    
    @classmethod
    def from_statistics(cls, stats: PersonCaseStatisticsResponse):
        """Create summary from full statistics."""
        resolution_rate = (stats.resolved_cases / stats.total_cases * 100) if stats.total_cases > 0 else 0
        favorable_rate = (stats.favorable_cases / stats.resolved_cases * 100) if stats.resolved_cases > 0 else 0
        
        return cls(
            person_id=stats.person_id,
            total_cases=stats.total_cases,
            resolved_cases=stats.resolved_cases,
            unresolved_cases=stats.unresolved_cases,
            case_outcome=stats.case_outcome,
            resolution_rate=round(resolution_rate, 2),
            favorable_rate=round(favorable_rate, 2)
        )
