from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

class CaseMetadataBase(BaseModel):
    case_summary: Optional[str] = None
    summernote_content: Optional[str] = None
    case_type: Optional[str] = None
    area_of_law: Optional[str] = None
    keywords: Optional[List[str]] = None
    judges: Optional[List[str]] = None
    lawyers: Optional[List[str]] = None
    related_people: Optional[List[str]] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    organizations: Optional[List[str]] = None
    banks_involved: Optional[List[str]] = None
    insurance_involved: Optional[List[str]] = None
    resolution_status: Optional[str] = None
    outcome: Optional[str] = None
    decision_type: Optional[str] = None
    monetary_amount: Optional[float] = None
    statutes_cited: Optional[List[str]] = None
    cases_cited: Optional[List[str]] = None
    court_type: Optional[str] = None
    court_division: Optional[str] = None
    search_keywords: Optional[List[str]] = None
    relevance_score: Optional[float] = 0.0
    is_processed: Optional[bool] = False

class CaseMetadataCreate(CaseMetadataBase):
    case_id: int

class CaseMetadataUpdate(CaseMetadataBase):
    pass

class CaseMetadata(CaseMetadataBase):
    id: int
    case_id: int
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CaseSearchIndexBase(BaseModel):
    searchable_text: str
    person_names: Optional[List[str]] = None
    organization_names: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    word_count: Optional[int] = 0

class CaseSearchIndexCreate(CaseSearchIndexBase):
    case_id: int

class CaseSearchIndex(CaseSearchIndexBase):
    id: int
    case_id: int
    last_indexed: datetime

    class Config:
        from_attributes = True

class CaseSearchResult(BaseModel):
    id: int
    title: str
    suit_reference_number: Optional[str] = None
    date: Optional[datetime] = None
    presiding_judge: Optional[str] = None
    court_type: Optional[str] = None
    court_division: Optional[str] = None
    area_of_law: Optional[str] = None
    status: Optional[str] = None
    protagonist: Optional[str] = None
    antagonist: Optional[str] = None
    
    # Metadata
    case_summary: Optional[str] = None
    judges: Optional[List[str]] = None
    lawyers: Optional[List[str]] = None
    related_people: Optional[List[str]] = None
    organizations: Optional[List[str]] = None
    banks_involved: Optional[List[str]] = None
    insurance_involved: Optional[List[str]] = None
    resolution_status: Optional[str] = None
    outcome: Optional[str] = None
    decision_type: Optional[str] = None
    monetary_amount: Optional[float] = None
    
    # Search relevance
    relevance_score: Optional[float] = 0.0
    match_type: Optional[str] = None  # title, content, people, etc.
    
    class Config:
        from_attributes = True

class CaseSearchResponse(BaseModel):
    results: List[CaseSearchResult]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool
    search_time_ms: float
    query: str

class CaseStats(BaseModel):
    total_cases: int
    resolved_cases: int
    pending_cases: int
    favorable_outcomes: int
    unfavorable_outcomes: int
    mixed_outcomes: int
    total_people_involved: int
    total_organizations: int
    total_banks: int
    total_insurance: int

class PersonCaseProfile(BaseModel):
    person_name: str
    total_cases: int
    resolved_cases: int
    pending_cases: int
    favorable_outcomes: int
    cases: List[CaseSearchResult]
    stats: CaseStats
    affiliations: List[str]
    related_people: List[str]
    organizations: List[str]
