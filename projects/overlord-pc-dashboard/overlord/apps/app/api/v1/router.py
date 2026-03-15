"""Main API router."""

from fastapi import APIRouter

from app.api.v1.endpoints import ai

api_router = APIRouter()

# Include AI routes
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

# Add more routers here as needed:
# from app.api.v1.endpoints import users, system, monitoring
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(system.router, prefix="/system", tags=["system"])
# api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
