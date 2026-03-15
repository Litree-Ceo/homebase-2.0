"""Statistics service."""

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.system import SystemStats
from app.schemas.stats import SystemStatsCreate
from app.core.logging import get_logger

logger = get_logger(__name__)


class StatsService:
    """Service for system statistics operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_current(self) -> Optional[SystemStats]:
        """Get the most recent system statistics."""
        result = await self.db.execute(
            select(SystemStats).order_by(desc(SystemStats.created_at)).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_history(self, timeframe: str, limit: Optional[int] = None) -> dict:
        """Get historical statistics."""
        # Calculate time range
        now = datetime.utcnow()
        ranges = {
            "1h": timedelta(hours=1),
            "24h": timedelta(days=1),
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
        }

        cutoff = now - ranges.get(timeframe, timedelta(hours=24))

        # Build query
        query = (
            select(SystemStats)
            .where(SystemStats.created_at >= cutoff)
            .order_by(SystemStats.created_at.asc())
        )

        if limit:
            query = query.limit(limit)

        result = await self.db.execute(query)
        stats = result.scalars().all()

        # Calculate aggregations
        if stats:
            cpu_values = [s.cpu_percent for s in stats if s.cpu_percent is not None]
            memory_values = [
                s.memory_percent for s in stats if s.memory_percent is not None
            ]

            aggregated = {
                "cpu_avg": (
                    round(sum(cpu_values) / len(cpu_values), 2) if cpu_values else 0
                ),
                "cpu_max": round(max(cpu_values), 2) if cpu_values else 0,
                "cpu_min": round(min(cpu_values), 2) if cpu_values else 0,
                "memory_avg": (
                    round(sum(memory_values) / len(memory_values), 2)
                    if memory_values
                    else 0
                ),
                "memory_max": round(max(memory_values), 2) if memory_values else 0,
                "sample_count": len(stats),
            }
        else:
            aggregated = {
                "cpu_avg": 0,
                "cpu_max": 0,
                "cpu_min": 0,
                "memory_avg": 0,
                "memory_max": 0,
                "sample_count": 0,
            }

        return {
            "timeframe": timeframe,
            "data": stats,
            "aggregated": aggregated,
            "from": cutoff.isoformat(),
            "to": now.isoformat(),
        }

    async def record_stats(self, stats: SystemStatsCreate) -> SystemStats:
        """Record new system statistics."""
        db_stats = SystemStats(**stats.model_dump(exclude_unset=True))
        self.db.add(db_stats)
        await self.db.commit()
        await self.db.refresh(db_stats)

        logger.debug("stats_recorded", stats_id=db_stats.id)
        return db_stats

    async def get_summary(self, hours: int = 24) -> dict:
        """Get summary statistics for a period."""
        cutoff = datetime.utcnow() - timedelta(hours=hours)

        # Get aggregate statistics
        result = await self.db.execute(
            select(
                func.avg(SystemStats.cpu_percent).label("avg_cpu"),
                func.max(SystemStats.cpu_percent).label("max_cpu"),
                func.avg(SystemStats.memory_percent).label("avg_memory"),
                func.max(SystemStats.memory_percent).label("max_memory"),
                func.avg(SystemStats.disk_percent).label("avg_disk"),
                func.count().label("count"),
            ).where(SystemStats.created_at >= cutoff)
        )

        row = result.one()

        # Get latest reading
        latest = await self.get_current()

        return {
            "period_hours": hours,
            "latest": {
                "cpu": latest.cpu_percent if latest else None,
                "memory": latest.memory_percent if latest else None,
                "disk": latest.disk_percent if latest else None,
                "timestamp": latest.created_at.isoformat() if latest else None,
            },
            "aggregates": {
                "cpu_avg": round(row.avg_cpu, 2) if row.avg_cpu else 0,
                "cpu_max": round(row.max_cpu, 2) if row.max_cpu else 0,
                "memory_avg": round(row.avg_memory, 2) if row.avg_memory else 0,
                "memory_max": round(row.max_memory, 2) if row.max_memory else 0,
                "disk_avg": round(row.avg_disk, 2) if row.avg_disk else 0,
                "sample_count": row.count,
            },
        }

    async def cleanup_old_data(self, retention_days: int = 30) -> int:
        """Remove statistics older than retention period."""
        cutoff = datetime.utcnow() - timedelta(days=retention_days)

        result = await self.db.execute(
            select(SystemStats).where(SystemStats.created_at < cutoff)
        )
        old_stats = result.scalars().all()

        count = len(old_stats)
        for stat in old_stats:
            await self.db.delete(stat)

        await self.db.commit()

        logger.info("old_stats_cleaned", deleted_count=count, cutoff=cutoff)
        return count
