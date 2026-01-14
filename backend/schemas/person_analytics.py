from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime

class PersonAnalyticsBase(BaseModel):
    risk_score: int = 0
    risk_level: str = "Low"
    risk_factors: Optional[List[str]] = None
    total_monetary_amount: Decimal = Decimal('0.00')
    average_case_value: Decimal = Decimal('0.00')
    financial_risk_level: str = "Low"
    primary_subject_matter: Optional[str] = None
    subject_matter_categories: Optional[List[str]] = None
    legal_issues: Optional[List[str]] = None
    financial_terms: Optional[List[str]] = None
    case_complexity_score: int = 0
    success_rate: Decimal = Decimal('0.00')

class PersonAnalyticsCreate(PersonAnalyticsBase):
    person_id: int

class PersonAnalyticsUpdate(PersonAnalyticsBase):
    pass

class PersonAnalyticsResponse(PersonAnalyticsBase):
    id: int
    person_id: int
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class PersonAnalyticsWithPerson(PersonAnalyticsResponse):
    person: Optional[Dict[str, Any]] = None
