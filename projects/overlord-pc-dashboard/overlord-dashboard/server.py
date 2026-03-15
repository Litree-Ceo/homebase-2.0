#!/usr/bin/env python3
"""
OVERLORD PC Dashboard — Production Server v4.2.1 (Security Hardened)
Real-time system monitoring with auth, rate limiting, GPU stats,
process list, multi-disk, historical data, structured logging,
database persistence, and security hardening.
"""

import gzip
import http.server
import json
import logging
import logging.handlers
import os
import platform
import random
import re
import signal
import socket
import sqlite3
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


# ── SQLite datetime adapter for Python 3.12+ compatibility ──────────────────
def _adapt_datetime(dt: datetime) -> str:
    """Convert datetime to ISO format string for SQLite storage."""
    return dt.isoformat()


def _convert_datetime(value: bytes) -> datetime:
    """Convert ISO format string from SQLite back to datetime."""
    return datetime.fromisoformat(value.decode())


sqlite3.register_adapter(datetime, _adapt_datetime)
sqlite3.register_converter("DATETIME", _convert_datetime)

import subprocess
import sys
import threading
import time
import uuid
from collections import deque, OrderedDict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any, Callable
from urllib.parse import parse_qs, urlparse

import requests

try:
    import yaml

    HAS_YAML = True
except ImportError:
    HAS_YAML = False

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VERSION = "4.2.1"

# ── Configuration Data Classes ──────────────────────────────────────────────


@dataclass
class ServerConfig:
    host: str = "0.0.0.0"
    port: int = 8080


@dataclass
class AuthConfig:
    enabled: bool = True
    api_key: str = ""


@dataclass
class RateLimitConfig:
    enabled: bool = True
    requests_per_second: int = 10
    burst: int = 20
    block_duration: int = 60


@dataclass
class DashboardConfig:
    refresh_interval_ms: int = 5000
    max_history_entries: int = 60


@dataclass
class LoggingConfig:
    level: str = "INFO"
    file: str = "overlord.log"
    max_bytes: int = 1_048_576
    backup_count: int = 3
    json_format: bool = False


@dataclass
class SecurityConfig:
    csp: str = (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
    )
    secure_headers: bool = True
    cors_origins: List[str] = field(default_factory=list)
    allowed_hosts: List[str] = field(default_factory=lambda: ["localhost", "0.0.0.0"])


@dataclass
class DatabaseConfig:
    enabled: bool = True
    path: str = "overlord.db"
    retention_days: int = 30


@dataclass
class FirebaseConfig:
    enabled: bool = False
    config: str = ""


