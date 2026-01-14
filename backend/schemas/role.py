from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

# Permission Schemas
class PermissionResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    category: str
    resource: str
    action: str
    is_system_permission: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class PermissionCreateRequest(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    category: str
    resource: str
    action: str
    is_active: bool = True

class PermissionUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None
    is_active: Optional[bool] = None

class PermissionListResponse(BaseModel):
    permissions: List[PermissionResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Role Schemas
class RoleResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    is_system_role: bool
    is_active: bool
    permissions: Optional[List[int]] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class RoleCreateRequest(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    is_active: bool = True
    permissions: Optional[List[int]] = None

class RoleUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[List[int]] = None

class RoleListResponse(BaseModel):
    roles: List[RoleResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# User Role Schemas
class UserRoleResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    assigned_by: Optional[int] = None
    assigned_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    notes: Optional[str] = None
    # Include related data
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    role_name: Optional[str] = None
    role_display_name: Optional[str] = None
    assigner_name: Optional[str] = None

    class Config:
        from_attributes = True

class UserRoleCreateRequest(BaseModel):
    user_id: int
    role_id: int
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class UserRoleUpdateRequest(BaseModel):
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class UserRoleListResponse(BaseModel):
    user_roles: List[UserRoleResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Role with permissions detail
class RoleWithPermissionsResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    is_system_role: bool
    is_active: bool
    permissions: List[PermissionResponse]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

# User with roles detail
class UserWithRolesResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    is_active: bool
    roles: List[RoleResponse]
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
