"""Prometheus-style metrics collection."""

from prometheus_client import Counter, Histogram, Gauge, Info

# Application info
app_info = Info("overlord", "Overlord Dashboard Application Info")

# HTTP metrics
http_requests_total = Counter(
    "overlord_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)

http_request_duration_seconds = Histogram(
    "overlord_http_request_duration_seconds",
    "HTTP request duration",
    ["method", "endpoint"],
)

# System metrics (gauges)
system_cpu_percent = Gauge(
    "overlord_system_cpu_percent", "Current CPU usage percentage"
)

system_memory_percent = Gauge(
    "overlord_system_memory_percent", "Current memory usage percentage"
)

system_disk_percent = Gauge(
    "overlord_system_disk_percent", "Current disk usage percentage"
)

# WebSocket metrics
websocket_connections_total = Counter(
    "overlord_websocket_connections_total", "Total WebSocket connections"
)

websocket_connections_active = Gauge(
    "overlord_websocket_connections_active", "Active WebSocket connections"
)

websocket_messages_total = Counter(
    "overlord_websocket_messages_total",
    "Total WebSocket messages",
    ["direction"],  # "in" or "out"
)

# Database metrics
database_query_duration_seconds = Histogram(
    "overlord_database_query_duration_seconds", "Database query duration", ["operation"]
)

database_connections_active = Gauge(
    "overlord_database_connections_active", "Active database connections"
)


def set_app_info(version: str, environment: str):
    """Set application info metrics."""
    app_info.info(
        {
            "version": version,
            "environment": environment,
        }
    )
