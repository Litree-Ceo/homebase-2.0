"""API endpoints for ADB integration."""

from fastapi import APIRouter
from app.services import adb_service

router = APIRouter()


@router.get("/devices")
def list_adb_devices():
    """List all connected ADB devices."""
    return adb_service.get_devices()
