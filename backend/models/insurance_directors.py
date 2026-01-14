from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class InsuranceDirector(Base):
    __tablename__ = "insurance_directors"

    id = Column(Integer, primary_key=True, index=True)
    insurance_id = Column(Integer, ForeignKey("insurance.id"), nullable=False, index=True)
    
    # Director Information
    full_name = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    title = Column(String(50), nullable=True)  # Mr., Mrs., Dr., etc.
    
    # Contact Information
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Ghana")
    postal_code = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Director Details
    nationality = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    id_number = Column(String(50), nullable=True)
    occupation = Column(String(200), nullable=True)
    
    # Appointment Details
    appointment_date = Column(Date, nullable=True)
    resignation_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=True, nullable=False)
    position = Column(String(100), nullable=True)  # Chairman, Managing Director, etc.
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    insurance = relationship("Insurance", back_populates="insurance_directors")
