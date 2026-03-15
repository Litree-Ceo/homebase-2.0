"""This module contains the authentication logic for the application."""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from passlib.context import CryptContext
from starlette.status import HTTP_403_FORBIDDEN

from core.config import Config, get_config

# Use get_logger for consistent logging with sanitization filters
# Note: Avoid circular import by not importing from core/__init__.py directly
logger = logging.getLogger(__name__)


class Auth:
    """Authentication class for the application."""

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    api_key_header = APIKeyHeader(name="access_token", auto_error=False)

    def __init__(self, config: Optional[Config] = None) -> None:
        """Initialize the Auth class."""
        if config is None:
            config = get_config()
        self.config: Config = config

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash."""
        return cls.pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def get_password_hash(cls, password: str) -> str:
        """Hash a password."""
        return cls.pwd_context.hash(password)

    def create_access_token(
        self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a new access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=self.config.get("jwt.access_token_expire_minutes", 30)
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            self.config.get("jwt.secret_key", ""),
            algorithm=self.config.get("jwt.algorithm", "HS256"),
        )
        return encoded_jwt

    def decode_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode an access token."""
        try:
            decoded_jwt = jwt.decode(
                token,
                self.config.get("jwt.secret_key", ""),
                algorithms=[self.config.get("jwt.algorithm", "HS256")],
            )
            return decoded_jwt
        except jwt.PyJWTError as ex:
            logger.warning("Failed to decode JWT", exc_info=ex)
            return None

    async def get_current_user(
        self, token: str = Security(api_key_header)
    ) -> Dict[str, Any]:
        """Get the current user from a token."""
        if token is None:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
            )

        payload = self.decode_access_token(token)
        if payload is None:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail="Invalid authentication credentials",
            )

        user_id: Optional[int] = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail="Invalid authentication credentials",
            )

        # This is a placeholder for a database call
        user = {"id": user_id, "username": "testuser"}

        if user is None:
            raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="User not found")

        return user
