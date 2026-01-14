from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create declarative base
Base = declarative_base()

# Create engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables
def create_tables():
    # Import all models to ensure they're registered with Base
    # Import models package which will register all models via __init__.py
    import models  # noqa: F401
    
    # Import additional models that might not be in __init__.py
    try:
        from models.ai_chat_session import AIChatSession  # noqa: F401
    except ImportError:
        pass
    try:
        from models.logs import ActivityLog, AuditLog, ErrorLog  # noqa: F401
    except ImportError:
        pass
    try:
        from models.court import Court  # noqa: F401
    except ImportError:
        pass
    try:
        from models.court_types import CourtType  # noqa: F401
    except ImportError:
        pass
    try:
        from models.judges import Judge  # noqa: F401
    except ImportError:
        pass
    try:
        from models.employee import Employee  # noqa: F401
    except ImportError:
        pass
    try:
        from models.gazette import Gazette  # noqa: F401
    except ImportError:
        pass
    try:
        from models.cause_list import CauseList  # noqa: F401
    except ImportError:
        pass
    try:
        from models.contact_request import ContactRequest  # noqa: F401
    except ImportError:
        pass
    try:
        from models.person_case_link import PersonCaseLink  # noqa: F401
    except ImportError:
        pass
    try:
        from models.person_relationship import PersonRelationship  # noqa: F401
    except ImportError:
        pass
    try:
        from models.person_employment import PersonEmployment  # noqa: F401
    except ImportError:
        pass
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
