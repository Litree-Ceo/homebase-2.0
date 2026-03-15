"""Database management module for Overlord Dashboard."""

import logging
import os
import sqlite3
import threading
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, TypedDict

# Use core logger for consistency and security sanitization
try:
    from core import get_logger

    log = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    log = logging.getLogger(__name__)

# Global database instance
_db_instance: Optional["MetricsDatabase"] = None
_db_lock = threading.Lock()


class GPUMetricsData(TypedDict, total=False):
    """Type definition for GPU metrics data."""

    available: bool
    devices: List[Dict[str, Any]]


class MetricsRecord(TypedDict):
    """Type definition for a single metrics record."""

    id: int
    timestamp: str
    cpu_percent: Optional[float]
    cpu_freq: Optional[float]
    memory_percent: Optional[float]
    memory_used_gb: Optional[float]
    memory_total_gb: Optional[float]
    disk_percent: Optional[float]
    disk_used_gb: Optional[float]
    disk_total_gb: Optional[float]
    network_sent_mb: Optional[float]
    network_recv_mb: Optional[float]
    gpu_data: Optional[str]
    hostname: Optional[str]
    gpu: Optional[GPUMetricsData]


class MetricsInput(TypedDict):
    """Type definition for metrics input data."""

    cpu_percent: Optional[float]
    cpu_freq: Optional[float]
    memory: Dict[str, float]
    disk: Dict[str, float]
    network: Dict[str, float]
    gpu: GPUMetricsData
    hostname: Optional[str]


class MetricsDatabase:
    """SQLite database for storing system metrics."""

    def __init__(
        self,
        db_path: str = "overlord.db",
        cleanup_interval_hours: int = 1,
        retention_days: int = 30,
    ) -> None:
        """Initialize the metrics database.

        Args:
            db_path: Path to the SQLite database file.
            cleanup_interval_hours: Hours between cleanup runs.
            retention_days: Days to retain metrics data.
        """
        self.db_path: str = db_path
        self._local = threading.local()
        self._cleanup_interval: float = cleanup_interval_hours * 3600
        self._retention_days: int = retention_days
        self._last_cleanup: float = time.time()
        self._cleanup_lock = threading.Lock()
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Get thread-local database connection.

        Returns:
            SQLite connection object.
        """
        if not hasattr(self._local, "connection") or self._local.connection is None:
            self._local.connection = sqlite3.connect(
                self.db_path,
                check_same_thread=False,
                detect_types=sqlite3.PARSE_DECLTYPES,
            )
            self._local.connection.row_factory = sqlite3.Row
        return self._local.connection

    def _init_db(self) -> None:
        """Initialize database schema."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        cpu_percent REAL,
                        cpu_freq REAL,
                        memory_percent REAL,
                        memory_used_gb REAL,
                        memory_total_gb REAL,
                        disk_percent REAL,
                        disk_used_gb REAL,
                        disk_total_gb REAL,
                        network_sent_mb REAL,
                        network_recv_mb REAL,
                        gpu_data TEXT,
                        hostname TEXT
                    )
                """
                )
                conn.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp 
                    ON metrics(timestamp)
                """
                )
            log.info(f"Database initialized: {self.db_path}")
        except sqlite3.Error as e:
            log.error(f"Database initialization failed: {e}")
            raise

    def add_metrics(self, metrics: MetricsInput) -> None:
        """Add system metrics to the database.

        Args:
            metrics: Dictionary containing system metrics.
        """
        import json

        conn = self._get_connection()
        try:
            with conn:
                conn.execute(
                    """
                    INSERT INTO metrics (
                        cpu_percent, cpu_freq, memory_percent, memory_used_gb, memory_total_gb,
                        disk_percent, disk_used_gb, disk_total_gb, network_sent_mb, network_recv_mb,
                        gpu_data, hostname
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        json.dumps(metrics.get("gpu")),
                        metrics.get("hostname"),
                    ),
                )
        except sqlite3.Error as e:
            log.error(f"Failed to write metrics: {e}")

    def get_historical_metrics(self, limit: int = 60) -> List[MetricsRecord]:
        """Get recent metrics from the database.

        Args:
            limit: Maximum number of records to return.

        Returns:
            List of metrics records with GPU data parsed from JSON.
        """
        import json

        conn = self._get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM metrics ORDER BY timestamp DESC LIMIT ?", (limit,)
            )
            rows: List[Dict[str, Any]] = [dict(row) for row in cursor.fetchall()]
            for row in rows:
                if row.get("gpu_data"):
                    try:
                        row["gpu"] = json.loads(row["gpu_data"])
                    except json.JSONDecodeError:
                        row["gpu"] = None
                    del row["gpu_data"]
            return rows  # type: ignore[return-value]
        except sqlite3.Error as e:
            log.error(f"Failed to fetch metrics: {e}")
            return []

    def cleanup_old_data(self, days_to_keep: Optional[int] = None) -> None:
        """Remove metrics older than specified days.

        Args:
            days_to_keep: Number of days of data to retain.
        """
        if days_to_keep is None:
            days_to_keep = self._retention_days

        with self._cleanup_lock:
            if time.time() - self._last_cleanup < 300:  # Min 5 min between cleanups
                return

            cutoff = datetime.now() - timedelta(days=days_to_keep)
            conn = self._get_connection()
            try:
                with conn:
                    cursor = conn.execute(
                        "DELETE FROM metrics WHERE timestamp < ?", (cutoff,)
                    )
                if cursor.rowcount > 0:
                    log.info(f"Cleaned up {cursor.rowcount} old metric records")
                self._last_cleanup = time.time()
            except sqlite3.Error as e:
                log.error(f"Error during cleanup: {e}")

    def vacuum(self) -> None:
        """Compact the database file."""
        try:
            size_before = os.path.getsize(self.db_path)
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("VACUUM")
            size_after = os.path.getsize(self.db_path)
            log.info(
                f"Database vacuumed: {size_before / 1024 / 1024:.1f}MB -> "
                f"{size_after / 1024 / 1024:.1f}MB"
            )
        except Exception as e:
            log.error(f"Vacuum error: {e}")


def get_db(db_path: str = "overlord.db", retention_days: int = 30) -> "MetricsDatabase":
    """Get or create the global database instance.

    Args:
        db_path: Path to the database file.
        retention_days: Days to retain metrics data.

    Returns:
        MetricsDatabase singleton instance.
    """
    global _db_instance
    if _db_instance is None:
        with _db_lock:
            if _db_instance is None:
                _db_instance = MetricsDatabase(
                    db_path=db_path, retention_days=retention_days
                )
    return _db_instance


def clear_old_logs_periodically(
    interval_hours: int = 1, retention_days: int = 30
) -> None:
    """Background thread function for periodic database cleanup.

    This function is designed to run in a daemon thread.

    Args:
        interval_hours: Hours between cleanup runs.
        retention_days: Days of data to retain.
    """
    db = get_db(retention_days=retention_days)
    log.info("Database cleanup thread started")

    while True:
        try:
            time.sleep(interval_hours * 3600)
            db.cleanup_old_data(retention_days)

            # Vacuum if database is large
            try:
                size_mb = os.path.getsize(db.db_path) / (1024 * 1024)
                if size_mb > 100:  # Vacuum if > 100MB
                    db.vacuum()
            except OSError:
                pass

        except Exception as e:
            log.error(f"Cleanup thread error: {e}")
