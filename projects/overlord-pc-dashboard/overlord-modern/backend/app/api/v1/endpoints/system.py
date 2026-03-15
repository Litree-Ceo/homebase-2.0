"""System information endpoints."""

import platform
from datetime import datetime
from typing import Annotated

import psutil
from fastapi import APIRouter, Depends

from app.core.security import rate_limit
from app.schemas.stats import GPUInfo

router = APIRouter()


@router.get("/info", summary="Get system information")
async def get_system_info(api_key: Annotated[str, Depends(rate_limit)]):
    """Get detailed system information."""
    boot_time = datetime.fromtimestamp(psutil.boot_time())

    return {
        "platform": platform.platform(),
        "processor": platform.processor(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "cpu_count": psutil.cpu_count(),
        "boot_time": boot_time.isoformat(),
        "uptime_seconds": (datetime.now() - boot_time).total_seconds(),
    }


@router.get("/cpu", summary="Get CPU information")
async def get_cpu_info(api_key: Annotated[str, Depends(rate_limit)]):
    """Get detailed CPU information."""
    cpu_freq = psutil.cpu_freq()
    cpu_stats = psutil.cpu_stats()

    return {
        "physical_cores": psutil.cpu_count(logical=False),
        "total_cores": psutil.cpu_count(logical=True),
        "current_frequency_mhz": cpu_freq.current if cpu_freq else None,
        "min_frequency_mhz": cpu_freq.min if cpu_freq else None,
        "max_frequency_mhz": cpu_freq.max if cpu_freq else None,
        "ctx_switches": cpu_stats.ctx_switches,
        "interrupts": cpu_stats.interrupts,
        "soft_interrupts": cpu_stats.soft_interrupts,
        "syscalls": cpu_stats.syscalls,
    }


@router.get("/memory", summary="Get memory information")
async def get_memory_info(api_key: Annotated[str, Depends(rate_limit)]):
    """Get detailed memory information."""
    virtual = psutil.virtual_memory()
    swap = psutil.swap_memory()

    return {
        "virtual": {
            "total_gb": round(virtual.total / (1024**3), 2),
            "available_gb": round(virtual.available / (1024**3), 2),
            "used_gb": round(virtual.used / (1024**3), 2),
            "free_gb": round(virtual.free / (1024**3), 2),
            "percent": virtual.percent,
        },
        "swap": {
            "total_gb": round(swap.total / (1024**3), 2),
            "used_gb": round(swap.used / (1024**3), 2),
            "free_gb": round(swap.free / (1024**3), 2),
            "percent": swap.percent,
        },
    }


@router.get("/disk", summary="Get disk information")
async def get_disk_info(api_key: Annotated[str, Depends(rate_limit)]):
    """Get disk usage information for all partitions."""
    partitions = []

    for part in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(part.mountpoint)
            partitions.append(
                {
                    "device": part.device,
                    "mountpoint": part.mountpoint,
                    "fstype": part.fstype,
                    "total_gb": round(usage.total / (1024**3), 2),
                    "used_gb": round(usage.used / (1024**3), 2),
                    "free_gb": round(usage.free / (1024**3), 2),
                    "percent": usage.percent,
                }
            )
        except PermissionError:
            continue

    return {"partitions": partitions}


@router.get("/network", summary="Get network information")
async def get_network_info(api_key: Annotated[str, Depends(rate_limit)]):
    """Get network interface information."""
    counters = psutil.net_io_counters(pernic=True)
    interfaces = []

    for name, stats in counters.items():
        interfaces.append(
            {
                "name": name,
                "bytes_sent_mb": round(stats.bytes_sent / (1024**2), 2),
                "bytes_recv_mb": round(stats.bytes_recv / (1024**2), 2),
                "packets_sent": stats.packets_sent,
                "packets_recv": stats.packets_recv,
                "errors_in": stats.errin,
                "errors_out": stats.errout,
                "dropped_in": stats.dropin,
                "dropped_out": stats.dropout,
            }
        )

    return {"interfaces": interfaces}


@router.get("/gpu", summary="Get GPU information")
async def get_gpu_info(api_key: Annotated[str, Depends(rate_limit)]) -> list[GPUInfo]:
    """Get GPU information (NVIDIA/AMD)."""
    gpus = []

    # Try NVIDIA first
    try:
        import pynvml

        pynvml.nvmlInit()

        for i in range(pynvml.nvmlDeviceGetCount()):
            handle = pynvml.nvmlDeviceGetHandleByIndex(i)
            name = pynvml.nvmlDeviceGetName(handle)

            try:
                utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
                memory = pynvml.nvmlDeviceGetMemoryInfo(handle)
                temp = pynvml.nvmlDeviceGetTemperature(
                    handle, pynvml.NVML_TEMPERATURE_GPU
                )
                power = (
                    pynvml.nvmlDeviceGetPowerUsage(handle) / 1000
                )  # Convert to watts

                gpus.append(
                    GPUInfo(
                        name=name,
                        percent=utilization.gpu,
                        memory_percent=(memory.used / memory.total) * 100,
                        temperature_c=temp,
                        power_watts=power,
                    )
                )
            except Exception:
                continue

    except ImportError:
        pass

    return gpus
