"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    stats,
    system,
    websocket,
    health,
    builder,
    processes,
    realdebrid,
    assistant,
    adb,
    termux,
    code,
)

api_router = APIRouter()

api_router.include_router(stats.router, prefix="/stats", tags=["statistics"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(builder.router, prefix="/app-builder", tags=["app-builder"])
api_router.include_router(processes.router, prefix="/processes", tags=["processes"])
api_router.include_router(realdebrid.router, prefix="/realdebrid", tags=["realdebrid"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(adb.router, prefix="/adb", tags=["adb"])
api_router.include_router(termux.router, prefix="/termux", tags=["termux"])
api_router.include_router(code.router, prefix="/code", tags=["code-generation"])

# WebSocket endpoint
api_router.add_websocket_route("/ws", websocket.websocket_endpoint)
