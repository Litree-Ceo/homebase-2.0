"""
Overlord PC Dashboard API v5.0
FastAPI backend with PostgreSQL, WebSockets, and real-time monitoring.
"""

import sys
import os

# Ensure the project root is in the Python path
# This allows running the app directly, and also as a module.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.config import Settings, get_settings
from app.core.logging import setup_logging
from app.database import init_db


import os
from dotenv import load_dotenv
import httpx
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv(dotenv_path="../../.env")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    settings = get_settings()
    setup_logging(settings.log_level)
    await init_db()
    yield
    # Shutdown
    pass


class ChatRequest(BaseModel):
    model: str
    messages: list

def create_application() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title="Overlord PC Dashboard API",
        description="Real-time system monitoring with modern stack",
        version="5.0.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Routes
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "healthy", "version": "5.0.0", "service": "overlord-api"}

    @app.post("/api/ai/chat", tags=["ai"])
    async def ai_chat(request: ChatRequest):
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if not openrouter_api_key:
            return {"error": "OpenRouter API key not configured."}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json=request.dict(),
            )
            return response.json()

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn
    from app.config import get_settings

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level.lower(),
        reload=settings.debug,
        reload_dirs=["app"],
    )
