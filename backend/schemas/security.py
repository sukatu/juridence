from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SecurityEventResponse(BaseModel):
    id: int
    user_id: int
    event_type: str
    description: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    country: Optional[str]
    city: Optional[str]
    security_metadata: Optional[Dict[str, Any]]
    risk_score: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class TwoFactorAuthSetup(BaseModel):
    method: str  # sms, authenticator, email
    phone_number: Optional[str] = None

class TwoFactorAuthVerify(BaseModel):
    code: str
    method: str

class TwoFactorAuthResponse(BaseModel):
    id: int
    user_id: int
    is_enabled: bool
    method: Optional[str]
    phone_number: Optional[str]
    sms_verified: bool
    email_verified: bool
    backup_codes: Optional[List[str]]
    recovery_codes: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    last_used: Optional[datetime]

    class Config:
        from_attributes = True

class ApiKeyCreate(BaseModel):
    name: str
    permissions: Optional[List[str]] = None
    rate_limit: Optional[int] = None
    expires_at: Optional[datetime] = None

class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    permissions: Optional[List[str]] = None
    rate_limit: Optional[int] = None
    is_active: Optional[bool] = None

class ApiKeyResponse(BaseModel):
    id: int
    user_id: int
    name: str
    key_prefix: str
    permissions: Optional[List[str]]
    rate_limit: Optional[int]
    is_active: bool
    last_used: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    revoked_at: Optional[datetime]

    class Config:
        from_attributes = True

class ApiKeyCreateResponse(BaseModel):
    api_key: ApiKeyResponse
    key: str  # Only returned on creation

class LoginSessionResponse(BaseModel):
    id: int
    user_id: int
    ip_address: Optional[str]
    user_agent: Optional[str]
    country: Optional[str]
    city: Optional[str]
    is_active: bool
    is_mobile: bool
    created_at: datetime
    last_activity: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class SecuritySettingsResponse(BaseModel):
    two_factor_auth: TwoFactorAuthResponse
    api_keys: List[ApiKeyResponse]
    active_sessions: List[LoginSessionResponse]
    recent_events: List[SecurityEventResponse]
    security_score: int  # 0-100

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class SecurityEventCreate(BaseModel):
    event_type: str
    description: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    security_metadata: Optional[Dict[str, Any]] = None
    risk_score: Optional[int] = None
