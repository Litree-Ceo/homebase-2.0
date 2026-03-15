"""Unified configuration management for Overlord Dashboard.

This module provides a centralized configuration system that loads from:
1. Default values (lowest priority)
2. config.yaml file
3. Environment variables (highest priority)

Usage:
    from core import Config

    # Load configuration
    config = Config.load()

    # Access values
    port = config.get("server.port", 8080)
    api_key = config.get("auth.api_key")
"""

import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional, TypedDict

import yaml


class ConfigError(Exception):
    """Custom exception for configuration errors."""


logger = logging.getLogger(__name__)

# Version info
__version__ = "4.3.0"
__module_version__ = "1.0.0"


# ─────────────────────────────────────────────────────────────────────────────
# Type Definitions
# ─────────────────────────────────────────────────────────────────────────────


class ServerConfig(TypedDict, total=False):
    """Type definition for server configuration."""

    host: str
    port: int
    auth_required: bool


class AuthConfig(TypedDict, total=False):
    """Type definition for authentication configuration."""

    enabled: bool
    api_key: str


class RateLimitConfig(TypedDict, total=False):
    """Type definition for rate limiting configuration."""

    enabled: bool
    requests_per_second: int
    burst: int
    block_duration: int


class DashboardConfig(TypedDict, total=False):
    """Type definition for dashboard configuration."""

    refresh_interval_ms: int
    max_history_entries: int


class LoggingConfig(TypedDict, total=False):
    """Type definition for logging configuration."""

    level: str
    file: str
    max_size: int
    backup_count: int


class ADBConfig(TypedDict, total=False):
    """Type definition for ADB configuration."""

    host: str
    port: int


class GPUMonitorConfig(TypedDict, total=False):
    """Type definition for GPU monitoring configuration."""

    enabled: bool


class DatabaseConfig(TypedDict, total=False):
    """Type definition for database configuration."""

    url: str
    path: str
    retention_days: int


class JWTConfig(TypedDict, total=False):
    """Type definition for JWT configuration."""

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int


class ServiceConfig(TypedDict):
    """Type definition for service configuration."""

    name: str
    process_name: str


class ConfigDict(TypedDict, total=False):
    """Type definition for complete configuration."""

    server: ServerConfig
    auth: AuthConfig
    rate_limit: RateLimitConfig
    dashboard: DashboardConfig
    logging: LoggingConfig
    services: list[ServiceConfig]
    adb: ADBConfig
    gpu_monitor: GPUMonitorConfig
    database: DatabaseConfig
    jwt: JWTConfig


# ─────────────────────────────────────────────────────────────────────────────
# Default Configuration
# ─────────────────────────────────────────────────────────────────────────────

DEFAULT_CONFIG: ConfigDict = {
    "server": {
        "host": "0.0.0.0",
        "port": 8080,
        "auth_required": True,
    },
    "auth": {
        "enabled": True,
        "api_key": "",
    },
    "rate_limit": {
        "enabled": True,
        "requests_per_second": 10,
        "burst": 20,
        "block_duration": 60,
    },
    "dashboard": {
        "refresh_interval_ms": 5000,
        "max_history_entries": 60,
    },
    "logging": {
        "level": "INFO",
        "file": "overlord_dashboard.log",
        "max_size": 10,
        "backup_count": 5,
    },
    "services": [],
    "adb": {
        "host": "127.0.0.1",
        "port": 5037,
    },
    "gpu_monitor": {
        "enabled": True,
    },
    "database": {
        "url": "",
        "path": "overlord.db",
        "retention_days": 30,
    },
    "jwt": {
        "secret_key": "",
        "algorithm": "HS256",
        "access_token_expire_minutes": 30,
    },
}

# Placeholder values that should be rejected in production
PLACEHOLDER_SECRETS = [
    "change-me-in-production",
    "your-secret-key-change-this-in-production",
    "default-secret-key",
    "change-me",
    "secret",
    "123456",
]


# ─────────────────────────────────────────────────────────────────────────────
# Config Class
# ─────────────────────────────────────────────────────────────────────────────


