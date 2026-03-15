"""WebSocket endpoint."""

from fastapi import WebSocket, Query

from app.core.websocket import handle_websocket


async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="WebSocket authentication token"),
):
    """WebSocket endpoint for real-time updates."""
    await handle_websocket(websocket, token)
