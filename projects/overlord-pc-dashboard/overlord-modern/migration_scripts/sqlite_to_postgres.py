#!/usr/bin/env python3
"""
Migration script: SQLite to PostgreSQL
Migrates data from legacy SQLite database to new PostgreSQL database.
"""

import asyncio
import sqlite3
from datetime import datetime
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.config import get_settings
from app.database import Base
from app.models.system import SystemStats
from app.core.logging import get_logger

logger = get_logger(__name__)


async def migrate_sqlite_to_postgres(sqlite_path: str = "../../overlord.db"):
    """Migrate data from SQLite to PostgreSQL."""

    logger.info("migration_started", sqlite_path=sqlite_path)

    # Connect to SQLite
    try:
        sqlite_conn = sqlite3.connect(sqlite_path)
        sqlite_conn.row_factory = sqlite3.Row
        cursor = sqlite_conn.cursor()
        logger.info("sqlite_connected")
    except Exception as e:
        logger.error("sqlite_connection_failed", error=str(e))
        return

    # Connect to PostgreSQL
    settings = get_settings()
    engine = create_async_engine(settings.database_url_async)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("postgres_tables_created")

    # Fetch data from SQLite
    cursor.execute("SELECT * FROM system_stats ORDER BY timestamp")
    rows = cursor.fetchall()
    logger.info("sqlite_data_fetched", count=len(rows))

    if not rows:
        logger.warning("no_data_to_migrate")
        return

    # Migrate in batches
    batch_size = 1000
    migrated = 0
    errors = 0

    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with AsyncSessionLocal() as session:
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]

            for row in batch:
                try:
                    # Map SQLite columns to PostgreSQL model
                    stats = SystemStats(
                        created_at=(
                            datetime.fromisoformat(row["timestamp"])
                            if row["timestamp"]
                            else datetime.utcnow()
                        ),
                        cpu_percent=row.get("cpu_percent"),
                        memory_percent=row.get("memory_percent"),
                        memory_used_gb=row.get("memory_used_gb"),
                        memory_total_gb=row.get("memory_total_gb"),
                        disk_percent=row.get("disk_percent"),
                        disk_used_gb=row.get("disk_used_gb"),
                        disk_total_gb=row.get("disk_total_gb"),
                        network_sent_mb=row.get("network_sent_mb"),
                        network_recv_mb=row.get("network_recv_mb"),
                        gpu_percent=row.get("gpu_percent"),
                        gpu_memory_percent=row.get("gpu_memory_percent"),
                        gpu_temperature_c=row.get("temperature_c"),
                    )
                    session.add(stats)
                    migrated += 1
                except Exception as e:
                    logger.error(
                        "row_migration_failed", error=str(e), row_id=row.get("id")
                    )
                    errors += 1

            # Commit batch
            await session.commit()
            logger.info("batch_migrated", batch=i // batch_size + 1, count=len(batch))

    await engine.dispose()
    sqlite_conn.close()

    logger.info(
        "migration_completed",
        total_migrated=migrated,
        total_errors=errors,
        total_rows=len(rows),
    )

    print(f"\n✅ Migration Complete!")
    print(f"   Total rows: {len(rows)}")
    print(f"   Migrated: {migrated}")
    print(f"   Errors: {errors}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Migrate SQLite to PostgreSQL")
    parser.add_argument(
        "--sqlite-path",
        default="../../overlord.db",
        help="Path to SQLite database file",
    )

    args = parser.parse_args()

    asyncio.run(migrate_sqlite_to_postgres(args.sqlite_path))
