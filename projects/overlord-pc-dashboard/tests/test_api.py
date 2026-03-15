import threading
import time
import socketserver
from collections import namedtuple

import psutil
import pytest
import requests

import server as srv
from server import CFG, AgentHandler

# Use config values from server
API_KEY = CFG.auth.api_key
PORT = CFG.server.port

# Use a different port for testing to avoid conflicts
TEST_PORT = PORT + 1
TEST_HOST = "127.0.0.1"

# Define a dummy net_io_counters result for mocking
NET_IO = namedtuple(
    "snetio",
    [
        "bytes_sent",
        "bytes_recv",
        "packets_sent",
        "packets_recv",
        "errin",
        "errout",
        "dropin",
        "dropout",
    ],
)
REQUEST_TIMEOUT_SECONDS = 5
pytestmark = pytest.mark.usefixtures("test_server")


@pytest.fixture(scope="function", name="server_url")
def fixture_server_url():
    """Fixture to provide the base URL for the test server."""
    # NOTE: HOST is commonly set to 0.0.0.0 for binding, but clients cannot
    # connect to 0.0.0.0 on Windows. Use loopback for test requests.
    return f"http://{TEST_HOST}:{TEST_PORT}"


@pytest.fixture(scope="function", name="test_server")
def fixture_test_server(monkeypatch):
    """
    Fixture to start and stop the server in a background thread.
    It also mocks psutil to prevent PermissionErrors in restricted environments
    and forces authentication to be enabled for the tests.
    """
    # Mock psutil.net_io_counters to avoid PermissionError
    monkeypatch.setattr(
        psutil, "net_io_counters", lambda: NET_IO(1024, 1024, 100, 100, 0, 0, 0, 0)
    )

    # Force authentication to be on for testing purposes
    monkeypatch.setattr("server.CFG.auth.enabled", True)



    # Bind to loopback to avoid exposing test server on LAN.
    server_address = (TEST_HOST, TEST_PORT)
    httpd = socketserver.TCPServer(server_address, AgentHandler)

    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    # Give the server a moment to start up
    time.sleep(0.5)

    yield

    # Shutdown the server
    httpd.shutdown()
    server_thread.join()


def test_health_check(server_url):
    """Tests the public /api/health endpoint."""
    response = requests.get(f"{server_url}/api/health", timeout=REQUEST_TIMEOUT_SECONDS)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"



def test_stats_unauthorized(server_url):
    """Tests that /api/stats returns 401 without an API key."""
    response = requests.get(f"{server_url}/api/stats", timeout=REQUEST_TIMEOUT_SECONDS)
    assert response.status_code == 401


def test_stats_authorized(server_url):
    """Tests that /api/stats returns 200 with a valid API key."""
    headers = {"X-API-Key": API_KEY}
    response = requests.get(
        f"{server_url}/api/stats", headers=headers, timeout=REQUEST_TIMEOUT_SECONDS
    )
    assert response.status_code == 200
    data = response.json()
    # Check for the presence of the error key from the stats function itself
    if "error" in data:
        # This can happen if other psutil calls fail, which is okay for this test
        # as long as the API authorization worked.
        pass
    else:
        # Check nested structure: cpu is an object with percent property
        assert "cpu" in data
        assert isinstance(data["cpu"], dict)
        assert "percent" in data["cpu"]
        # ram is nested object with percent property
        assert "ram" in data
        assert isinstance(data["ram"], dict)
        assert "percent" in data["ram"]


def test_stats_authorized_via_query_param(server_url):
    """Tests that /api/stats can be authorized via a query parameter."""
    response = requests.get(
        f"{server_url}/api/stats?api_key={API_KEY}", timeout=REQUEST_TIMEOUT_SECONDS
    )
    assert response.status_code == 200
    data = response.json()
    if "error" in data:
        pass
    else:
        # Check nested cpu structure
        assert "cpu" in data
        assert isinstance(data["cpu"], dict)
        assert "percent" in data["cpu"]


def test_stats_wrong_key_returns_401(server_url):
    """Tests that /api/stats returns 401 with a wrong API key."""
    response = requests.get(
        f"{server_url}/api/stats",
        headers={"X-API-Key": "wrong-key"},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    assert response.status_code == 401


def test_config_returns_200(server_url):
    """Tests that /api/config is a public endpoint returning config info."""
    response = requests.get(f"{server_url}/api/config", timeout=REQUEST_TIMEOUT_SECONDS)
    assert response.status_code == 200
    data = response.json()
    assert "auth_on" in data
    assert "refresh_interval_ms" in data
    assert "max_history_entries" in data