class Config:
    """Unified configuration manager.

    Loads configuration from defaults, YAML file, and environment variables.
    Environment variables have the highest priority.

    Attributes:
        _config: Internal configuration dictionary.
    """

    _instance: Optional["Config"] = None

    def __init__(self, config_dict: Optional[ConfigDict] = None) -> None:
        """Initialize configuration.

        Args:
            config_dict: Initial configuration dictionary. If None, uses defaults.
        """
        self._config: ConfigDict = config_dict or self._load_defaults()

    @classmethod
    def load(
        cls,
        config_path: str = "config.yaml",
        validate: bool = True,
    ) -> "Config":
        """Load configuration from all sources.

        Args:
            config_path: Path to the YAML configuration file.
            validate: Whether to validate the configuration.

        Returns:
            Config instance with loaded configuration.
        """
        instance = cls()
        instance._load_from_file(config_path)
        instance._load_from_env()

        if validate:
            instance._validate()

        return instance

    @classmethod
    def get_instance(cls) -> Optional["Config"]:
        """Get the singleton instance if it exists.

        Returns:
            Config instance or None if not initialized.
        """
        return cls._instance

    @classmethod
    def set_instance(cls, instance: "Config") -> None:
        """Set the singleton instance.

        Args:
            instance: Config instance to set.
        """
        cls._instance = instance

    def _load_defaults(self) -> ConfigDict:
        """Load default configuration values.

        Returns:
            ConfigDict with default values.
        """
        import copy

        return copy.deepcopy(DEFAULT_CONFIG)

    def _load_from_file(self, config_path: str) -> None:
        """Load configuration from YAML file if it exists.

        Args:
            config_path: Path to the YAML configuration file.
        """
        # Try multiple paths
        paths_to_try = [
            config_path,
            Path(__file__).parent.parent / config_path,
            Path.cwd() / config_path,
        ]

        config_file = None
        for path in paths_to_try:
            if os.path.exists(path):
                config_file = path
                break

        if config_file is None:
            logger.warning("Config file not found, using defaults")
            return

        try:
            with open(config_file, "r", encoding="utf-8") as f:
                file_config: Dict[str, Any] = yaml.safe_load(f) or {}
            self._deep_merge(self._config, file_config)  # type: ignore[arg-type]
            logger.info("Configuration loaded from %s", config_file)
        except Exception as e:
            logger.error("Failed to load config from %s: %s", config_file, e)
            raise ConfigError(f"Failed to load config: {e}") from e

    def _load_from_env(self) -> None:
        """Override configuration with environment variables."""
        # Server settings
        port_env = os.getenv("PORT")
        if port_env:
            server_config = self._config.setdefault("server", {})
            server_config["port"] = int(port_env)

        host_env = os.getenv("HOST")
        if host_env:
            server_config = self._config.setdefault("server", {})
            server_config["host"] = host_env

        # Auth settings
        api_key_env = os.getenv("OVERLORD_API_KEY")
        if api_key_env:
            auth_config = self._config.setdefault("auth", {})
            auth_config["api_key"] = api_key_env

        alt_api_key = os.getenv("API_KEY")
        if alt_api_key:
            auth_config = self._config.setdefault("auth", {})
            auth_config["api_key"] = alt_api_key

        # Database
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            db_config = self._config.setdefault("database", {})
            db_config["url"] = db_url

        postgres_url = os.getenv("POSTGRES_URL")
        if postgres_url:
            db_config = self._config.setdefault("database", {})
            db_config["url"] = postgres_url

        # JWT settings
        secret_key = os.getenv("SECRET_KEY")
        if secret_key:
            jwt_config = self._config.setdefault("jwt", {})
            jwt_config["secret_key"] = secret_key

        # Rate limiting
        rate_limit_enabled = os.getenv("RATE_LIMIT_ENABLED")
        if rate_limit_enabled:
            rate_limit_config = self._config.setdefault("rate_limit", {})
            rate_limit_config["enabled"] = (
                rate_limit_enabled.lower() in ("true", "1", "yes")
            )

        # Logging
        log_level = os.getenv("LOG_LEVEL")
        if log_level:
            logging_config = self._config.setdefault("logging", {})
            logging_config["level"] = log_level.upper()

    def _validate(self) -> None:
        """Validate configuration values."""
        # Check for placeholder secrets
        jwt_secret = self._config.get("jwt", {}).get("secret_key", "")
        if jwt_secret and jwt_secret.lower() in PLACEHOLDER_SECRETS:
            logger.warning(
                "JWT secret appears to be a placeholder value. "
                "Please set a secure SECRET_KEY in environment variables."
            )

        # Validate API key length if auth is enabled
        auth_enabled = self._config.get("auth", {}).get("enabled", True)
        api_key = self._config.get("auth", {}).get("api_key", "")
        if auth_enabled and not api_key:
            logger.warning(
                "Authentication is enabled but no API key is set. "
                "Set OVERLORD_API_KEY in environment variables."
            )
        elif api_key and len(api_key) < 32:
            logger.warning(
                "API key is shorter than recommended (32+ characters). "
                "Current length: %d",
                len(api_key),
            )

        # Validate port range
        port = self._config.get("server", {}).get("port", 8080)
        if not (1 <= port <= 65535):
            raise ConfigError(f"Invalid port number: {port}")

    def _deep_merge(self, base: dict, override: dict) -> None:
        """Deep merge override dict into base dict.

        Args:
            base: Base dictionary to merge into.
            override: Dictionary with values to merge.
        """
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """Get a configuration value by key using dot notation.

        Args:
            key: Configuration key (e.g., "server.port").
            default: Default value if key is not found.

        Returns:
            Configuration value or default.
        """
        keys = key.split(".")
        value: Any = self._config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value

    def set(self, key: str, value: Any) -> None:
        """Set a configuration value by key using dot notation.

        Args:
            key: Configuration key (e.g., "server.port").
            value: Value to set.
        """
        keys = key.split(".")
        config: Dict[str, Any] = self._config  # type: ignore[assignment]
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value

    def get_all(self) -> ConfigDict:
        """Get a copy of the entire configuration.

        Returns:
            Complete configuration dictionary.
        """
        import copy

        return copy.deepcopy(self._config)

    def get_jwt_secret(self) -> str:
        """Get JWT secret, generating one if not set.

        Returns:
            JWT secret key.
        """
        import secrets

        secret = self._config.get("jwt", {}).get("secret_key", "")

        if not secret:
            # Generate a secure secret
            secret = secrets.token_urlsafe(64)
            self._config.setdefault("jwt", {})["secret_key"] = secret
            logger.warning(
                "No JWT secret configured. Auto-generated a secure secret. "
                "Set SECRET_KEY in environment variables for production."
            )

        return secret

    def get_api_key(self) -> str:
        """Get the configured API key.

        Returns:
            API key string.
        """
        return self._config.get("auth", {}).get("api_key", "")

    def is_auth_enabled(self) -> bool:
        """Check if authentication is enabled.

        Returns:
            True if authentication is enabled.
        """
        return self._config.get("auth", {}).get("enabled", True)

    def is_rate_limit_enabled(self) -> bool:
        """Check if rate limiting is enabled.

        Returns:
            True if rate limiting is enabled.
        """
        return self._config.get("rate_limit", {}).get("enabled", True)

    def get_database_url(self) -> str:
        """Get database URL.

        Returns:
            Database URL string.
        """
        return self._config.get("database", {}).get("url", "")


# ─────────────────────────────────────────────────────────────────────────────
# Convenience Functions
# ─────────────────────────────────────────────────────────────────────────────


class _ConfigManager:
    """Manages the singleton config instance."""

    _instance: Optional[Config] = None

    @classmethod
    def get_config(cls) -> Config:
        """Get or create the default configuration instance."""
        if cls._instance is None:
            cls._instance = Config.load()
        return cls._instance

    @classmethod
    def reload_config(cls, config_path: str = "config.yaml") -> Config:
        """Reload configuration from file."""
        cls._instance = Config.load(config_path)
        return cls._instance


get_config = _ConfigManager.get_config
reload_config = _ConfigManager.reload_config
