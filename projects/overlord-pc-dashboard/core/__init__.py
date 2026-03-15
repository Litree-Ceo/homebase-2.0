# core/__init__.py
"""Core module for Overlord PC Dashboard.

This module provides unified access to configuration, authentication,
logging, and system statistics functionality.

Usage:
    from core import Config, get_config, get_system_stats, logger

    # Load configuration
    config = get_config()

    # Access values
    port = config.get("server.port", 8080)
    api_key = config.get("auth.api_key")

    # Get system stats
    stats = get_system_stats()

    # Logging is pre-configured with sanitization filters
    logger.info("Application started")
"""

import logging
import logging.handlers
import os
import re
import threading
from typing import Any, Dict, List, Optional, Tuple

from core.auth import Auth
from core.config import Config, get_config, reload_config
from core.exceptions import AuthenticationError, AuthorizationError, ConfigError
from core.stats import get_gpu_stats, get_system_stats

# ============================================================================
# Sanitizing Filter - Redacts sensitive information from logs
# ============================================================================


class SanitizingFilter(logging.Filter):
    """Filter that sanitizes sensitive information from log messages."""

    PATTERNS: List[Tuple[str, str]] = [
        (r'api[_-]?key[=:]\s*["\']?\S+["\']?', "api_key=***REDACTED***"),
        (r'token[=:]\s*["\']?\S+["\']?', "token=***REDACTED***"),
        (r'password[=:]\s*["\']?\S+["\']?', "password=***REDACTED***"),
        (r'secret[=:]\s*["\']?\S+["\']?', "secret=***REDACTED***"),
        (r"authorization[:\s]+\S+", "authorization=***REDACTED***"),
        (r"x-api-key[:\s]+\S+", "x-api-key=***REDACTED***"),
        (r"Bearer\s+\S+", "Bearer ***REDACTED***"),
        (r"firebase[_-]?config[=:]\s*\{[^}]*\}", "firebase_config=***REDACTED***"),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        """Sanitize sensitive data from log message.

        Args:
            record: Log record to filter.

        Returns:
            True to allow the record through.
        """
        if isinstance(record.msg, str):
            record.msg = self._sanitize(record.msg)
        if record.args:
            record.args = tuple(self._sanitize(str(arg)) for arg in record.args)
        return True

    def _sanitize(self, message: str) -> str:
        """Apply all sanitization patterns to the message.

        Args:
            message: Message to sanitize.

        Returns:
            Sanitized message.
        """
        for pattern, replacement in self.PATTERNS:
            message = re.sub(pattern, replacement, message, flags=re.IGNORECASE)
        return message


class RequestContextFilter(logging.Filter):
    """Adds request ID to log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        """Add request context to log record.

        Args:
            record: Log record to filter.

        Returns:
            True to allow the record through.
        """
        if not hasattr(record, "request_id"):
            record.request_id = getattr(threading.current_thread(), "request_id", "-")
        return True


# ============================================================================
# Logging Setup
# ============================================================================


def setup_logging(
    level: Optional[str] = None,
    log_file: Optional[str] = None,
    max_size: int = 10,
    backup_count: int = 5,
) -> logging.Logger:
    """Set up logging configuration with sanitization filters.

    This function configures the 'overlord' logger with console and file
    handlers, both with sanitization filters to redact sensitive data.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
               Defaults to INFO or config value.
        log_file: Path to log file. Defaults to overlord_dashboard.log.
        max_size: Maximum log file size in MB. Default: 10.
        backup_count: Number of backup files to keep. Default: 5.

    Returns:
        Configured logger instance.
    """
    # Get config if available
    config_level: str = "INFO"
    config_file: str = "overlord_dashboard.log"

    try:
        config = get_config()
        log_config = config.get("logging", {})
        config_level = log_config.get("level", "INFO")
        config_file = log_config.get("file", "overlord_dashboard.log")
    except Exception:
        pass  # Config not available, use defaults

    # Use provided values or fall back to config
    log_level = level or config_level
    log_file_path = log_file or config_file

    # Get or create logger
    logger = logging.getLogger("overlord")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to avoid duplicates
    if logger.handlers:
        logger.handlers.clear()

    # Create formatters
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s [%(request_id)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.addFilter(SanitizingFilter())
    console_handler.addFilter(RequestContextFilter())
    logger.addHandler(console_handler)

    # File handler with rotation
    try:
        max_bytes = max_size * 1024 * 1024  # Convert MB to bytes
        file_handler = logging.handlers.RotatingFileHandler(
            log_file_path,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        file_handler.addFilter(SanitizingFilter())
        file_handler.addFilter(RequestContextFilter())
        logger.addHandler(file_handler)
    except OSError as e:
        logger.warning(f"Could not create log file {log_file_path}: {e}")

    return logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger instance with sanitization filters.

    This function returns a child logger of the 'overlord' logger,
    ensuring all log messages go through the sanitization filters.

    Args:
        name: Logger name. If None, returns the root 'overlord' logger.
              Use __name__ for module-level loggers.

    Returns:
        Logger instance with sanitization filters.
    """
    root_logger = logging.getLogger("overlord")

    if name:
        return root_logger.getChild(name)
    return root_logger


# Initialize logging on module import
# This ensures logging is set up when is imported
# Initialize logging on module import
# This ensures logging is set up when core is imported
try:
    # Only configure if not already configured
    root_logger = logging.getLogger("overlord")
    if not root_logger.handlers:
        setup_logging()
except Exception:
    # Fallback to basic config if setup fails
    logging.basicConfig(level=logging.INFO)


# Setup module-level logger (for core module itself)
logger = get_logger(__name__)


def get_auth_manager(config: Optional[Config] = None) -> Auth:
    """Get an authentication manager instance.

    Args:
        config: Optional Config instance. If not provided, uses default.

    Returns:
        Auth instance for authentication operations.
    """
    if config is None:
        config = get_config()
    # Convert Config to dict format expected by Auth (cast to bypass TypedDict issue)
    config_dict: Dict[str, Any] = dict(config._config)  # type: ignore[assignment]
    return Auth(config_dict)


# Re-export commonly used items
__all__ = [
    # Config
    "Config",
    "get_config",
    "reload_config",
    # Auth
    "Auth",
    "get_auth_manager",
    # Stats
    "get_gpu_stats",
    "get_system_stats",
    # Exceptions
    "ConfigError",
    "AuthenticationError",
    "AuthorizationError",
    # Logger
    "logger",
    "get_logger",
    "setup_logging",
    "SanitizingFilter",
    "RequestContextFilter",
]

__version__ = "4.3.0"
