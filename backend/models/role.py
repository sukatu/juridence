from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_system_role = Column(Boolean, default=False, nullable=False)  # Cannot be deleted
    is_active = Column(Boolean, default=True, nullable=False)
    permissions = Column(JSON, nullable=True)  # Array of permission IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    user_roles = relationship("UserRole", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # e.g., 'users', 'cases', 'admin'
    resource = Column(String(100), nullable=False)  # e.g., 'user', 'case', 'payment'
    action = Column(String(50), nullable=False)  # e.g., 'create', 'read', 'update', 'delete'
    is_system_permission = Column(Boolean, default=False, nullable=False)  # Cannot be deleted
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])

class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", back_populates="user_roles")
    assigner = relationship("User", foreign_keys=[assigned_by])

    # Unique constraint to prevent duplicate role assignments
    __table_args__ = (
        {"extend_existing": True}
    )
