"""System monitoring database models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Float, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SystemStats(Base):
    """System statistics snapshot."""

    __tablename__ = "system_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    # CPU Metrics
    cpu_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cpu_count_physical: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cpu_count_logical: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cpu_freq_mhz: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cpu_ctx_switches: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cpu_interrupts: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Memory Metrics
    memory_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    memory_used_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    memory_total_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    memory_available_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    swap_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    swap_used_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Disk Metrics
    disk_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    disk_used_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    disk_total_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    disk_free_gb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Network Metrics
    network_sent_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    network_recv_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    network_packets_sent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    network_packets_recv: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    network_errors_in: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    network_errors_out: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # GPU Metrics (NVIDIA/AMD)
    gpu_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gpu_memory_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gpu_memory_used_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gpu_memory_total_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gpu_temperature_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gpu_power_watts: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gpu_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # System Info
    boot_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    platform: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<SystemStats(id={self.id}, cpu={self.cpu_percent}%, time={self.created_at})>"


class HourlyStats(Base):
    """Aggregated hourly statistics for efficient querying."""

    __tablename__ = "hourly_stats"

    hour: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)

    # Aggregated CPU
    cpu_avg: Mapped[float] = mapped_column(Float, default=0)
    cpu_max: Mapped[float] = mapped_column(Float, default=0)
    cpu_min: Mapped[float] = mapped_column(Float, default=0)

    # Aggregated Memory
    memory_avg: Mapped[float] = mapped_column(Float, default=0)
    memory_max: Mapped[float] = mapped_column(Float, default=0)

    # Aggregated Disk
    disk_avg: Mapped[float] = mapped_column(Float, default=0)
    disk_max: Mapped[float] = mapped_column(Float, default=0)

    # Sample count
    sample_count: Mapped[int] = mapped_column(Integer, default=0)
