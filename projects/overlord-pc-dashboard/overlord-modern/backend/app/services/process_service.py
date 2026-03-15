"""Service for process-related operations."""

import psutil
from fastapi import HTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)

def terminate_process(pid: int) -> dict[str, str]:
    """Terminates a process by its PID."""
    try:
        proc = psutil.Process(pid)
        proc.terminate()  # Sends SIGTERM
        logger.info(f"Sent terminate signal to process {pid}: {proc.name()}")
        return {"message": f"Termination signal sent to process {pid}"}
    except psutil.NoSuchProcess:
        logger.warning(f"Attempted to terminate non-existent process {pid}")
        raise HTTPException(status_code=404, detail=f"Process with PID {pid} not found.")
    except psutil.AccessDenied:
        logger.error(f"Access denied when trying to terminate process {pid}")
        raise HTTPException(status_code=403, detail=f"Access denied to terminate process {pid}.")
    except Exception as e:
        logger.error(f"An unexpected error occurred while terminating process {pid}: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")
