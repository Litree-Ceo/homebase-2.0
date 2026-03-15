"""Tests for health check endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test basic health endpoint."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_detailed_health(client: AsyncClient):
    """Test detailed health check."""
    response = await client.get("/api/v1/health/detailed")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "unhealthy"]
    assert "checks" in data
    assert "database" in data["checks"]


@pytest.mark.asyncio
async def test_readiness_probe(client: AsyncClient):
    """Test Kubernetes readiness probe."""
    response = await client.get("/api/v1/health/ready")

    assert response.status_code == 200
    data = response.json()
    assert "ready" in data


@pytest.mark.asyncio
async def test_liveness_probe(client: AsyncClient):
    """Test Kubernetes liveness probe."""
    response = await client.get("/api/v1/health/live")

    assert response.status_code == 200
    data = response.json()
    assert data["alive"] is True
