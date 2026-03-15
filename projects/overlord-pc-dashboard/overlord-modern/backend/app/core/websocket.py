"""WebSocket manager for real-time communication."""

import asyncio
import json
from typing import Set
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect
import psutil

from app.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """Manage WebSocket connections."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.authenticated_connections: dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, token: str) -> bool:
        """Accept connection and authenticate."""
        await websocket.accept()

        settings = get_settings()
        if token != settings.websocket_token:
            await websocket.close(code=4001, reason="Invalid authentication token")
            return False

        self.active_connections.add(websocket)
        self.authenticated_connections[websocket] = {
            "connected_at": datetime.utcnow(),
            "client_ip": websocket.client.host if websocket.client else "unknown",
        }

        logger.info(
            "websocket_connected",
            client=websocket.client.host if websocket.client else "unknown",
            total_connections=len(self.active_connections),
        )

        # Send welcome message
        await websocket.send_json(
            {
                "type": "connected",
                "message": "Overlord WebSocket connected",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        return True

    def disconnect(self, websocket: WebSocket):
        """Remove connection."""
        self.active_connections.discard(websocket)
        self.authenticated_connections.pop(websocket, None)

        logger.info(
            "websocket_disconnected", total_connections=len(self.active_connections)
        )

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error("websocket_send_error", error=str(e))
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients."""
        disconnected = set()

        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def collect_and_broadcast_stats(self):
        """Collect system stats and broadcast to all clients."""
        try:
            stats = {
                "type": "stats",
                "data": {
                    "cpu": psutil.cpu_percent(interval=0.1),
                    "memory": psutil.virtual_memory().percent,
                    "disk": psutil.disk_usage("/").percent,
                    "network_sent": psutil.net_io_counters().bytes_sent / 1024 / 1024,
                    "network_recv": psutil.net_io_counters().bytes_recv / 1024 / 1024,
                },
                "timestamp": datetime.utcnow().isoformat(),
            }

            await self.broadcast(stats)

        except Exception as e:
            logger.error("stats_collection_error", error=str(e))

    async def run_stats_loop(self, interval: float = 5.0):
        """Run continuous stats collection loop."""
        logger.info("websocket_stats_loop_started", interval=interval)

        while True:
            if self.active_connections:
                await self.collect_and_broadcast_stats()
            await asyncio.sleep(interval)


# Global manager instance
manager = ConnectionManager()


async def handle_websocket(websocket: WebSocket, token: str):
    """Handle WebSocket connection lifecycle."""
    if not await manager.connect(websocket, token):
        return

    try:
        while True:
            # Receive and handle client messages
            data = await websocket.receive_text()

            try:
                message = json.loads(data)
                message_type = message.get("type")

                if message_type == "ping":
                    await websocket.send_json({"type": "pong"})

                elif message_type == "get_stats":
                    # Trigger immediate stats broadcast
                    await manager.collect_and_broadcast_stats()

                else:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": f"Unknown message type: {message_type}",
                        }
                    )

            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error("websocket_error", error=str(e))
        manager.disconnect(websocket)
