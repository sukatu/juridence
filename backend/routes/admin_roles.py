from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from database import get_db
from models.role import Role, Permission, UserRole
from models.user import User
from schemas.role import (
    RoleResponse, RoleCreateRequest, RoleUpdateRequest, RoleListResponse,
    PermissionResponse, PermissionCreateRequest, PermissionUpdateRequest, PermissionListResponse,
    UserRoleResponse, UserRoleCreateRequest, UserRoleUpdateRequest, UserRoleListResponse,
    RoleWithPermissionsResponse, UserWithRolesResponse
)

router = APIRouter()

# Permission Management Endpoints
@router.get("/permissions", response_model=PermissionListResponse)
async def get_permissions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of permissions with filtering"""
    try:
        query = db.query(Permission)
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Permission.name.contains(search),
                    Permission.display_name.contains(search),
                    Permission.description.contains(search)
                )
            )
        
        if category:
            query = query.filter(Permission.category == category)
        
        if is_active is not None:
            query = query.filter(Permission.is_active == is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        permissions = query.order_by(Permission.category, Permission.name).offset(offset).limit(limit).all()
        
        return PermissionListResponse(
            permissions=permissions,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching permissions: {str(e)}")

@router.post("/permissions", response_model=PermissionResponse)
async def create_permission(permission_data: PermissionCreateRequest, db: Session = Depends(get_db)):
    """Create a new permission"""
    try:
        # Check if permission name already exists
        existing = db.query(Permission).filter(Permission.name == permission_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Permission name already exists")
        
        permission = Permission(**permission_data.dict())
        db.add(permission)
        db.commit()
        db.refresh(permission)
        
        return permission
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating permission: {str(e)}")

@router.get("/permissions/{permission_id}", response_model=PermissionResponse)
async def get_permission(permission_id: int, db: Session = Depends(get_db)):
    """Get a specific permission by ID"""
    try:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        
        return permission
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching permission: {str(e)}")

@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int, 
    permission_data: PermissionUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Update a permission"""
    try:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        
        if permission.is_system_permission:
            raise HTTPException(status_code=400, detail="Cannot modify system permissions")
        
        # Update fields
        update_data = permission_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(permission, field, value)
        
        db.commit()
        db.refresh(permission)
        
        return permission
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating permission: {str(e)}")

@router.delete("/permissions/{permission_id}")
async def delete_permission(permission_id: int, db: Session = Depends(get_db)):
    """Delete a permission"""
    try:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        
        if permission.is_system_permission:
            raise HTTPException(status_code=400, detail="Cannot delete system permissions")
        
        db.delete(permission)
        db.commit()
        
        return {"message": "Permission deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting permission: {str(e)}")

