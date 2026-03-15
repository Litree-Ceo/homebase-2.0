"""Statistics API endpoints."""

from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.stats import HistoricalStats, SystemStatsResponse, SystemStatsCreate
from app.services.stats import StatsService
from app.core.security import verify_api_key, rate_limit

router = APIRouter()


@router.get(
    "/current",
    response_model=SystemStatsResponse,
    summary="Get current system statistics",
    description="Returns the most recent system statistics snapshot.",
)
async def get_current_stats(
    api_key: Annotated[str, Depends(rate_limit)], db: AsyncSession = Depends(get_db)
):
    """Get current system statistics."""
    service = StatsService(db)
    stats = await service.get_current()

    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No statistics available. The collector may not be running.",
        )

    return stats


@router.get(
    "/history",
    response_model=HistoricalStats,
    summary="Get historical statistics",
    description="Returns historical system statistics for the specified timeframe.",
)
async def get_historical_stats(
    api_key: Annotated[str, Depends(rate_limit)],
    timeframe: str = Query(
        "24h", pattern="^(1h|24h|7d|30d)$", description="Time range for historical data"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get historical system statistics."""
    service = StatsService(db)
    return await service.get_history(timeframe)


@router.get(
    "/summary",
    summary="Get statistics summary",
    description="Returns aggregated statistics summary for the dashboard.",
)
async def get_stats_summary(
    api_key: Annotated[str, Depends(rate_limit)], db: AsyncSession = Depends(get_db)
):
    """Get summary statistics for dashboard."""
    service = StatsService(db)

    # Get last 24 hours of data
    summary = await service.get_summary(hours=24)

    return {"period": "24h", **summary}


@router.post(
    "/",
    response_model=SystemStatsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record system statistics",
    description="Record a new system statistics snapshot. (Internal use)",
)
async def record_stats(
    stats: SystemStatsCreate,
    api_key: Annotated[str, Depends(verify_api_key)],
    db: AsyncSession = Depends(get_db),
):
    """Record new system statistics."""
    service = StatsService(db)
    return await service.record_stats(stats)