@dataclass
class AppConfig:
    server: ServerConfig = field(default_factory=ServerConfig)
    auth: AuthConfig = field(default_factory=AuthConfig)
    rate_limit: RateLimitConfig = field(default_factory=RateLimitConfig)
    dashboard: DashboardConfig = field(default_factory=DashboardConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    firebase: FirebaseConfig = field(default_factory=FirebaseConfig)


def _deep_merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        elif v != "":
            out[k] = v
    return out


def load_config() -> AppConfig:
    """Loads configuration from YAML, environment, and defaults into dataclasses."""
    cfg_data = {
        "server": {},
        "auth": {},
        "rate_limit": {},
        "dashboard": {},
        "logging": {},
        "security": {},
        "database": {},
        "firebase": {},
    }

    cfg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.yaml")
    if os.path.exists(cfg_path) and HAS_YAML:
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                user_cfg = yaml.safe_load(f) or {}
            cfg_data = _deep_merge(cfg_data, user_cfg)
        except Exception as e:
            print(f"WARNING: config.yaml parse error ({e}) — using defaults.")

    return AppConfig(
        server=ServerConfig(**cfg_data.get("server", {})),
        auth=AuthConfig(
            enabled=cfg_data.get("auth", {}).get("enabled", True),
            api_key=os.getenv("API_KEY") or cfg_data.get("auth", {}).get("api_key", ""),
        ),
        rate_limit=RateLimitConfig(**cfg_data.get("rate_limit", {})),
        dashboard=DashboardConfig(**cfg_data.get("dashboard", {})),
        logging=LoggingConfig(**cfg_data.get("logging", {})),
        security=SecurityConfig(**cfg_data.get("security", {})),
        database=DatabaseConfig(**cfg_data.get("database", {})),
        firebase=FirebaseConfig(
            enabled=os.getenv("FIREBASE_CONFIG") is not None,
            config=os.getenv("FIREBASE_CONFIG") or "",
        ),
    )


CFG = load_config()

# ── L1T_GRID Streaming Configuration ────────────────────────────────────────
REAL_DEBRID_API_KEY = os.getenv("RD_API_KEY", "")
RD_API_BASE = "https://api.real-debrid.com/rest/1.0"


# ════════════════════════════════════════════════════════════════════════════
#  LOGGING SETUP
# ════════════════════════════════════════════════════════════════════════════
class SanitizingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = Validator.sanitize_log(record.msg)
        if isinstance(record.args, tuple):
            record.args = tuple(Validator.sanitize_log(str(arg)) for arg in record.args)
        return True


class RequestContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = getattr(threading.current_thread(), "request_id", "-")
        return True


def setup_logging() -> logging.Logger:
    log_cfg = CFG.logging
    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), log_cfg.file)
    level = getattr(logging, log_cfg.level.upper(), logging.INFO)

    logger = logging.getLogger("overlord")
    logger.setLevel(level)
    logger.handlers = []
    logger.addFilter(SanitizingFilter())
    logger.addFilter(RequestContextFilter())

    fmt = (
        logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "request_id": "%(request_id)s", "message": "%(message)s"}',
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        if log_cfg.json_format
        else logging.Formatter(
            "[%(asctime)s] %(levelname)-8s [%(request_id)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )

    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    try:
        fh = logging.handlers.RotatingFileHandler(
            log_path,
            maxBytes=log_cfg.max_bytes,
            backupCount=log_cfg.backup_count,
            encoding="utf-8",
        )
        fh.setFormatter(fmt)
        logger.addHandler(fh)
    except OSError as e:
        logger.warning(f"Could not open log file {log_path}: {e}")

    return logger


log = setup_logging()


# ════════════════════════════════════════════════════════════════════════════
#  INPUT VALIDATION
# ════════════════════════════════════════════════════════════════════════════
@dataclass
class ValidationResult:
    valid: bool
    error: Optional[str] = None


class Validator:
    API_KEY_MIN_LENGTH = 32
    API_KEY_MAX_LENGTH = 128
    API_KEY_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")

    @classmethod
    def api_key(cls, key: str) -> ValidationResult:
        if not key:
            return ValidationResult(False, "API key is required")
        if len(key) < cls.API_KEY_MIN_LENGTH:
            return ValidationResult(
                False, f"API key must be at least {cls.API_KEY_MIN_LENGTH} characters"
            )
        if len(key) > cls.API_KEY_MAX_LENGTH:
            return ValidationResult(
                False, f"API key must not exceed {cls.API_KEY_MAX_LENGTH} characters"
            )
        if not cls.API_KEY_PATTERN.match(key):
            return ValidationResult(False, "API key contains invalid characters")
        return ValidationResult(True)

    @classmethod
    def port(cls, port: int) -> ValidationResult:
        if not isinstance(port, int) or not (1 <= port <= 65535):
            return ValidationResult(False, "Port must be between 1 and 65535")
        return ValidationResult(True)

    @classmethod
    def magnet_link(cls, magnet: str) -> ValidationResult:
        if not magnet or not magnet.startswith("magnet:?"):
            return ValidationResult(False, "Invalid magnet link format")
        if "xt=urn:" not in magnet:
            return ValidationResult(False, "Magnet link missing hash (xt parameter)")
        if len(magnet) > 2048:
            return ValidationResult(False, "Magnet link too long")
        try:
            from urllib.parse import unquote

            unquote(magnet)
        except Exception:
            return ValidationResult(False, "Invalid URL encoding in magnet link")
        return ValidationResult(True)

    @classmethod
    def url(cls, url: str) -> ValidationResult:
        if not url or not url.startswith(("http://", "https://")):
            return ValidationResult(False, "URL must start with http:// or https://")
        try:
            from urllib.parse import urlsplit

            parsed = urlsplit(url)
            if parsed.scheme not in ("http", "https") or not parsed.netloc:
                return ValidationResult(False, "Invalid URL structure")
            hostname = parsed.hostname or ""
            if hostname in ("localhost", "0.0.0.0", "0.0.0.0", "::1") or re.match(
                r"^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)", hostname
            ):
                return ValidationResult(False, "Local or private IP ranges not allowed")
            if len(url) > 2048:
                return ValidationResult(False, "URL too long")
            for pattern in [
                "javascript:",
                "data:",
                "vbscript:",
                "file:",
                "ftp:",
                "<script",
                "onerror=",
                "onload=",
            ]:
                if pattern in url.lower():
                    return ValidationResult(
                        False, f"URL contains forbidden pattern: {pattern}"
                    )
            return ValidationResult(True)
        except Exception as e:
            return ValidationResult(False, f"URL validation error: {str(e)}")

    @classmethod
    def sanitize_log(cls, message: str) -> str:
        if not isinstance(message, str):
            message = str(message)
        patterns = [
            (r'api[_-]?key[=:]\s*["\']?\S+["\']?', "api_key=***REDACTED***"),
            (r'token[=:]\s*["\']?\S+["\']?', "token=***REDACTED***"),
            (r'password[=:]\s*["\']?\S+["\']?', "password=***REDACTED***"),
            (r'secret[=:]\s*["\']?\S+["\']?', "secret=***REDACTED***"),
            (r"authorization[:\s]+\S+", "authorization=***REDACTED***"),
            (r"x-api-key[:\s]+\S+", "x-api-key=***REDACTED***"),
            (r"Bearer\s+\S+", "Bearer ***REDACTED***"),
            (r"(?i)(rd_api_key|firebase_config)[=:]\s*\S+", "***REDACTED***"),
        ]
        for pattern, replacement in patterns:
            message = re.sub(pattern, replacement, message)
        return message


# Validate configuration on startup
if CFG.auth.enabled:
    key_validation = Validator.api_key(CFG.auth.api_key)
    if not key_validation.valid:
        log.critical(f"INVALID API KEY: {key_validation.error}")
        log.critical(
            'Generate a new key: python -c "import secrets; print(secrets.token_urlsafe(32))"'
        )
        sys.exit(1)


# ════════════════════════════════════════════════════════════════════════════
#  DATABASE LAYER
# ════════════════════════════════════════════════════════════════════════════
class MetricsDatabase:
    def __init__(self, db_path: str = "overlord.db", cleanup_interval_hours: int = 1):
        self.db_path = db_path
        self._local = threading.local()
        self._cleanup_interval = cleanup_interval_hours * 3600
        self._last_cleanup = time.time()
        self._cleanup_lock = threading.Lock()
        self._init_db()
        self._start_cleanup_thread()

    def _start_cleanup_thread(self):
        def cleanup_loop():
            while True:
                time.sleep(self._cleanup_interval)
                try:
                    self.cleanup_old_data(CFG.database.retention_days)
                    self._vacuum_if_needed()
                    log.debug("Database cleanup completed")
                except Exception as e:
                    log.error(f"Background cleanup error: {e}")

        thread = threading.Thread(target=cleanup_loop, daemon=True)
        thread.name = "db-cleanup"
        thread.start()
        log.info("Database cleanup thread started")

    def _vacuum_if_needed(self):
        try:
            size_mb = os.path.getsize(self.db_path) / (1024 * 1024)
            if size_mb > 100:
                with sqlite3.connect(
                    self.db_path, detect_types=sqlite3.PARSE_DECLTYPES
                ) as conn:
                    conn.execute("VACUUM")
                log.info(f"Database vacuumed (was {size_mb:.1f}MB)")
        except Exception as e:
            log.debug(f"Vacuum check error: {e}")

    def close(self):
        if hasattr(self._local, "connection") and self._local.connection:
            try:
                self._local.connection.close()
            except Exception:
                pass
            self._local.connection = None

    def _get_connection(self) -> sqlite3.Connection:
        if not hasattr(self._local, "connection") or self._local.connection is None:
            self._local.connection = sqlite3.connect(
                self.db_path,
                check_same_thread=False,
                detect_types=sqlite3.PARSE_DECLTYPES,
            )
            self._local.connection.row_factory = sqlite3.Row
        return self._local.connection

    def _init_db(self):
        try:
            with sqlite3.connect(
                self.db_path, detect_types=sqlite3.PARSE_DECLTYPES
            ) as conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        cpu_percent REAL, cpu_freq REAL,
                        memory_percent REAL, memory_used_gb REAL, memory_total_gb REAL,
                        disk_percent REAL, disk_used_gb REAL, disk_total_gb REAL,
                        network_sent_mb REAL, network_recv_mb REAL,
                        temperature REAL, gpu_data TEXT, hostname TEXT
                    );"""
                )
        except sqlite3.Error as e:
            log.error(f"Database initialization failed: {e}")
            sys.exit(1)

    def add_metrics(self, metrics: Dict[str, Any]):
        if not CFG.database.enabled:
            return
        conn = self._get_connection()
        try:
            with conn:
                conn.execute(
                    """
                    INSERT INTO metrics (
                        cpu_percent, cpu_freq, memory_percent, memory_used_gb, memory_total_gb,
                        disk_percent, disk_used_gb, disk_total_gb, network_sent_mb, network_recv_mb,
                        temperature, gpu_data, hostname
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        metrics.get("cpu_percent"),
                        metrics.get("cpu_freq"),
                        metrics.get("memory", {}).get("percent"),
                        metrics.get("memory", {}).get("used_gb"),
                        metrics.get("memory", {}).get("total_gb"),
                        metrics.get("disk", {}).get("percent"),
                        metrics.get("disk", {}).get("used_gb"),
                        metrics.get("disk", {}).get("total_gb"),
                        metrics.get("network", {}).get("sent_mb"),
                        metrics.get("network", {}).get("recv_mb"),
                        metrics.get("temperature"),
                        json.dumps(metrics.get("gpu")),
                        metrics.get("hostname"),
                    ),
                )
        except sqlite3.Error as e:
            log.error(f"Failed to write metrics to database: {e}")

    def get_historical_metrics(self, limit: int) -> List[Dict[str, Any]]:
        if not CFG.database.enabled:
            return []
        conn = self._get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM metrics ORDER BY timestamp DESC LIMIT ?", (limit,)
            )
            rows = [dict(row) for row in cursor.fetchall()]
            for row in rows:
                if row.get("gpu_data"):
                    row["gpu"] = json.loads(row["gpu_data"])
                    del row["gpu_data"]
            return rows
        except sqlite3.Error as e:
            log.error(f"Failed to fetch historical metrics: {e}")
            return []

    def cleanup_old_data(self, days_to_keep: int):
        if not CFG.database.enabled:
            return
        with self._cleanup_lock:
            if time.time() - self._last_cleanup < self._cleanup_interval:
                return

            cutoff = datetime.now() - timedelta(days=days_to_keep)
            conn = self._get_connection()
            try:
                with conn:
                    cursor = conn.execute(
                        "DELETE FROM metrics WHERE timestamp < ?", (cutoff,)
                    )
                log.info(f"Cleaned up {cursor.rowcount} old metric records.")
                self._last_cleanup = time.time()
            except sqlite3.Error as e:
                log.error(f"Error during database cleanup: {e}")


if CFG.database.enabled:
    db = MetricsDatabase(db_path=CFG.database.path)
else:
    db = None

# ... (The rest of the server implementation would go here)
# This part needs to be added to complete the file.
# For now, this is a placeholder.


def main():
    log.info(
        f"Starting Overlord Dashboard v{VERSION} on {CFG.server.host}:{CFG.server.port}"
    )


if __name__ == "__main__":
    main()