# Role Management Endpoints
@router.get("/roles", response_model=RoleListResponse)
async def get_roles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of roles with filtering"""
    try:
        query = db.query(Role)
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Role.name.contains(search),
                    Role.display_name.contains(search),
                    Role.description.contains(search)
                )
            )
        
        if is_active is not None:
            query = query.filter(Role.is_active == is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        roles = query.order_by(Role.name).offset(offset).limit(limit).all()
        
        return RoleListResponse(
            roles=roles,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching roles: {str(e)}")

@router.post("/roles", response_model=RoleResponse)
async def create_role(role_data: RoleCreateRequest, db: Session = Depends(get_db)):
    """Create a new role"""
    try:
        # Check if role name already exists
        existing = db.query(Role).filter(Role.name == role_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Role name already exists")
        
        role = Role(**role_data.dict())
        db.add(role)
        db.commit()
        db.refresh(role)
        
        return role
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating role: {str(e)}")

@router.get("/roles/{role_id}", response_model=RoleWithPermissionsResponse)
async def get_role(role_id: int, db: Session = Depends(get_db)):
    """Get a specific role by ID with permissions"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Get permissions for this role
        permissions = []
        if role.permissions:
            permissions = db.query(Permission).filter(
                Permission.id.in_(role.permissions)
            ).all()
        
        # Create response with permissions
        role_dict = role.__dict__.copy()
        role_dict['permissions'] = permissions
        
        return RoleWithPermissionsResponse(**role_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching role: {str(e)}")

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int, 
    role_data: RoleUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Update a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        if role.is_system_role:
            raise HTTPException(status_code=400, detail="Cannot modify system roles")
        
        # Update fields
        update_data = role_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(role, field, value)
        
        db.commit()
        db.refresh(role)
        
        return role
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating role: {str(e)}")

@router.delete("/roles/{role_id}")
async def delete_role(role_id: int, db: Session = Depends(get_db)):
    """Delete a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        if role.is_system_role:
            raise HTTPException(status_code=400, detail="Cannot delete system roles")
        
        # Check if role is assigned to any users
        user_count = db.query(UserRole).filter(UserRole.role_id == role_id).count()
        if user_count > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete role. It is assigned to {user_count} user(s). Remove assignments first."
            )
        
        db.delete(role)
        db.commit()
        
        return {"message": "Role deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting role: {str(e)}")

# User Role Management Endpoints
@router.get("/user-roles", response_model=UserRoleListResponse)
async def get_user_roles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: Optional[int] = Query(None),
    role_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of user role assignments with filtering"""
    try:
        query = db.query(UserRole)
        
        # Apply filters
        if user_id:
            query = query.filter(UserRole.user_id == user_id)
        
        if role_id:
            query = query.filter(UserRole.role_id == role_id)
        
        if is_active is not None:
            query = query.filter(UserRole.is_active == is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        user_roles = query.order_by(UserRole.assigned_at.desc()).offset(offset).limit(limit).all()
        
        # Enrich with related data
        enriched_roles = []
        for ur in user_roles:
            user = db.query(User).filter(User.id == ur.user_id).first()
            role = db.query(Role).filter(Role.id == ur.role_id).first()
            assigner = db.query(User).filter(User.id == ur.assigned_by).first() if ur.assigned_by else None
            
            ur_dict = ur.__dict__.copy()
            ur_dict['user_name'] = f"{user.first_name} {user.last_name}".strip() if user else None
            ur_dict['user_email'] = user.email if user else None
            ur_dict['role_name'] = role.name if role else None
            ur_dict['role_display_name'] = role.display_name if role else None
            ur_dict['assigner_name'] = f"{assigner.first_name} {assigner.last_name}".strip() if assigner else None
            
            enriched_roles.append(UserRoleResponse(**ur_dict))
        
        return UserRoleListResponse(
            user_roles=enriched_roles,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user roles: {str(e)}")

@router.post("/user-roles", response_model=UserRoleResponse)
async def assign_role(user_role_data: UserRoleCreateRequest, db: Session = Depends(get_db)):
    """Assign a role to a user"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == user_role_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if role exists
        role = db.query(Role).filter(Role.id == user_role_data.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Check if user already has this role
        existing = db.query(UserRole).filter(
            and_(
                UserRole.user_id == user_role_data.user_id,
                UserRole.role_id == user_role_data.role_id,
                UserRole.is_active == True
            )
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="User already has this role")
        
        user_role = UserRole(**user_role_data.dict())
        db.add(user_role)
        db.commit()
        db.refresh(user_role)
        
        # Enrich with related data
        assigner = db.query(User).filter(User.id == user_role.assigned_by).first() if user_role.assigned_by else None
        
        ur_dict = user_role.__dict__.copy()
        ur_dict['user_name'] = f"{user.first_name} {user.last_name}".strip()
        ur_dict['user_email'] = user.email
        ur_dict['role_name'] = role.name
        ur_dict['role_display_name'] = role.display_name
        ur_dict['assigner_name'] = f"{assigner.first_name} {assigner.last_name}".strip() if assigner else None
        
        return UserRoleResponse(**ur_dict)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error assigning role: {str(e)}")

@router.put("/user-roles/{user_role_id}", response_model=UserRoleResponse)
async def update_user_role(
    user_role_id: int, 
    user_role_data: UserRoleUpdateRequest, 
    db: Session = Depends(get_db)
):
    """Update a user role assignment"""
    try:
        user_role = db.query(UserRole).filter(UserRole.id == user_role_id).first()
        if not user_role:
            raise HTTPException(status_code=404, detail="User role assignment not found")
        
        # Update fields
        update_data = user_role_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user_role, field, value)
        
        db.commit()
        db.refresh(user_role)
        
        # Enrich with related data
        user = db.query(User).filter(User.id == user_role.user_id).first()
        role = db.query(Role).filter(Role.id == user_role.role_id).first()
        assigner = db.query(User).filter(User.id == user_role.assigned_by).first() if user_role.assigned_by else None
        
        ur_dict = user_role.__dict__.copy()
        ur_dict['user_name'] = f"{user.first_name} {user.last_name}".strip() if user else None
        ur_dict['user_email'] = user.email if user else None
        ur_dict['role_name'] = role.name if role else None
        ur_dict['role_display_name'] = role.display_name if role else None
        ur_dict['assigner_name'] = f"{assigner.first_name} {assigner.last_name}".strip() if assigner else None
        
        return UserRoleResponse(**ur_dict)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user role: {str(e)}")

@router.delete("/user-roles/{user_role_id}")
async def remove_user_role(user_role_id: int, db: Session = Depends(get_db)):
    """Remove a role from a user"""
    try:
        user_role = db.query(UserRole).filter(UserRole.id == user_role_id).first()
        if not user_role:
            raise HTTPException(status_code=404, detail="User role assignment not found")
        
        db.delete(user_role)
        db.commit()
        
        return {"message": "User role removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing user role: {str(e)}")

# Statistics endpoints
@router.get("/stats")
async def get_roles_permissions_stats(db: Session = Depends(get_db)):
    """Get roles and permissions statistics"""
    try:
        total_roles = db.query(Role).count()
        active_roles = db.query(Role).filter(Role.is_active == True).count()
        system_roles = db.query(Role).filter(Role.is_system_role == True).count()
        
        total_permissions = db.query(Permission).count()
        active_permissions = db.query(Permission).filter(Permission.is_active == True).count()
        system_permissions = db.query(Permission).filter(Permission.is_system_permission == True).count()
        
        total_user_roles = db.query(UserRole).count()
        active_user_roles = db.query(UserRole).filter(UserRole.is_active == True).count()
        
        # Permission categories
        categories = db.query(
            Permission.category, 
            func.count(Permission.id).label('count')
        ).group_by(Permission.category).all()
        
        category_distribution = {cat: count for cat, count in categories}
        
        return {
            "roles": {
                "total": total_roles,
                "active": active_roles,
                "system": system_roles,
                "custom": total_roles - system_roles
            },
            "permissions": {
                "total": total_permissions,
                "active": active_permissions,
                "system": system_permissions,
                "custom": total_permissions - system_permissions,
                "categories": category_distribution
            },
            "user_roles": {
                "total": total_user_roles,
                "active": active_user_roles
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")
