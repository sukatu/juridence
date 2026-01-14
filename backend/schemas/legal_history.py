from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class LegalHistoryBase(BaseModel):
    entity_type: str
    entity_id: int
    entity_name: str
    case_id: int
    mention_type: str
    mention_context: Optional[str] = None
    mention_count: int = 1
    relevance_score: float = 0.0

class LegalHistoryCreate(LegalHistoryBase):
    pass

class LegalHistoryResponse(LegalHistoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CaseMentionBase(BaseModel):
    case_id: int
    entity_type: str
    entity_id: int
    entity_name: str
    mention_in_title: bool = False
    mention_in_antagonist: bool = False
    mention_in_protagonist: bool = False
    mention_in_content: bool = False
    mention_in_judgement: bool = False
    mention_in_decision: bool = False
    total_mentions: int = 0

class CaseMentionCreate(CaseMentionBase):
    pass

class CaseMentionResponse(CaseMentionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LegalSearchIndexBase(BaseModel):
    entity_type: str
    entity_id: int
    entity_name: str
    search_terms: str
    case_count: int = 0
    is_active: bool = True

class LegalSearchIndexCreate(LegalSearchIndexBase):
    pass

class LegalSearchIndexResponse(LegalSearchIndexBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class LegalHistorySearchRequest(BaseModel):
    entity_type: str = Field(..., description="Type of entity: 'person', 'bank', or 'insurance'")
    entity_id: int = Field(..., description="ID of the entity")
    entity_name: str = Field(..., description="Name of the entity")
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Number of results per page")
    mention_type: Optional[str] = Field(None, description="Filter by mention type")
    min_relevance_score: Optional[float] = Field(None, description="Minimum relevance score")

class LegalHistorySearchResponse(BaseModel):
    legal_history: List[LegalHistoryResponse]
    case_mentions: List[CaseMentionResponse]
    total_cases: int
    total_mentions: int
    page: int
    limit: int
    total_pages: int
    entity_info: dict

class CaseWithMentions(BaseModel):
    case_id: int
    title: str
    suit_reference_number: Optional[str]
    date: Optional[datetime]
    year: Optional[str]
    court_type: Optional[str]
    citation: Optional[str]
    mention_details: CaseMentionResponse
    legal_history: List[LegalHistoryResponse]

class EntityLegalSummary(BaseModel):
    entity_name: str
    entity_type: str
    total_cases: int
    total_mentions: int
    cases_by_mention_type: dict
    recent_cases: List[CaseWithMentions]
    court_distribution: dict
    year_distribution: dict
