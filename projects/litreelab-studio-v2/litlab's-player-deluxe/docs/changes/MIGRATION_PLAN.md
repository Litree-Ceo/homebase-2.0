# Overlord PC Dashboard — Migration Plan

> **Target Stack:** React 18 + TypeScript + FastAPI + PostgreSQL  
> **Migration Type:** Incremental (Phased Approach)  
> **Estimated Duration:** 4-6 weeks  
> **Risk Level:** Medium

---

## Executive Summary

This document outlines the migration strategy from the current vanilla JS/Python stack to a modern, type-safe, scalable architecture using:

| Component | Current | Target |
|-----------|---------|--------|
| Frontend | Vanilla JS + React CDN | React 18 + TypeScript + Vite |
| Backend | Custom http.server | FastAPI + Pydantic |
| Database | SQLite | PostgreSQL |
| ORM | Raw SQL | SQLAlchemy 2.0 + Alembic |
| API Docs | Manual | Auto-generated OpenAPI |
| Testing | Manual | Pytest + Vitest |

---

## Phase 1: Foundation (Week 1)

### 1.1 Project Structure Setup

```
overlord-modern/
├── 📁 backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Pydantic settings
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # API routes
│   │   ├── services/            # Business logic
│   │   └── core/                # Security, logging
│   ├── alembic/                 # Migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── 📁 frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client
│   │   ├── store/               # Zustand/Redux
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── 📁 shared/
│   └── types/                   # Shared TypeScript types
│
├── docker-compose.yml
├── .env.example
└── Makefile
```

### 1.2 Backend Setup (FastAPI)

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import Settings
from app.database import engine, init_db
from app.api.v1.router import api_router

settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="Overlord PC Dashboard API",
    version="5.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "5.0.0"}
```

### 1.3 Configuration (Pydantic)

```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://user:pass@localhost/overlord"
    
    # Security
    secret_key: str
    api_key: str
    access_token_expire_minutes: int = 30
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]
    
    # Features
    enable_realdebrid: bool = False
    rd_api_key: str | None = None
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### 1.4 Database Models (SQLAlchemy 2.0)

```python
# backend/app/models/system.py
from datetime import datetime
from sqlalchemy import Float, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class SystemStats(Base):
    __tablename__ = "system_stats"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow,
        index=True
    )
    
    # CPU
    cpu_percent: Mapped[float | None] = mapped_column(Float)
    cpu_count: Mapped[int | None] = mapped_column(Integer)
    cpu_freq_mhz: Mapped[float | None] = mapped_column(Float)
    
    # Memory
    memory_percent: Mapped[float | None] = mapped_column(Float)
    memory_used_gb: Mapped[float | None] = mapped_column(Float)
    memory_total_gb: Mapped[float | None] = mapped_column(Float)
    
    # Disk
    disk_percent: Mapped[float | None] = mapped_column(Float)
    disk_used_gb: Mapped[float | None] = mapped_column(Float)
    disk_total_gb: Mapped[float | None] = mapped_column(Float)
    
    # Network
    network_sent_mb: Mapped[float | None] = mapped_column(Float)
    network_recv_mb: Mapped[float | None] = mapped_column(Float)
    
    # GPU
    gpu_percent: Mapped[float | None] = mapped_column(Float)
    gpu_memory_percent: Mapped[float | None] = mapped_column(Float)
    gpu_temp_c: Mapped[float | None] = mapped_column(Float)
```

### 1.5 Pydantic Schemas

```python
# backend/app/schemas/stats.py
from datetime import datetime
from pydantic import BaseModel, Field

class SystemStatsBase(BaseModel):
    cpu_percent: float | None = Field(None, ge=0, le=100)
    cpu_count: int | None = Field(None, ge=1)
    memory_percent: float | None = Field(None, ge=0, le=100)
    memory_used_gb: float | None = Field(None, ge=0)
    disk_percent: float | None = Field(None, ge=0, le=100)
    network_sent_mb: float | None = Field(None, ge=0)
    network_recv_mb: float | None = Field(None, ge=0)

class SystemStatsCreate(SystemStatsBase):
    pass

class SystemStatsResponse(SystemStatsBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class HistoricalStats(BaseModel):
    timeframe: str  # "1h", "24h", "7d", "30d"
    data: list[SystemStatsResponse]
    aggregated: dict | None = None
```

---

## Phase 2: API Implementation (Week 2)

### 2.1 API Routes

