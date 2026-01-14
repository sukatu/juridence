from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Setting identification
    key = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # 'general', 'payment', 'email', 'security', etc.
    
    # Setting value
    value = Column(Text, nullable=True)  # JSON string for complex values
    value_type = Column(String(50), nullable=False, default="string")  # 'string', 'number', 'boolean', 'json', 'array'
    
    # Metadata
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)  # Can be accessed without auth
    is_editable = Column(Boolean, default=True, nullable=False)  # Can be modified via API
    is_required = Column(Boolean, default=False, nullable=False)  # Required for system operation
    
    # Validation
    validation_rules = Column(JSON, nullable=True)  # JSON object with validation rules
    default_value = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)  # User ID who last updated this setting
