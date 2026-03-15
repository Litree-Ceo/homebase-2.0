"""
Background data collector for system statistics.
Runs as a separate service to continuously collect and store metrics.
"""

import asyncio
import signal
import sys
from datetime import datetime

import httpx
import psutil

try:
    import pynvml
except ImportError:
    try:
        import nvidia_smi as pynvml
    except ImportError:
        pynvml = None

from app.config import get_settings
from app.core.logging import get_logger
from app.schemas.stats import Process, SystemStatsCreate

logger = get_logger(__name__)

from app.core.stats import get_gpu_stats

settings = get_settings()


def get_process_tree() -> list[Process]:
    """
    Collects all running processes and organizes them into a hierarchical tree.

    Returns:
        A list of root Process objects, each containing their children.
    """
    processes = {}
    # First pass: collect all processes
    for proc in psutil.process_iter(['pid', 'ppid', 'name', 'cpu_percent', 'memory_info', 'status']):
        try:
            pinfo = proc.info
            # cpu_percent can be None on first call
            cpu_percent = pinfo.get('cpu_percent')
            if cpu_percent is None:
                # Get a non-blocking cpu_percent reading
                cpu_percent = proc.cpu_percent(interval=0)


            processes[pinfo['pid']] = Process(
                pid=pinfo['pid'],
                ppid=pinfo.get('ppid'),
                name=pinfo.get('name') or "Unknown",
                cpu_percent=round(cpu_percent, 2) if cpu_percent is not None else 0.0,
                memory_mb=round(pinfo['memory_info'].rss / (1024 * 1024), 2) if pinfo.get('memory_info') else 0.0,
                status=pinfo.get('status') or "Unknown",
                children=[]
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # Second pass: build the tree
    root_processes = []
    for pid, process_obj in processes.items():
        ppid = process_obj.ppid
        if ppid and ppid in processes:
            processes[ppid].children.append(process_obj)
        else:
            # No parent in our list, so it's a root process
            root_processes.append(process_obj)

    return root_processes


async def collect_service_status() -> dict[str, bool]:
    """Check the status of services defined in settings."""
    status = {}
    for service_name in settings.services_to_monitor:
        is_running = False
        for proc in psutil.process_iter(["name"]):
            if proc.info["name"] == service_name:
                is_running = True
                break
        status[service_name] = is_running
    return status


async def collect_system_stats() -> SystemStatsCreate:
    """Collect current system statistics."""
    # CPU
    cpu_percent = psutil.cpu_percent(interval=0.1)
    cpu_count_physical = psutil.cpu_count(logical=False)
    cpu_count_logical = psutil.cpu_count(logical=True)
    cpu_freq = psutil.cpu_freq()
    cpu_stats = psutil.cpu_stats()

    # Memory
    virtual = psutil.virtual_memory()
    swap = psutil.swap_memory()

    # Disk
    disk = psutil.disk_usage("/")

    # Network
    net_io = psutil.net_io_counters()

    # GPU (optional)
    gpu_stats = get_gpu_stats()
    gpu_percent = None
    gpu_memory_percent = None
    gpu_temperature_c = None

    if gpu_stats["available"] and gpu_stats["devices"]:
        # Use the first device for summary stats
        device = gpu_stats["devices"][0]
        gpu_percent = device.get("utilization_percent")
        gpu_temperature_c = device.get("temperature_c")
        if device.get("memory_total_mb") and device.get("memory_used_mb"):
            gpu_memory_percent = (
                device["memory_used_mb"] / device["memory_total_mb"]
            ) * 100


    return SystemStatsCreate(
        cpu_percent=cpu_percent,
        cpu_count_physical=cpu_count_physical,
        cpu_count_logical=cpu_count_logical,
        cpu_freq_mhz=cpu_freq.current if cpu_freq else None,
        cpu_ctx_switches=cpu_stats.ctx_switches,
        cpu_interrupts=cpu_stats.interrupts,
        memory_percent=virtual.percent,
        memory_used_gb=round(virtual.used / (1024**3), 2),
        memory_total_gb=round(virtual.total / (1024**3), 2),
        memory_available_gb=round(virtual.available / (1024**3), 2),
        swap_percent=swap.percent,
        swap_used_gb=round(swap.used / (1024**3), 2),
        disk_percent=disk.percent,
        disk_used_gb=round(disk.used / (1024**3), 2),
        disk_total_gb=round(disk.total / (1024**3), 2),
        disk_free_gb=round(disk.free / (1024**3), 2),
        network_sent_mb=round(net_io.bytes_sent / (1024**2), 2),
        network_recv_mb=round(net_io.bytes_recv / (1024**2), 2),
        network_packets_sent=net_io.packets_sent,
        network_packets_recv=net_io.packets_recv,
        network_errors_in=net_io.errin,
        network_errors_out=net_io.errout,
        gpu_percent=gpu_percent,
        gpu_memory_percent=gpu_memory_percent,
        gpu_temperature_c=gpu_temperature_c,
        service_status=service_status,
        processes=process_tree,
    )


async def send_stats_to_api(stats: SystemStatsCreate):
    """Send statistics to the API."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.api_url}/api/v1/stats/",
                json=stats.model_dump(),
                headers={"X-API-Key": settings.api_key},
                timeout=10.0,
            )
            response.raise_for_status()
            logger.debug("stats_sent_to_api", status_code=response.status_code)
        except httpx.HTTPError as e:
            logger.error("failed_to_send_stats", error=str(e))


async def collector_loop(interval: int = 30):
    """Main collector loop."""
    logger.info("collector_started", interval=interval)

    while True:
        try:
            stats = await collect_system_stats()
            await send_stats_to_api(stats)
            logger.debug("stats_collected", cpu=stats.cpu_percent)
        except Exception as e:
            logger.error("collector_error", error=str(e))

        await asyncio.sleep(interval)


def signal_handler(sig: int, frame: object) -> None:
    """Handle shutdown signals gracefully."""
    logger.info("collector_shutting_down")
    sys.exit(0)


if __name__ == "__main__":
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Run collector
    try:
        asyncio.run(collector_loop(interval=30))
    except KeyboardInterrupt:
        logger.info("collector_stopped_by_user")
