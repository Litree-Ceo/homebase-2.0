import os
import sys
import time
from unittest.mock import patch

# Add project root to the Python path
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
)

import server
import pytest


@pytest.fixture(autouse=True)
def disable_firebase_for_tests():
    server.HAS_FIREBASE = False


@pytest.fixture
def clean_db():
    """Cleans the database before each test."""
    print("Cleaning DB")
    if server.db:
        with server.db._get_connection() as conn:
            conn.execute("DELETE FROM rate_limit_blocks")
            conn.commit()


def test_deep_merge_basic():
    from server import _deep_merge

    a = {"x": 1, "y": {"a": 1, "b": 2}}
    b = {"y": {"b": 3, "c": 4}, "z": 9}
    out = _deep_merge(a, b)
    assert out == {"x": 1, "y": {"a": 1, "b": 3, "c": 4}, "z": 9}
    # original dicts should not be mutated
    assert a["y"]["b"] == 2


def test_rate_limiter_allows_then_blocks(clean_db):
    server.RL_ON = True
    limiter = server.RateLimiter(rate=1.0, burst=1)
    ip = "1.2.3.4"
    assert limiter.allow(ip)[0] is True
    assert limiter.allow(ip)[0] is False


def test_rate_limiter_disabled_allows_all(clean_db):
    limiter = server.RateLimiter(rate=0.0001, burst=0)
    server.RL_ON = False
    try:
        assert limiter.allow("a")[0] is True
        assert limiter.allow("b")[0] is True
    finally:
        # restore for other tests
        server.RL_ON = True


def test_get_health_shape():
    d = server.get_health()
    assert {"status", "uptime_s", "psutil", "version"}.issubset(d.keys())
    assert d["status"] == "ok"
    assert d["uptime_s"] >= 0


def test_get_disk_path_is_string():
    p = server.get_disk_path()
    assert isinstance(p, str) and len(p) > 0


def test_get_all_disks_returns_list():
    disks = server.get_all_disks()
    assert isinstance(disks, list)
    for d in disks:
        assert "mountpoint" in d
        assert "percent" in d
        assert 0.0 <= d["percent"] <= 100.0


def test_get_system_stats_keys():
    stats = server.get_system_stats()
    if "error" in stats:
        return  # psutil not available — skip gracefully
    required = {"cpu", "ram", "disk", "network", "processes"}
    assert required.issubset(stats.keys())


def test_cpu_value_in_range():
    stats = server.get_system_stats()
    if "error" in stats:
        return
    assert 0.0 <= stats["cpu"]["percent"] <= 100.0


def test_ram_percent_in_range():
    stats = server.get_system_stats()
    if "error" in stats:
        return
    assert 0.0 <= stats["ram"]["percent"] <= 100.0


def test_top_procs_max_ten():
    stats = server.get_system_stats()
    if "error" in stats:
        return
    assert len(stats["processes"]) <= 10


def test_history_grows_on_each_call():
    from server import history

    before = len(history)
    server.get_system_stats()
    assert len(history) > before or len(history) == history.maxlen


def test_deep_merge_does_not_mutate_original():
    from server import _deep_merge

    base = {"a": {"x": 1}}
    _deep_merge(base, {"a": {"x": 99}})
    assert base["a"]["x"] == 1


def test_rate_limiter_refills(clean_db):
    server.RL_ON = True
    limiter = server.RateLimiter(rate=1000.0, burst=1)
    ip = "refill-test"
    print(f"Initial allow: {limiter.allow(ip)}")
    print(f"Second allow: {limiter.allow(ip)}")
    time.sleep(0.05)
    refill_allow = limiter.allow(ip)
    print(f"Refill allow: {refill_allow}")
    assert refill_allow[0] is True


def test_rate_limiter_per_ip_isolation(clean_db):
    server.RL_ON = True
    limiter = server.RateLimiter(rate=0.0, burst=1)
    assert limiter.allow("ip-a")[0] is True  # fresh bucket
    assert limiter.allow("ip-a")[0] is False  # exhausted
    assert limiter.allow("ip-b")[0] is True  # independent bucket
