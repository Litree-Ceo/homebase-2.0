"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Application
    debug: bool = Field(default=False, alias="DEBUG")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    api_url: str = Field(default="http://localhost:8000", alias="API_URL")

    # Database
    database_url: str = Field(
        default="sqlite+aiosqlite:///./overlord.db", alias="DATABASE_URL"
    )

    # Security
    secret_key: str = Field(default="change-me-in-production", alias="SECRET_KEY")
    api_key: str = Field(default="ovrd_development_key", alias="API_KEY")
    overlord_auth_token: str = Field(
        default="changeme-generated-auth-token", alias="OVERLORD_AUTH_TOKEN"
    )
    access_token_expire_minutes: int = Field(
        default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    websocket_token: str = Field(
        default="ws_development_token", alias="WEBSOCKET_TOKEN"
    )

    # CORS - comma-separated string, parsed to list
    cors_origins: List[str] = Field(
        default=["http://localhost:5173"], alias="CORS_ORIGINS"
    )

    # Features
    enable_realdebrid: bool = Field(default=False, alias="ENABLE_REALDEBRID")
    rd_api_key: Optional[str] = Field(default=None, alias="RD_API_KEY")

    # AI Integrations
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    gemini_api_key: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")

    # Firebase
    firebase_config: Optional[str] = Field(default=None, alias="FIREBASE_CONFIG")
    firebase_database_url: Optional[str] = Field(
        default=None, alias="FIREBASE_DATABASE_URL"
    )

    # Termux SSH
    termux_host: Optional[str] = Field(default=None, alias="TERMUX_HOST")
    termux_port: int = Field(default=8022, alias="TERMUX_PORT")
    termux_user: Optional[str] = Field(default=None, alias="TERMUX_USER")
    termux_pass: Optional[str] = Field(default=None, alias="TERMUX_PASS")

    # Rate Limiting
    rate_limit_requests: int = Field(default=100, alias="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, alias="RATE_LIMIT_WINDOW")

    # Data Retention
    data_retention_days: int = Field(default=30, alias="DATA_RETENTION_DAYS")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def validate_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if isinstance(v, list):
            return v
        if not v:
            return ["http://localhost:5173"]
        # Strip quotes and split by comma
        v = v.strip().strip('"').strip("'")
        return [
            origin.strip().strip('"').strip("'")
            for origin in v.split(",")
            if origin.strip()
        ]

    @property
    def database_url_async(self) -> str:
        """Get async database URL."""
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://")
        return self.database_url


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
