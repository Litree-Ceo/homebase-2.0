#!/usr/bin/env python3
"""
Overlord Hub - FastAPI Backend

Modern backend for Overlord PC Dashboard with JWT authentication,
PostgreSQL, and WebSocket support.

This backend uses the core module for unified configuration and authentication.
For the legacy http.server backend, use server.py instead.
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from fastapi.websockets import WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import DateTime, ForeignKey, Integer, String, select
from sqlalchemy.orm import Mapped, mapped_column

# Import from core module (unified configuration, logging, and stats)
from core import (
    Config,
    get_auth_manager,
    get_config,
    get_gpu_stats,
    get_system_stats,
    logger,
)
from database import Base, async_session, get_database_url

# Load environment variables
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed

# Use core logger - already configured with sanitization filters
# Note: Logging configuration is handled by core module

# Load configuration using core module
config = get_config()


# JWT configuration - use core config with fallback
def _get_jwt_config() -> Dict[str, Any]:
    """Get JWT configuration from core Config with fallbacks."""
    jwt_config = config.get("jwt", {})

    # Get secret key from config or env
    secret_key = jwt_config.get("secret_key") or os.getenv("SECRET_KEY")

    # Check for placeholder or empty value
    if not secret_key or secret_key in (
        "your-secret-key-change-this-in-production",
        "change-me-in-production",
    ):
        # Generate a secure secret for development
        import secrets

        secret_key = secrets.token_urlsafe(64)
        logger.warning(
            "SECRET_KEY not set or using default value. "
            "A development secret has been generated. "
            "For production, set a strong, unique SECRET_KEY in your .env file."
        )

    # Validate minimum length
    if secret_key and len(secret_key) < 32:
        logger.error(
            "SECRET_KEY is too short (%d chars). Minimum 32 characters required.",
            len(secret_key),
        )
        raise ValueError("SECRET_KEY must be at least 32 characters long.")

    return {
        "secret_key": secret_key,
        "algorithm": jwt_config.get("algorithm", "HS256"),
        "access_token_expire_minutes": jwt_config.get(
            "access_token_expire_minutes", 30
        ),
    }


jwt_settings = _get_jwt_config()
SECRET_KEY: str = jwt_settings["secret_key"]
ALGORITHM = jwt_settings["algorithm"]
ACCESS_TOKEN_EXPIRE_MINUTES = jwt_settings["access_token_expire_minutes"]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Get auth manager from core
auth_manager = get_auth_manager(config)

# Log the database URL being used
logger.info(f"Database URL: {get_database_url()}")

# FastAPI app
app = FastAPI(
    title="Overlord Hub",
    description="Modern backend for Overlord PC Dashboard",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",
        "http://127.0.0.1:4321",
        "http://localhost:4001",
        "http://127.0.0.1:4001",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


from models import Post, User


# Token verification
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return username


# Password utilities
async def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


async def get_password_hash(password):
    return pwd_context.hash(password)


# WebSocket manager
class ConnectionManager:
    """Manages WebSocket connections for real-time stats streaming."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected: {user_id}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected: {user_id}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients."""
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")


manager = ConnectionManager()


async def websocket_stats_stream(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time system stats streaming."""
    await manager.connect(websocket, user_id)

    try:
        while True:
            # Collect system stats (includes GPU data)
            stats = get_system_stats()
            # Cast to dict to allow timestamp addition (for websocket response)
            stats_with_timestamp = dict(stats)
            stats_with_timestamp["timestamp"] = datetime.utcnow().isoformat()

            # Send stats to client
            await websocket.send_json({"type": "stats", "data": stats_with_timestamp})

            # Wait before next update (2 seconds)
            await asyncio.sleep(2)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket stats error: {e}")
        manager.disconnect(user_id)


@app.websocket("/ws/stats")
async def websocket_endpoint(websocket: WebSocket):
    # For now, we'll use a static user_id. In a real app, you'd get this from a token.
    user_id = "anonymous_user"
    await websocket_stats_stream(websocket, user_id)


# Routes
@app.get("/")
async def root():
    return {"message": "Overlord Hub API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/auth/register")
async def register(username: str, email: str, password: str):
    async with async_session() as session:
        # Check if user exists
        result = await session.execute(
            select(User).where((User.username == username) | (User.email == email))
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered",
            )

        # Create new user
        hashed_password = await get_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            created_at=datetime.utcnow(),
        )

        session.add(new_user)
        await session.commit()

        return {"message": "User registered successfully", "user_id": new_user.id}


@app.post("/api/auth/login")
async def login(username: str, password: str):
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()

        if not user or not await verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = jwt.encode(
            {"sub": user.username, "exp": datetime.utcnow() + access_token_expires},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "system_specs": user.system_specs,
            },
        }


@app.get("/api/users/me", dependencies=[Depends(verify_token)])
async def read_users_me(current_user: str = Depends(verify_token)):
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.username == current_user)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "system_specs": user.system_specs,
            "created_at": user.created_at.isoformat(),
        }


@app.get("/api/social/feed")
async def get_social_feed(
    skip: int = 0, limit: int = 100, current_user: str = Depends(verify_token)
):
    async with async_session() as session:
        result = await session.execute(
            select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit)
        )
        posts = result.scalars().all()
        return {"posts": [post.to_dict() for post in posts]}


@app.post("/api/social/post")
async def create_post(content: str, current_user: str = Depends(verify_token)):
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.username == current_user)
        )
        user = result.scalar_one()

        post = Post(user_id=user.id, content=content)
        session.add(post)
        await session.commit()

        # The post object is populated with the ID and defaults after commit
        # with the asyncpg driver, so refresh is not strictly necessary.
        # We can directly return the dictionary representation.
        return {"message": "Post created successfully", "post": post.to_dict()}


@app.get("/api/media/library")
async def get_media_library(current_user: str = Depends(verify_token)):
    """Get media library - placeholder for Real-Debrid integration."""
    return {"media": [], "message": "Real-Debrid integration coming soon"}


@app.get("/api/media/play/{media_id}")
async def play_media(media_id: str, current_user: str = Depends(verify_token)):
    """Get media stream URL - placeholder for Real-Debrid integration."""
    return {"stream_url": None, "message": "Real-Debrid integration coming soon"}


# AI Integration - Direct imports (no subprocess)
try:
    from gemini_agent import get_gemini_response
    from mock_ai_assistant import get_mock_response

    AI_AVAILABLE = True
except ImportError as e:
    logger.warning(f"AI modules not available: {e}")
    AI_AVAILABLE = False


@app.post("/api/ai/generate")
async def generate_ai_response(
    prompt: str, use_mock: bool = False, current_user: str = Depends(verify_token)
):
    """Generate AI response using Gemini or mock AI (direct import, no subprocess)."""
    if not AI_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. Install google-generativeai.",
        )

    try:
        if use_mock:
            response = get_mock_response(prompt)
            logger.info(f"Mock AI response for user {current_user}")
        else:
            response = get_gemini_response(prompt)
            logger.info(f"Gemini AI response for user {current_user}")

        return {
            "success": True,
            "response": response,
            "model": "mock" if use_mock else "gemini-1.0-pro",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    from dotenv import load_dotenv

    # Load .env file before anything else
    load_dotenv()

    # Get port from environment or default to 8001
    port = int(os.getenv("PORT", 0))

    # Start the server
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, log_level="info")
