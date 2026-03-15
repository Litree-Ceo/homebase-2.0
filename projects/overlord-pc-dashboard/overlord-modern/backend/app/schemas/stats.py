"""System statistics schemas."""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


class Process(BaseModel):
    """Represents a single process in the process tree."""

    pid: int
    ppid: Optional[int] = None
    name: str
    cpu_percent: Optional[float] = None
    memory_mb: Optional[float] = None
    status: Optional[str] = None
    children: List["Process"] = Field(default_factory=list)


class SystemStatsBase(BaseModel):
    """Base system stats schema."""

    # CPU
    cpu_percent: Optional[float] = Field(None, ge=0, le=100)
    cpu_count_physical: Optional[int] = Field(None, ge=1)
    cpu_count_logical: Optional[int] = Field(None, ge=1)
    cpu_freq_mhz: Optional[float] = Field(None, ge=0)

    # Memory
    memory_percent: Optional[float] = Field(None, ge=0, le=100)
    memory_used_gb: Optional[float] = Field(None, ge=0)
    memory_total_gb: Optional[float] = Field(None, ge=0)
    memory_available_gb: Optional[float] = Field(None, ge=0)
    swap_percent: Optional[float] = Field(None, ge=0, le=100)

    # Disk
    disk_percent: Optional[float] = Field(None, ge=0, le=100)
    disk_used_gb: Optional[float] = Field(None, ge=0)
    disk_total_gb: Optional[float] = Field(None, ge=0)

    # Network
    network_sent_mb: Optional[float] = Field(None, ge=0)
    network_recv_mb: Optional[float] = Field(None, ge=0)

    # GPU
    gpu_percent: Optional[float] = Field(None, ge=0, le=100)
    gpu_memory_percent: Optional[float] = Field(None, ge=0, le=100)
    gpu_temperature_c: Optional[float] = Field(None, ge=0)

    # Services
    service_status: Optional[dict[str, bool]] = Field(default_factory=dict)

    # Processes
    processes: List[Process] = Field(default_factory=list)


class SystemStatsCreate(SystemStatsBase):
    """Schema for creating stats."""

    pass


class SystemStatsResponse(SystemStatsBase):
    """Schema for stats response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class HistoricalStats(BaseModel):
    """Historical statistics response."""

    timeframe: str = Field(..., pattern="^(1h|24h|7d|30d)$")
    data: list[SystemStatsResponse]
    aggregated: dict = Field(default_factory=dict)


class RealtimeStats(BaseModel):
    """Real-time stats from WebSocket."""

    cpu: float
    memory: float
    disk: float
    network_sent: float
    network_recv: float
    timestamp: datetime


class GPUInfo(BaseModel):
    """GPU information schema."""

    name: str
    percent: float
    memory_percent: float
    temperature_c: Optional[float]
    power_watts: Optional[float]
