from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Union
from datetime import datetime

class ReportedCaseBase(BaseModel):
    title: Optional[str] = None
    suit_reference_number: Optional[str] = None
    date: Optional[datetime] = None
    presiding_judge: Optional[str] = None
    statutes_cited: Optional[str] = None
    cases_cited: Optional[str] = None
    lawyers: Optional[str] = None
    commentary: Optional[str] = None
    headnotes: Optional[str] = None
    town: Optional[str] = None
    region: Optional[str] = None
    dl_citation_no: Optional[str] = None
    file_url: Optional[str] = None
    judgement: Optional[str] = None
    year: Optional[str] = None
    type: Optional[str] = None
    firebase_url: Optional[str] = None
    summernote: Optional[str] = None
    detail_content: Optional[str] = None
    decision: Optional[str] = None
    antagonist: Optional[str] = None
    protagonist: Optional[str] = None
    citation: Optional[str] = None
    court_type: Optional[str] = None
    court_division: Optional[str] = None
    file_name: Optional[str] = None
    c_t: Optional[int] = None
    judgement_by: Optional[str] = None
    status: Optional[Union[str, int]] = None
    case_summary: Optional[str] = None
    area_of_law: Optional[str] = None
    keywords_phrases: Optional[str] = None
    published: Optional[bool] = True
    dl_type: Optional[str] = None
    academic_programme_id: Optional[str] = None
    opinion_by: Optional[str] = None
    conclusion: Optional[str] = None
    
    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                # Try to parse various date formats
                from dateutil import parser
                return parser.parse(v)
            except:
                return None
        return v
    
    @field_validator('status', mode='before')
    @classmethod
    def parse_status(cls, v):
        if v is None:
            return None
        if isinstance(v, int):
            return str(v)
        return v

class ReportedCaseCreate(ReportedCaseBase):
    pass

class ReportedCaseUpdate(ReportedCaseBase):
    pass

class ReportedCaseResponse(ReportedCaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportedCaseSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query for title, antagonist, protagonist, or citation")
    year: Optional[str] = Field(None, description="Filter by year")
    court_type: Optional[str] = Field(None, description="Filter by court type (SC, CA, HC)")
    region: Optional[str] = Field(None, description="Filter by region")
    area_of_law: Optional[str] = Field(None, description="Filter by area of law")
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Number of results per page")
    sort_by: str = Field("date", description="Sort by field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$", description="Sort order")

class ReportedCaseSearchResponse(BaseModel):
    cases: List[ReportedCaseResponse] = Field(default_factory=list)
    total: int
    page: int
    limit: int
    total_pages: int

class ReportedCaseDetailResponse(ReportedCaseResponse):
    # Include all fields for detailed view
    pass
