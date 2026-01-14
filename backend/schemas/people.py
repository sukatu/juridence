from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import json

class PeopleBase(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=200)
    previous_names: Optional[List[str]] = None
    date_of_birth: Optional[datetime] = None
    date_of_death: Optional[datetime] = None
    id_number: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    risk_level: Optional[str] = Field(None, max_length=20)
    risk_score: Optional[float] = Field(None, ge=0, le=200)
    case_count: Optional[int] = Field(None, ge=0)
    case_types: Optional[List[str]] = None
    court_records: Optional[List[Dict[str, Any]]] = None
    occupation: Optional[str] = Field(None, max_length=100)
    employer: Optional[str] = Field(None, max_length=200)
    organization: Optional[str] = Field(None, max_length=200)
    job_title: Optional[str] = Field(None, max_length=100)
    marital_status: Optional[str] = Field(None, max_length=20)
    spouse_name: Optional[str] = Field(None, max_length=200)
    children_count: Optional[int] = Field(None, ge=0)
    emergency_contact: Optional[str] = Field(None, max_length=200)
    emergency_phone: Optional[str] = Field(None, max_length=20)
    nationality: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, max_length=10)
    education_level: Optional[str] = Field(None, max_length=50)
    languages: Optional[List[str]] = None
    is_verified: bool = Field(default=False)
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    status: str = Field(default="active", max_length=20)
    notes: Optional[str] = None
    
    # Case Statistics (from person_case_statistics table)
    total_cases: Optional[int] = Field(default=0, ge=0, description="Total number of cases")
    resolved_cases: Optional[int] = Field(default=0, ge=0, description="Number of resolved cases")
    unresolved_cases: Optional[int] = Field(default=0, ge=0, description="Number of unresolved cases")
    favorable_cases: Optional[int] = Field(default=0, ge=0, description="Number of favorable cases")
    unfavorable_cases: Optional[int] = Field(default=0, ge=0, description="Number of unfavorable cases")
    mixed_cases: Optional[int] = Field(default=0, ge=0, description="Number of mixed outcome cases")
    case_outcome: Optional[str] = Field(default="N/A", description="Overall case outcome")

    @field_validator('case_types', 'languages', 'previous_names', mode='before')
    @classmethod
    def parse_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return v.split(', ') if v else []
        return v

    @field_validator('court_records', mode='before')
    @classmethod
    def parse_court_records(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return [{"record": v}] if v else []
        return v

class PeopleCreate(PeopleBase):
    pass

class PeopleUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    date_of_birth: Optional[Union[datetime, str]] = None
    date_of_death: Optional[Union[datetime, str]] = None
    
    @field_validator('date_of_birth', 'date_of_death', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            try:
                # Try ISO format first (YYYY-MM-DD)
                return datetime.fromisoformat(v)
            except ValueError:
                try:
                    # Try DD/MM/YYYY format
                    if '/' in v:
                        parts = v.split('/')
                        if len(parts) == 3:
                            return datetime(int(parts[2]), int(parts[1]), int(parts[0]))
                    # Try other formats
                    return datetime.strptime(v, '%Y-%m-%d')
                except Exception:
                    return None
        return v
    id_number: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    risk_level: Optional[str] = Field(None, max_length=20)
    risk_score: Optional[float] = Field(None, ge=0, le=200)
    case_count: Optional[int] = Field(None, ge=0)
    case_types: Optional[List[str]] = None
    court_records: Optional[List[Dict[str, Any]]] = None
    occupation: Optional[str] = Field(None, max_length=100)
    employer: Optional[str] = Field(None, max_length=200)
    organization: Optional[str] = Field(None, max_length=200)
    job_title: Optional[str] = Field(None, max_length=100)
    marital_status: Optional[str] = Field(None, max_length=20)
    spouse_name: Optional[str] = Field(None, max_length=200)
    children_count: Optional[int] = Field(None, ge=0)
    emergency_contact: Optional[str] = Field(None, max_length=200)
    emergency_phone: Optional[str] = Field(None, max_length=20)
    nationality: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, max_length=10)
    education_level: Optional[str] = Field(None, max_length=50)
    languages: Optional[List[str]] = None
    is_verified: Optional[bool] = None
    verification_date: Optional[datetime] = None
    verification_notes: Optional[str] = None
    status: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = None

class PeopleResponse(PeopleBase):
    id: int
    last_searched: Optional[datetime] = None
    search_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class PeopleSearchRequest(BaseModel):
    query: Optional[str] = Field(None, min_length=1, max_length=200)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    id_number: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    risk_level: Optional[str] = Field(None, max_length=20)
    occupation: Optional[str] = Field(None, max_length=100)
    employer: Optional[str] = Field(None, max_length=200)
    organization: Optional[str] = Field(None, max_length=200)
    case_types: Optional[List[str]] = None
    gender: Optional[str] = Field(None, max_length=10)
    nationality: Optional[str] = Field(None, max_length=100)
    is_verified: Optional[bool] = None
    status: Optional[str] = Field(None, max_length=20)
    min_risk_score: Optional[float] = Field(None, ge=0, le=100)
    max_risk_score: Optional[float] = Field(None, ge=0, le=100)
    min_case_count: Optional[int] = Field(None, ge=0)
    max_case_count: Optional[int] = Field(None, ge=0)
    date_of_birth_from: Optional[datetime] = None
    date_of_birth_to: Optional[datetime] = None
    sort_by: Optional[str] = Field(default="full_name", max_length=50)
    sort_order: Optional[str] = Field(default="asc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class PeopleSearchResponse(BaseModel):
    people: List[PeopleResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PeopleStats(BaseModel):
    total_people: int
    verified_people: int
    high_risk_people: int
    medium_risk_people: int
    low_risk_people: int
    people_with_cases: int
    people_by_region: Dict[str, int]
    people_by_occupation: Dict[str, int]
    recent_searches: int
    top_searched: List[Dict[str, Any]]
