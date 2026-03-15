"""Process management endpoints."""

from typing import Annotated

import psutil
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import rate_limit

router = APIRouter()


@router.get("/list", summary="Get running processes")
async def get_processes(api_key: Annotated[str, Depends(rate_limit)]):
    """Get list of running processes."""
    processes = []

    for proc in psutil.process_iter(
        ["pid", "name", "cpu_percent", "memory_info", "status"]
    ):
        try:
            pinfo = proc.info
            processes.append(
                {
                    "pid": pinfo["pid"],
                    "name": pinfo["name"],
                    "cpu_percent": pinfo["cpu_percent"] or 0.0,
                    "memory_mb": (
                        round(pinfo["memory_info"].rss / (1024 * 1024), 2)
                        if pinfo["memory_info"]
                        else 0
                    ),
                    "status": pinfo["status"],
                }
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # Sort by CPU usage
    processes.sort(key=lambda x: x["cpu_percent"], reverse=True)

    return {
        "processes": processes[:50],  # Top 50 processes
        "total_count": len(processes),
    }


@router.get("/summary", summary="Get process summary")
async def get_process_summary(api_key: Annotated[str, Depends(rate_limit)]):
    """Get process count summary."""
    process_count = len(psutil.pids())

    # Count by status
    running = 0
    sleeping = 0

    for proc in psutil.process_iter(["status"]):
        try:
            if proc.info["status"] == psutil.STATUS_RUNNING:
                running += 1
            elif proc.info["status"] == psutil.STATUS_SLEEPING:
                sleeping += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return {
        "total": process_count,
        "running": running,
        "sleeping": sleeping,
        "cpu_percent": psutil.cpu_percent(interval=0.1),
    }


@router.post("/{pid}/kill", summary="Kill a process")
async def kill_process(pid: int, api_key: Annotated[str, Depends(rate_limit)]):
    """Kill a process by PID."""
    try:
        proc = psutil.Process(pid)
        proc.terminate()
        return {"status": "success", "message": f"Process {pid} terminated"}
    except psutil.NoSuchProcess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Process {pid} not found"
        )
    except psutil.AccessDenied:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to kill process {pid}",
        )
