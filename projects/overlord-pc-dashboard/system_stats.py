# cspell:ignore mbps, noheader, nounits, rocm
"""System statistics collection for Overlord.

This module re-exports from core.stats for backward compatibility.
The canonical implementation is in core/stats.py.
"""

import logging
import os
import platform
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict, Union

# Add project root to allow importing from core
sys.path.insert(0, str(Path(__file__).parent))


import psutil

# Use core logger for consistency and security sanitization
try:
    from core import get_logger

    logger = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    logger = logging.getLogger(__name__)

# Re-export from core.stats for backward compatibility
from core.stats import get_gpu_stats
from core.stats import get_system_stats as _core_get_system_stats


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
    gpu: Dict[str, Any]


def get_size(bts: Union[int, float], suffix: str = "B") -> str:
    """Scale bytes to a readable format (e.g., KB, MB, GB).

    Args:
        bts: Number of bytes to format.
        suffix: Unit suffix to append (default: "B").

    Returns:
        Formatted string with appropriate unit prefix.
    """
    factor = 1024.0
    for unit in ["", "K", "M", "G", "T", "P"]:
        if bts < factor:
            return f"{bts:.2f}{unit}{suffix}"
        bts /= factor
    return f"{bts:.2f}P{suffix}"


# Re-export from core.stats for backward compatibility
# The canonical implementation is in core/stats.py
get_system_stats = _core_get_system_stats


if __name__ == "__main__":
    import json

    logger.setLevel(logging.DEBUG)
    # Add a stream handler to see output in console
    if not any(isinstance(h, logging.StreamHandler) for h in logger.handlers):
        logger.addHandler(logging.StreamHandler())

    try:
        # Use the re-exported function from core.stats
        system_info = _core_get_system_stats()
        print(json.dumps(system_info, indent=4))
    except Exception:
        logger.exception("Failed to get system stats")
