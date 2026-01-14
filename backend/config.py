from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database Configuration
    database_url_env: Optional[str] = None
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "62579011"
    postgres_database: str = "juridence"
    
    # JWT Configuration
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS Configuration
    cors_origins: list = [
        "http://localhost:3000", 
        "https://case-search-frontend.ondigitalocean.app",
        "https://juridence.net",
        "https://www.juridence.net",
        "https://your-domain.com"
    ]
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    # Email Configuration
    mail_username: Optional[str] = None
    mail_password: Optional[str] = None
    mail_from: Optional[str] = None
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_tls: bool = True
    mail_ssl: bool = False
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    
    # Google Maps Configuration
    react_app_google_maps_api_key: Optional[str] = None
    
    # Application Configuration
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    frontend_url: str = "https://juridence.net"
    
    @property
    def database_url(self) -> str:
        if self.database_url_env:
            return self.database_url_env
        from urllib.parse import quote_plus
        password = quote_plus(self.postgres_password)
        return f"postgresql://{self.postgres_user}:{password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_database}"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

# Create settings instance
settings = Settings()
