"""Configuration management module for Overlord Dashboard.

Note: This is the legacy config manager. For new code, use core.config instead.
"""

import logging
import os
from typing import Any, Dict, List, Optional, TypedDict

import yaml

# Use core logger for consistency and security sanitization
try:
    from core import get_logger

    log = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    log = logging.getLogger(__name__)


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


class ServiceConfig(TypedDict):
    """Type definition for service configuration."""

    name: str
    process_name: str


class Config(TypedDict, total=False):
    """Type definition for complete configuration."""

    server: ServerConfig
    auth: AuthConfig
    rate_limit: RateLimitConfig
    dashboard: DashboardConfig
    logging: LoggingConfig
    services: List[ServiceConfig]
    adb: ADBConfig
    gpu_monitor: GPUMonitorConfig
    database: DatabaseConfig


class ConfigManager:
    """Manages configuration from YAML file and environment variables."""

    def __init__(self, config_path: str = "config.yaml") -> None:
        """Initialize the configuration manager.

        Args:
            config_path: Path to the YAML configuration file.
        """
        self._config: Config = self._load_defaults()
        self._config_path: str = config_path
        self._load_from_file()
        self._load_from_env()

    def _load_defaults(self) -> Config:
        """Load default configuration values.

        Returns:
            Config TypedDict with default values.
        """
        return {
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
        }

    def _load_from_file(self) -> None:
        """Load configuration from YAML file if it exists."""
        if os.path.exists(self._config_path):
            try:
                with open(self._config_path, "r", encoding="utf-8") as f:
                    file_config: Dict[str, Any] = yaml.safe_load(f) or {}
                self._deep_merge(self._config, file_config)
                log.info(f"Configuration loaded from {self._config_path}")
            except Exception as e:
                log.warning(f"Failed to load config from {self._config_path}: {e}")
        else:
            log.warning(f"Config file {self._config_path} not found, using defaults")

    def _load_from_env(self) -> None:
        """Override configuration with environment variables."""
        # Server settings
        port_env = os.getenv("PORT")
        if port_env:
            self._config["server"]["port"] = int(port_env)
        host_env = os.getenv("HOST")
        if host_env:
            self._config["server"]["host"] = host_env

        # Auth settings
        api_key_env = os.getenv("OVERLORD_API_KEY")
        if api_key_env:
            self._config["auth"]["api_key"] = api_key_env
        alt_api_key = os.getenv("API_KEY")
        if alt_api_key:
            self._config["auth"]["api_key"] = alt_api_key

        # Database
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            self._config["database"] = {"url": db_url}

    def _deep_merge(self, base: Dict[str, Any], override: Dict[str, Any]) -> None:
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
        """Get a configuration value by key (supports dot notation).

        Args:
            key: Configuration key using dot notation (e.g., "server.port").
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
        """Set a configuration value by key (supports dot notation).

        Args:
            key: Configuration key using dot notation.
            value: Value to set.
        """
        keys = key.split(".")
        config: Dict[str, Any] = self._config
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value

    def get_all(self) -> Config:
        """Return a copy of the entire configuration.

        Returns:
            Complete configuration dictionary.
        """
        return dict(self._config)
