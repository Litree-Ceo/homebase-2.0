# overlord-modern/backend/app/core/stats.py
"""Core statistics collection module."""

import logging
import subprocess
from typing import Any, Dict

logger = logging.getLogger(__name__)

def get_gpu_stats() -> Dict[str, Any]:
    """Get GPU stats using nvidia-smi."""
    stats: Dict[str, Any] = {"available": False, "devices": []}
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
