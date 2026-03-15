"""Application configuration."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "Overlord API"
    debug: bool = False
    version: str = "5.0.0"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:4321"]
    
    # Database
    database_url: str = "postgresql+asyncpg://user:pass@localhost/overlord"
    
    # Redis (for caching/websockets)
    redis_url: str = "redis://localhost:6379"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra fields from env


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
