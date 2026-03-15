"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field, PrivateAttr
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
    access_token_expire_minutes: int = Field(
        default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    websocket_token: str = Field(
        default="ws_development_token", alias="WEBSOCKET_TOKEN"
    )

    # CORS - Private attr to store raw string, property to parse
    _cors_origins_raw: str = PrivateAttr(default="http://localhost:5173")

    # Features
    enable_realdebrid: bool = Field(default=False, alias="ENABLE_REALDEBRID")
    rd_api_key: Optional[str] = Field(default=None, alias="RD_API_KEY")

    # AI Assistant
    gemini_api_key: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")
    enable_ai_assistant: bool = Field(default=True, alias="ENABLE_AI_ASSISTANT")
    ai_default_model: str = Field(default="gemini-1.5-flash", alias="AI_DEFAULT_MODEL")

    # Rate Limiting
    rate_limit_requests: int = Field(default=100, alias="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, alias="RATE_LIMIT_WINDOW")

    # Data Retention
    data_retention_days: int = Field(default=30, alias="DATA_RETENTION_DAYS")

    # Service Monitoring
    services_to_monitor: List[str] = Field(
        default_factory=lambda: ["Docker.Service", "nvidia-container-runtime.exe"],
        alias="SERVICES_TO_MONITOR",
    )

    def model_post_init(self, __context) -> None:
        """Load CORS origins from env after initialization."""
        import os

        self._cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")

    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as a list from comma-separated string."""
        raw = self._cors_origins_raw
        if not raw:
            return ["http://localhost:5173"]
        # Strip quotes and split by comma
        raw = raw.strip().strip('"').strip("'")
        return [
            origin.strip().strip('"').strip("'")
            for origin in raw.split(",")
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