```python
# backend/app/api/v1/endpoints/stats.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.database import get_db
from app.schemas.stats import SystemStatsResponse, HistoricalStats
from app.services.stats import StatsService
from app.core.security import verify_api_key

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/current", response_model=SystemStatsResponse)
async def get_current_stats(
    api_key: Annotated[str, Depends(verify_api_key)],
    db: AsyncSession = Depends(get_db)
):
    """Get current system statistics."""
    service = StatsService(db)
    stats = await service.get_current()
    if not stats:
        raise HTTPException(404, "No stats available")
    return stats

@router.get("/history", response_model=HistoricalStats)
async def get_historical_stats(
    api_key: Annotated[str, Depends(verify_api_key)],
    timeframe: str = Query("24h", regex="^(1h|24h|7d|30d)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get historical system statistics."""
    service = StatsService(db)
    return await service.get_history(timeframe)
```

### 2.2 Service Layer

```python
# backend/app/services/stats.py
from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.system import SystemStats
from app.schemas.stats import SystemStatsCreate

class StatsService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_current(self) -> SystemStats | None:
        result = await self.db.execute(
            select(SystemStats)
            .order_by(SystemStats.timestamp.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_history(self, timeframe: str) -> dict:
        # Calculate time range
        ranges = {
            "1h": timedelta(hours=1),
            "24h": timedelta(days=1),
            "7d": timedelta(days=7),
            "30d": timedelta(days=30)
        }
        cutoff = datetime.utcnow() - ranges[timeframe]
        
        result = await self.db.execute(
            select(SystemStats)
            .where(SystemStats.timestamp >= cutoff)
            .order_by(SystemStats.timestamp.asc())
        )
        
        stats = result.scalars().all()
        
        # Calculate aggregations
        if stats:
            avg_cpu = sum(s.cpu_percent for s in stats if s.cpu_percent) / len(stats)
            max_cpu = max((s.cpu_percent for s in stats if s.cpu_percent), default=0)
        else:
            avg_cpu = max_cpu = 0
        
        return {
            "timeframe": timeframe,
            "data": stats,
            "aggregated": {
                "avg_cpu": round(avg_cpu, 2),
                "max_cpu": round(max_cpu, 2),
                "count": len(stats)
            }
        }
    
    async def record_stats(self, stats: SystemStatsCreate) -> SystemStats:
        db_stats = SystemStats(**stats.model_dump())
        self.db.add(db_stats)
        await self.db.commit()
        await self.db.refresh(db_stats)
        return db_stats
```

### 2.3 WebSocket Implementation

```python
# backend/app/core/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Set
import json
import asyncio
import psutil

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket, token: str):
        # Validate token
        if token != settings.websocket_token:
            await websocket.close(code=4001, reason="Invalid token")
            return False
        
        await websocket.accept()
        self.active_connections.add(websocket)
        return True
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
    
    async def broadcast(self, message: dict):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.add(connection)
        
        for conn in disconnected:
            self.active_connections.discard(conn)

manager = ConnectionManager()

async def stats_websocket(websocket: WebSocket, token: str):
    if not await manager.connect(websocket, token):
        return
    
    try:
        while True:
            # Collect and send stats every 5 seconds
            stats = {
                "cpu": psutil.cpu_percent(interval=0.1),
                "memory": psutil.virtual_memory().percent,
                "timestamp": datetime.utcnow().isoformat()
            }
            await websocket.send_json(stats)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

---

## Phase 3: Frontend Implementation (Week 3)

### 3.1 TypeScript Types

```typescript
// frontend/src/types/stats.ts
export interface SystemStats {
  id: number;
  timestamp: string;
  cpuPercent: number | null;
  cpuCount: number | null;
  memoryPercent: number | null;
  memoryUsedGb: number | null;
  memoryTotalGb: number | null;
  diskPercent: number | null;
  diskUsedGb: number | null;
  networkSentMb: number | null;
  networkRecvMb: number | null;
  gpuPercent: number | null;
}

export interface HistoricalStats {
  timeframe: '1h' | '24h' | '7d' | '30d';
  data: SystemStats[];
  aggregated: {
    avgCpu: number;
    maxCpu: number;
    count: number;
  };
}

export interface WebSocketMessage {
  type: 'stats' | 'error' | 'auth';
  data: unknown;
}
```

### 3.2 API Client

```typescript
// frontend/src/services/api.ts
import axios, { AxiosInstance } from 'axios';
import { SystemStats, HistoricalStats } from '../types/stats';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add auth header
    this.client.interceptors.request.use((config) => {
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
      }
      return config;
    });
  }
  
  async getCurrentStats(): Promise<SystemStats> {
    const response = await this.client.get('/stats/current');
    return response.data;
  }
  
  async getHistoricalStats(timeframe: string): Promise<HistoricalStats> {
    const response = await this.client.get('/stats/history', {
      params: { timeframe }
    });
    return response.data;
  }
  
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const api = new ApiClient();
```

### 3.3 React Components

```tsx
// frontend/src/components/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStats } from '../../hooks/useStats';
import { useWebSocket } from '../../hooks/useWebSocket';
import { StatCard } from './StatCard';
import { SystemStats } from '../../types/stats';

