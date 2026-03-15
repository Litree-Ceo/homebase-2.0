"""API endpoints for Termux integration."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.termux_service import termux_manager
from app.core.security import verify_api_key

router = APIRouter()


class TermuxConnection(BaseModel):
    hostname: str
    port: int
    username: str
    password: str


class TermuxCommand(BaseModel):
    command: str


@router.post("/connect")
def connect_to_termux(
    connection: TermuxConnection, api_key: str = Depends(verify_api_key)
):
    success, message = termux_manager.connect(
        connection.hostname, connection.port, connection.username, connection.password
    )
    return {"success": success, "message": message}


@router.post("/disconnect")
def disconnect_from_termux(api_key: str = Depends(verify_api_key)):
    termux_manager.disconnect()
    return {"success": True, "message": "Disconnected"}


@router.post("/execute")
def execute_termux_command(
    command: TermuxCommand, api_key: str = Depends(verify_api_key)
):
    return termux_manager.execute_command(command.command)
