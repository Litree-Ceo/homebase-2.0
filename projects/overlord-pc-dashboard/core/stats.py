# core/stats.py
"""Core statistics collection module."""

import logging
import platform
import subprocess
from typing import Any, Dict, List, Optional, TypedDict

import psutil

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Type Definitions
# ─────────────────────────────────────────────────────────────────────────────


class DiskPartitionInfo(TypedDict):
    """Type definition for disk partition information."""

    device: str
    mountpoint: str
    fstype: str
    total_size: int
    used: int
    free: int
    percentage: float


class SystemStats(TypedDict):
    """Type definition for complete system statistics."""

    # System Info
    system: str
    node_name: str
    release: str
    version: str
    machine: str
    processor: str
    # CPU Info
    cpu_physical_cores: int
    cpu_total_cores: int
    cpu_freq_max: float
    cpu_freq_min: float
    cpu_freq_current: float
    cpu_usage_per_core: List[float]
    cpu_usage_total: float
    # Memory Info
    memory_total: int
    memory_available: int
    memory_used: int
    memory_percentage: float
    # Swap Memory
    swap_total: int
    swap_free: int
    swap_used: int
    swap_percentage: float
    # Disk Info
    disks: List[DiskPartitionInfo]
    # Network Info
    net_total_sent: int
    net_total_received: int
    # GPU Info
    gpu: "GPUStats"


class GPUDeviceInfo(TypedDict, total=False):
    """Type definition for a single GPU device."""

    index: int
    name: str
    temperature_c: int
    utilization_percent: int
    memory_total_mb: int
    memory_used_mb: int
    memory_free_mb: int
    # Additional fields for non-NVIDIA GPUs
    raw_output: str


class GPUStats(TypedDict):
    """Type definition for GPU statistics."""

    available: bool
    devices: List[GPUDeviceInfo]


def get_gpu_stats() -> GPUStats:
    """Get GPU stats using nvidia-smi."""
    stats: GPUStats = {"available": False, "devices": []}
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=index,name,temperature.gpu,utilization.gpu,memory.total,memory.used,memory.free",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        stats["available"] = True
        gpus = result.stdout.strip().split("\n")
        for gpu_line in gpus:
            if not gpu_line:
                continue
            parts = [p.strip() for p in gpu_line.split(",")]
            stats["devices"].append(
                {
                    "index": int(parts[0]),
                    "name": parts[1],
                    "temperature_c": int(parts[2]),
                    "utilization_percent": int(parts[3]),
                    "memory_total_mb": int(parts[4]),
                    "memory_used_mb": int(parts[5]),
                    "memory_free_mb": int(parts[6]),
                }
            )
    except (FileNotFoundError, subprocess.CalledProcessError) as e:
        # Check for ROCm for AMD GPUs
        try:
            result = subprocess.run(
                ["rocm-smi", "--showuse", "--showtemp", "--showmeminfo", "VRAM"],
                capture_output=True,
                text=True,
                check=True,
            )
            stats["available"] = True
            # Basic parsing for rocm-smi, can be improved
            stats["devices"].append(
                {"name": "AMD GPU (ROCm)", "raw_output": result.stdout}
            )
        except (FileNotFoundError, subprocess.CalledProcessError) as rocm_e:
            if isinstance(e, FileNotFoundError):
                logger.debug(
                    "nvidia-smi not found. NVIDIA GPU monitoring not available."
                )
            else:
                logger.warning(f"Error running nvidia-smi: {e}")
            if isinstance(rocm_e, FileNotFoundError):
                logger.debug("rocm-smi not found. AMD GPU monitoring not available.")
            else:
                logger.warning(f"Error running rocm-smi: {rocm_e}")
            stats["available"] = False

    return stats


def get_system_stats(config: Optional[Dict[str, Any]] = None) -> SystemStats:
    """Gather comprehensive system statistics.

    Args:
        config: Optional configuration dictionary.

    Returns:
        SystemStats TypedDict containing all system metrics.
    """
    if config is None:
        config = {}

    uname = platform.uname()
    swap = psutil.swap_memory()
    net_io = psutil.net_io_counters()

    stats: SystemStats = {
        # System Info
        "system": uname.system,
        "node_name": uname.node,
        "release": uname.release,
        "version": uname.version,
        "machine": uname.machine,
        "processor": uname.processor,
        # CPU Info
        "cpu_physical_cores": psutil.cpu_count(logical=False) or 0,
        "cpu_total_cores": psutil.cpu_count(logical=True) or 0,
        "cpu_freq_max": psutil.cpu_freq().max if psutil.cpu_freq() else 0.0,
        "cpu_freq_min": psutil.cpu_freq().min if psutil.cpu_freq() else 0.0,
        "cpu_freq_current": psutil.cpu_freq().current if psutil.cpu_freq() else 0.0,
        "cpu_usage_per_core": psutil.cpu_percent(percpu=True, interval=1),
        "cpu_usage_total": psutil.cpu_percent(),
        # Memory Info
        "memory_total": psutil.virtual_memory().total,
        "memory_available": psutil.virtual_memory().available,
        "memory_used": psutil.virtual_memory().used,
        "memory_percentage": psutil.virtual_memory().percent,
        # Swap Memory
        "swap_total": swap.total,
        "swap_free": swap.free,
        "swap_used": swap.used,
        "swap_percentage": swap.percent,
        # Disk Info
        "disks": [
            {
                "device": p.device,
                "mountpoint": p.mountpoint,
                "fstype": p.fstype,
                "total_size": psutil.disk_usage(p.mountpoint).total,
                "used": psutil.disk_usage(p.mountpoint).used,
                "free": psutil.disk_usage(p.mountpoint).free,
                "percentage": psutil.disk_usage(p.mountpoint).percent,
            }
            for p in psutil.disk_partitions()
        ],
        # Network Info
        "net_total_sent": net_io.bytes_sent,
        "net_total_received": net_io.bytes_recv,
        # GPU Info
        "gpu": get_gpu_stats(),
    }

    return stats
