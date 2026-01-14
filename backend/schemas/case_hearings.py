from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class HearingRemark(str, Enum):
    fh = "fh"  # For Hearing
    fr = "fr"  # For Ruling
    fj = "fj"  # For Judgement

class CaseHearingBase(BaseModel):
    hearing_date: datetime
    hearing_time: Optional[str] = None
    coram: Optional[str] = None
    remark: HearingRemark
    proceedings: Optional[str] = None

class CaseHearingCreate(CaseHearingBase):
    case_id: Optional[int] = None

class CaseHearingUpdate(BaseModel):
    hearing_date: Optional[datetime] = None
    hearing_time: Optional[str] = None
    coram: Optional[str] = None
    remark: Optional[HearingRemark] = None
    proceedings: Optional[str] = None

class CaseHearing(CaseHearingBase):
    id: int
    case_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
