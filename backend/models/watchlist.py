from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Watchlist(Base):
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Entity type: 'person' or 'company' (includes banks, insurance)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    
    # Entity name for quick reference (denormalized for performance)
    entity_name = Column(String(255), nullable=True)
    
    # Notes/description for this watchlist item
    notes = Column(Text, nullable=True)
    
    # Notification preferences
    notify_on_new_cases = Column(Boolean, default=True, nullable=False)
    notify_on_risk_change = Column(Boolean, default=True, nullable=False)
    notify_on_regulatory_updates = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship
    user = relationship("User", backref="watchlist_items")
    
    # Unique constraint to prevent duplicates
    __table_args__ = (
        UniqueConstraint('user_id', 'entity_type', 'entity_id', name='uq_watchlist_user_entity'),
    )
    
    def __repr__(self):
        return f"<Watchlist(id={self.id}, user_id={self.user_id}, entity_type={self.entity_type}, entity_id={self.entity_id})>"