export const Dashboard: React.FC = () => {
  const { currentStats, historicalStats, loading, error } = useStats();
  const { liveStats, connected } = useWebSocket();
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  // Merge REST data with live WebSocket updates
  const displayStats = liveStats || currentStats;
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Overlord Dashboard</h1>
        <div className="connection-status">
          {connected ? '🟢 Live' : '🔴 Offline'}
        </div>
      </header>
      
      <div className="stats-grid">
        <StatCard
          title="CPU Usage"
          value={`${displayStats?.cpuPercent?.toFixed(1) || 0}%`}
          trend={historicalStats?.aggregated.avgCpu}
          color="#00d4ff"
        />
        <StatCard
          title="Memory"
          value={`${displayStats?.memoryPercent?.toFixed(1) || 0}%`}
          subtitle={`${displayStats?.memoryUsedGb?.toFixed(1) || 0} GB used`}
          color="#ff6b6b"
        />
        <StatCard
          title="Disk"
          value={`${displayStats?.diskPercent?.toFixed(1) || 0}%`}
          color="#4ecdc4"
        />
      </div>
      
      <div className="chart-container">
        <div className="timeframe-selector">
          {(['1h', '24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              className={timeframe === tf ? 'active' : ''}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalStats?.data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              stroke="#666"
            />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ background: '#1e1e2f', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="cpuPercent" 
              stroke="#00d4ff" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="memoryPercent" 
              stroke="#ff6b6b" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

### 3.4 Custom Hooks

```typescript
// frontend/src/hooks/useStats.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { SystemStats, HistoricalStats } from '../types/stats';

interface UseStatsReturn {
  currentStats: SystemStats | null;
  historicalStats: HistoricalStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStats = (timeframe: string = '24h'): UseStatsReturn => {
  const [currentStats, setCurrentStats] = useState<SystemStats | null>(null);
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [current, history] = await Promise.all([
        api.getCurrentStats(),
        api.getHistoricalStats(timeframe)
      ]);
      setCurrentStats(current);
      setHistoricalStats(history);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);
  
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);
  
  return { currentStats, historicalStats, loading, error, refetch: fetchStats };
};
```

```typescript
// frontend/src/hooks/useWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemStats } from '../types/stats';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

interface UseWebSocketReturn {
  liveStats: SystemStats | null;
  connected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [liveStats, setLiveStats] = useState<SystemStats | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(() => {
    const token = localStorage.getItem('wsToken');
    if (!token) {
      setError('No WebSocket token available');
      return;
    }
    
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    
    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stats') {
          setLiveStats(data.data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    
    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };
    
    ws.onerror = (err) => {
      setError('WebSocket error');
      setConnected(false);
    };
    
    wsRef.current = ws;
  }, []);
  
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);
  
  return {
    liveStats,
    connected,
    error,
    reconnect: connect
  };
};
```

---

## Phase 4: Docker & DevOps (Week 4)

### 4.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: overlord
      POSTGRES_PASSWORD: ${DB_PASSWORD:-overlord}
      POSTGRES_DB: overlord
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U overlord"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://overlord:${DB_PASSWORD:-overlord}@postgres/overlord
      SECRET_KEY: ${SECRET_KEY}
      API_KEY: ${API_KEY}
      CORS_ORIGINS: '["http://localhost:5173"]'
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000/api/v1
      VITE_WS_URL: ws://localhost:8000/ws
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  # Data collector service
  collector:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://overlord:${DB_PASSWORD:-overlord}@postgres/overlord
    depends_on:
      - postgres
    command: python -m app.collector  # Background stats collector

volumes:
  postgres_data:
```

### 4.2 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4.3 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

---

## Phase 5: Testing & Quality (Week 5)

### 5.1 Backend Tests

```python
# backend/tests/test_stats.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.system import SystemStats

@pytest.mark.asyncio
async def test_get_current_stats(client: AsyncClient, db: AsyncSession):
    # Create test data
    stats = SystemStats(cpu_percent=50.0, memory_percent=60.0)
    db.add(stats)
    await db.commit()
    
    response = await client.get(
        "/api/v1/stats/current",
        headers={"X-API-Key": "test-key"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["cpu_percent"] == 50.0
    assert data["memory_percent"] == 60.0

@pytest.mark.asyncio
async def test_get_history(client: AsyncClient):
    response = await client.get(
        "/api/v1/stats/history?timeframe=24h",
        headers={"X-API-Key": "test-key"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["timeframe"] == "24h"
    assert "data" in data
    assert "aggregated" in data
```

### 5.2 Frontend Tests

```typescript
// frontend/src/components/Dashboard/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useStats } from '../../hooks/useStats';

// Mock the hooks
jest.mock('../../hooks/useStats');
jest.mock('../../hooks/useWebSocket');

describe('Dashboard', () => {
  it('renders loading state', () => {
    (useStats as jest.Mock).mockReturnValue({
      currentStats: null,
      historicalStats: null,
      loading: true,
      error: null
    });
    
    render(<Dashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('renders stats correctly', async () => {
    (useStats as jest.Mock).mockReturnValue({
      currentStats: {
        cpuPercent: 45.5,
        memoryPercent: 60.2,
        diskPercent: 30.0
      },
      historicalStats: {
        timeframe: '24h',
        data: [],
        aggregated: { avgCpu: 40, maxCpu: 80, count: 100 }
      },
      loading: false,
      error: null
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('45.5%')).toBeInTheDocument();
      expect(screen.getByText('60.2%')).toBeInTheDocument();
    });
  });
});
```

---

## Phase 6: Migration & Rollout (Week 6)

### 6.1 Data Migration

```python
# migration_scripts/sqlite_to_postgres.py
import sqlite3
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.system import SystemStats

async def migrate():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect('overlord.db')
    sqlite_conn.row_factory = sqlite3.Row
    
    # Connect to PostgreSQL
    engine = create_async_engine('postgresql+asyncpg://...')
    
    # Fetch all SQLite data
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM system_stats")
    rows = cursor.fetchall()
    
    # Insert into PostgreSQL
    async with engine.begin() as conn:
        for row in rows:
            stats = SystemStats(
                timestamp=row['timestamp'],
                cpu_percent=row['cpu_percent'],
                memory_percent=row['memory_percent'],
                # ... map all fields
            )
            conn.add(stats)
    
    print(f"Migrated {len(rows)} records")

if __name__ == '__main__':
    asyncio.run(migrate())
```

### 6.2 Feature Flags

```python
# backend/app/core/feature_flags.py
from functools import lru_cache

class FeatureFlags:
    USE_NEW_API: bool = True
    ENABLE_WEBSOCKET: bool = True
    ENABLE_REALDEBRID: bool = False
    
    @classmethod
    def is_enabled(cls, flag: str) -> bool:
        return getattr(cls, flag, False)

# Usage
if FeatureFlags.is_enabled('USE_NEW_API'):
    return await new_api_handler()
else:
    return await legacy_handler()
```

### 6.3 Rollback Plan

```bash
#!/bin/bash
# rollback.sh

echo "Rolling back to legacy version..."

# Stop new services
docker-compose down

# Start legacy server
cd /opt/overlord-legacy
python server.py &
python scripts/overlord_bridge.py &

echo "Rollback complete. Legacy server running."
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup all SQLite databases
- [ ] Document current API usage
- [ ] Set up feature flags
- [ ] Create rollback scripts
- [ ] Notify users of maintenance window

### During Migration
- [ ] Deploy PostgreSQL
- [ ] Run data migration scripts
- [ ] Deploy new backend with feature flag off
- [ ] Verify data integrity
- [ ] Enable feature flag gradually (canary)
- [ ] Monitor error rates

### Post-Migration
- [ ] Update documentation
- [ ] Deprecate old endpoints
- [ ] Remove feature flags after 2 weeks
- [ ] Archive legacy code

---

## Success Metrics

| Metric | Target |
|--------|--------|
| API Response Time | < 100ms p95 |
| WebSocket Latency | < 50ms |
| Test Coverage | > 80% |
| Type Safety | 100% TypeScript |
| Uptime | > 99.9% |
| Error Rate | < 0.1% |

---

## Resources

- **FastAPI Best Practices:** https://auth0.com/blog/fastapi-best-practices/
- **Full Stack FastAPI Template:** https://github.com/fastapi/full-stack-fastapi-template
- **React Dashboard UI:** https://www.untitledui.com/blog/react-dashboards
- **SQLAlchemy 2.0:** https://docs.sqlalchemy.org/en/20/

---

**End of Migration Plan**
