"""Security utilities."""

import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import Settings, get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def create_api_key() -> str:
    """Generate a new secure API key."""
    return f"ovrd_{secrets.token_urlsafe(32)}"


async def verify_api_key(
    api_key: Optional[str] = Security(api_key_header),
    settings: Settings = Depends(get_settings),
) -> str:
    """Verify API key from header - DEV MODE: allows any key or no key."""
    # DEV MODE: Allow any API key or return a default
    if not api_key:
        return "dev_key"
    return api_key


class RateLimiter:
    """Simple in-memory rate limiter."""

    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[datetime]] = {}

    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed under rate limit."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window)

        # Get existing requests for key
        user_requests = self.requests.get(key, [])

        # Filter to window
        recent_requests = [r for r in user_requests if r > window_start]

        # Update stored requests
        self.requests[key] = recent_requests

        # Check limit
        if len(recent_requests) >= self.max_requests:
            return False

        # Record this request
        recent_requests.append(now)
        return True


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit(request: str = Depends(verify_api_key)) -> str:
    """Rate limiting dependency - DEV MODE: disabled."""
    # DEV MODE: Skip rate limiting
    return request
