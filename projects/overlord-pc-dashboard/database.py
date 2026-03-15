"""Centralized database configuration for the Overlord project."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Load environment variables BEFORE any getenv calls
load_dotenv()


# Get project root directory
PROJECT_ROOT = Path(__file__).parent.resolve()
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)


def get_database_url(async_mode: bool = True) -> str:
    """Get database URL with priority: POSTGRES_URL > DATABASE_URL > SQLite fallback.
    
    Args:
        async_mode: If True, returns async-compatible URL
    """
    postgres_url = os.getenv("POSTGRES_URL")
    if postgres_url and postgres_url.strip():
        if async_mode:
            return postgres_url.replace("postgresql://", "postgresql+asyncpg://")
        return postgres_url

    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.strip():
        if async_mode:
            return db_url.replace("sqlite://", "sqlite+aiosqlite://")
        return db_url.replace("sqlite+aiosqlite://", "sqlite://")

    # Default to SQLite in data directory
    db_path = DATA_DIR / "overlord_hub.db"
    if async_mode:
        return f"sqlite+aiosqlite:///{db_path}"
    return f"sqlite:///{db_path}"


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""
    pass


# Create engines
try:
    db_url_async = get_database_url(async_mode=True)
    db_url_sync = get_database_url(async_mode=False)
    
    # Async engine for the app
    async_engine = create_async_engine(db_url_async, echo=False)
    
    # Sync engine for Alembic migrations
    sync_engine = create_engine(db_url_sync, echo=False)
    
except Exception as e:
    import logging
    logging.warning(f"Failed to create engine with configured DB, falling back to SQLite: {e}")
    
    # Fallback to SQLite
    db_path = DATA_DIR / "overlord.db"
    async_engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}", echo=False)
    sync_engine = create_engine(f"sqlite:///{db_path}", echo=False)

# Session makers
async_session = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


def get_db():
    """Get a database session (sync version for FastAPI dependencies)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
