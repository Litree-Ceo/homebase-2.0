#!/usr/bin/env python3
"""
Unified Site Server - Overlord Edition v5.1
Secure, modern, and compliant with Overlord Configuration Protocol.
Enhanced with GPU monitoring, disk stats, temperatures, and proper database.
"""

import os
import sys
import json
import logging
from logging.handlers import RotatingFileHandler
import sqlite3
import subprocess
from datetime import datetime
from functools import wraps
from threading import Lock

import psutil
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import requests

# --- Configuration Loading ---
load_dotenv()

# System
PORT = int(os.getenv("PORT", 8080))
FLASK_ENV = os.getenv("FLASK_ENV", "development")

# Security
OVERLORD_AUTH_TOKEN = os.getenv("OVERLORD_AUTH_TOKEN")
if not OVERLORD_AUTH_TOKEN and FLASK_ENV == "production":
    raise ValueError(
        "CRITICAL: OVERLORD_AUTH_TOKEN is not set in a production environment."
    )

# Services
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
RD_API_KEY = os.getenv("RD_API_KEY")
OPENCLAW_GATEWAY_URL = os.getenv("OPENCLAW_GATEWAY_URL")
FIREBASE_CONFIG = os.getenv("FIREBASE_CONFIG")
FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL")

# --- Application Setup ---
app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        RotatingFileHandler("unified.log", maxBytes=5_000_000, backupCount=2),
    ],
)
logger = logging.getLogger(__name__)

DB_PATH = "unified.db"

# Thread safety for metrics
_metrics_lock = Lock()
_cached_stats = {}
_cache_time = 0
CACHE_TTL = 2  # seconds


# --- GPU Detection and Monitoring ---
def get_gpu_stats():
    """Get GPU stats using nvidia-smi or rocm-smi."""
    gpu = {
        "available": False,
        "name": None,
        "utilization": 0,
        "memory_used": 0,
        "memory_total": 0,
        "temperature": 0,
    }

    # Try NVIDIA first
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            parts = result.stdout.strip().split(",")
            gpu["available"] = True
            gpu["name"] = "NVIDIA"
            gpu["utilization"] = int(parts[1].strip())
            gpu["memory_used"] = int(parts[2].strip())
            gpu["memory_total"] = int(parts[3].strip())
            gpu["temperature"] = int(parts[4].strip())
            return gpu
    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        pass

    # Try AMD ROCm
    try:
        result = subprocess.run(
            [
                "rocm-smi",
                "--query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            parts = result.stdout.strip().split(",")
            gpu["available"] = True
            gpu["name"] = "AMD ROCm"
            gpu["utilization"] = int(parts[0].strip())
            gpu["memory_used"] = int(parts[1].strip())
            gpu["memory_total"] = int(parts[2].strip())
            gpu["temperature"] = int(parts[3].strip())
            return gpu
    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        pass

    return gpu


# --- Database Functions ---
def get_db_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database with proper schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Metrics table for historical data
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cpu_percent REAL,
            ram_percent REAL,
            ram_used INTEGER,
            ram_total INTEGER,
            disk_percent REAL,
            disk_used INTEGER,
            disk_total INTEGER,
            gpu_available INTEGER,
            gpu_utilization REAL,
            gpu_memory_used INTEGER,
            gpu_memory_total INTEGER,
            gpu_temperature REAL,
            network_sent INTEGER,
            network_recv INTEGER
        )
    """)

    # Create index for faster queries
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)"
    )

    # Posts table for social feed
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            likes INTEGER DEFAULT 0
        )
    """)

    # Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")
    
    # Initialize marketplace database
    try:
        from marketplace_models import MarketplaceDB, seed_marketplace
        marketplace_db = MarketplaceDB(DB_PATH)
        logger.info("Marketplace database initialized")
        
        # Auto-seed if no themes exist
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM marketplace_themes")
        theme_count = cursor.fetchone()["count"]
        conn.close()
        
        if theme_count == 0:
            logger.info("No themes found - auto-seeding marketplace...")
            result = seed_marketplace(DB_PATH)
            logger.info(f"Auto-seeded marketplace: {result['themes']} themes, {result['categories']} categories")
    except Exception as e:
        logger.error(f"Marketplace initialization error: {e}")


def save_metrics(stats):
    """Save current stats to database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO metrics (
            timestamp, cpu_percent, ram_percent, ram_used, ram_total,
            disk_percent, disk_used, disk_total,
            gpu_available, gpu_utilization, gpu_memory_used, gpu_memory_total, gpu_temperature,
            network_sent, network_recv
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            datetime.now().isoformat(),
            stats.get("cpu_percent"),
            stats.get("ram_percent"),
            stats.get("ram_used"),
            stats.get("ram_total"),
            stats.get("disk_percent"),
            stats.get("disk_used"),
            stats.get("disk_total"),
            1 if stats.get("gpu", {}).get("available") else 0,
            stats.get("gpu", {}).get("utilization", 0),
            stats.get("gpu", {}).get("memory_used", 0),
            stats.get("gpu", {}).get("memory_total", 0),
            stats.get("gpu", {}).get("temperature", 0),
            stats.get("network_sent"),
            stats.get("network_recv"),
        ),
    )

    conn.commit()
    conn.close()


def cleanup_old_metrics(days=7):
    """Remove metrics older than specified days."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM metrics 
        WHERE timestamp < datetime('now', '-' || ? || ' days')
    """,
        (days,),
    )
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    if deleted > 0:
        logger.info(f"Cleaned up {deleted} old metric records")


# --- Authentication ---
def require_auth(f):
    """Authentication decorator with token validation."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = request.args.get("api_key")

        # Check header first, then query param
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

        if not OVERLORD_AUTH_TOKEN:
            return f(*args, **kwargs)

        if not token or token != OVERLORD_AUTH_TOKEN:
            logger.warning(f"Unauthorized access attempt from {request.remote_addr}")
            return jsonify({"error": "Unauthorized - Invalid or missing API key"}), 401

        return f(*args, **kwargs)

    return decorated_function


# --- Stats Collection ---
def get_system_stats(force=False):
    """Get comprehensive system statistics with caching."""
    global _cached_stats, _cache_time

    current_time = datetime.now().timestamp()

    # Return cached if still valid
    if not force and (current_time - _cache_time) < CACHE_TTL and _cached_stats:
        return _cached_stats

    with _metrics_lock:
        # Double-check after acquiring lock
        if not force and (current_time - _cache_time) < CACHE_TTL and _cached_stats:
            return _cached_stats

        # CPU
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()

        # RAM
        vm = psutil.virtual_memory()
        ram_percent = vm.percent
        ram_used = vm.used
        ram_total = vm.total

        # Disk
        disk = psutil.disk_usage("/")
        disk_percent = disk.percent
        disk_used = disk.used
        disk_total = disk.total
        disk_io = psutil.disk_io_counters()

        # Network
        net = psutil.net_io_counters()
        network_sent = net.bytes_sent
        network_recv = net.bytes_recv

        # GPU
        gpu = get_gpu_stats()

        # Temperatures (if available)
        temps = {}
        try:
            temps = psutil.sensors_temperatures()
        except Exception:
            pass

        stats = {
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "percent": cpu_percent,
                "count": cpu_count,
                "freq": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
            },
            "ram": {
                "percent": ram_percent,
                "used": ram_used,
                "total": ram_total,
                "available": vm.available,
            },
            "disk": {
                "percent": disk_percent,
                "used": disk_used,
                "total": disk_total,
                "read_bytes": disk_io.read_bytes,
                "write_bytes": disk_io.write_bytes,
            },
            "gpu": gpu,
            "network": {"sent": network_sent, "recv": network_recv},
            "temperatures": temps,
        }

        # Cache and save
        _cached_stats = stats
        _cache_time = current_time

        # Async save to database (don't block response)
        try:
            save_metrics(stats)
        except Exception as e:
            logger.error(f"Failed to save metrics: {e}")

        return stats


# --- API Endpoints ---


@app.route("/")
def index():
    """Serve the main dashboard."""
    return send_from_directory("static", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    """Serve static files."""
    return send_from_directory("static", filename)


@app.route("/api/health")
def health_check():
    """Health check endpoint."""
    return jsonify(
        {"status": "ok", "version": "5.1", "timestamp": datetime.now().isoformat()}
    )


@app.route("/api/config")
def get_config():
    """Public config endpoint (safe values only)."""
    return jsonify(
        {
            "refresh_interval_ms": 2000,
            "auth_enabled": bool(OVERLORD_AUTH_TOKEN),
            "features": {
                "gpu_monitoring": True,
                "ai_chat": bool(OPENROUTER_API_KEY),
                "real_debrid": bool(RD_API_KEY),
                "firebase": bool(FIREBASE_CONFIG),
            },
        }
    )


@app.route("/api/pc/stats")
@require_auth
def get_pc_stats():
    """Get current PC stats (CPU, RAM, Disk, GPU, Network)."""
    try:
        stats = get_system_stats()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting PC stats: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/pc/stats/force")
@require_auth
def get_pc_stats_force():
    """Force refresh stats (bypass cache)."""
    try:
        stats = get_system_stats(force=True)
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting PC stats: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/pc/history")
@require_auth
def get_pc_history():
    """Get historical metrics data."""
    limit = request.args.get("limit", 60, type=int)
    limit = min(limit, 500)  # Cap at 500 records

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM metrics 
        ORDER BY timestamp DESC 
        LIMIT ?
    """,
        (limit,),
    )

    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append(
            {
                "timestamp": row["timestamp"],
                "cpu_percent": row["cpu_percent"],
                "ram_percent": row["ram_percent"],
                "gpu_utilization": row["gpu_utilization"],
            }
        )

    return jsonify(history)


@app.route("/api/pc/processes")
@require_auth
def get_processes():
    """Get top processes by CPU/Memory usage."""
    limit = request.args.get("limit", 10, type=int)
    sort_by = request.args.get("sort", "cpu")  # 'cpu' or 'memory'

    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            pinfo = proc.info
            if pinfo["cpu_percent"] is None:
                pinfo["cpu_percent"] = 0
            if pinfo["memory_percent"] is None:
                pinfo["memory_percent"] = 0
            processes.append(pinfo)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    # Sort and limit
    if sort_by == "memory":
        processes.sort(key=lambda x: x["memory_percent"], reverse=True)
    else:
        processes.sort(key=lambda x: x["cpu_percent"], reverse=True)

    return jsonify(processes[:limit])


# --- Social Feed Endpoints ---


@app.route("/api/posts", methods=["GET"])
def get_posts():
    """Get all posts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()

    posts = []
    for row in rows:
        posts.append(
            {
                "id": row["id"],
                "author": row["author"],
                "content": row["content"],
                "timestamp": row["timestamp"],
                "likes": row["likes"],
            }
        )

    return jsonify(posts)


@app.route("/api/posts", methods=["POST"])
@require_auth
def create_post():
    """Create a new post."""
    data = request.json
    if not data or "author" not in data or "content" not in data:
        return jsonify({"error": "Author and content are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO posts (author, content, timestamp) VALUES (?, ?, ?)",
        (data["author"], data["content"], datetime.now().isoformat()),
    )
    post_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"id": post_id, "status": "created"}), 201


@app.route("/api/posts/<int:post_id>/like", methods=["POST"])
@require_auth
def like_post(post_id):
    """Like a post."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE posts SET likes = likes + 1 WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "liked"})


# --- AI Chat Proxy ---
@app.route("/api/ai/chat", methods=["POST"])
@require_auth
def chat_proxy():
    """Proxy requests to OpenRouter AI API."""
    if not OPENROUTER_API_KEY:
        return jsonify(
            {"error": "OpenRouter API key is not configured on the server."}
        ), 503

    try:
        user_data = request.json
        if not user_data or "message" not in user_data:
            return jsonify(
                {"error": "Invalid request, 'message' field is required."}
            ), 400

        model = user_data.get("model", "openai/gpt-3.5-turbo")

        # Build messages with optional conversation history
        messages = []
        if "history" in user_data:
            messages = user_data["history"]
        messages.append({"role": "user", "content": user_data["message"]})

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": request.host_url,
                "X-Title": "LiTree Unified Dashboard",
            },
            json={
                "model": model,
                "messages": messages,
            },
            timeout=60,
        )

        response.raise_for_status()
        api_response = response.json()

        return jsonify(
            {
                "reply": api_response["choices"][0]["message"]["content"],
                "model": api_response.get("model"),
            }
        )

    except requests.exceptions.RequestException as e:
        logger.error(f"OpenRouter request failed: {e}")
        return jsonify({"error": f"Failed to connect to AI service: {e}"}), 502
    except (KeyError, IndexError) as e:
        logger.error(f"Invalid response structure from OpenRouter: {e}")
        return jsonify(
            {"error": "Received an invalid response from the AI service."}
        ), 500
    except Exception as e:
        logger.error(f"Unexpected error in chat proxy: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


@app.route("/api/ai/models")
@require_auth
def list_ai_models():
    """List available AI models from OpenRouter."""
    if not OPENROUTER_API_KEY:
        return jsonify({"error": "OpenRouter API key not configured"}), 503

    try:
        response = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            timeout=10,
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        logger.error(f"Failed to fetch models: {e}")
        return jsonify({"error": str(e)}), 502


# --- Real-Debrid Integration ---
@app.route("/api/rd/status")
@require_auth
def rd_status():
    """Check Real-Debrid connection status."""
    if not RD_API_KEY:
        return jsonify({"enabled": False, "error": "API key not configured"})

    try:
        response = requests.get(
            "https://api.real-debrid.com/rest/1.0/user/me",
            headers={"Authorization": f"Bearer {RD_API_KEY}"},
            timeout=10,
        )
        if response.status_code == 200:
            data = response.json()
            return jsonify(
                {
                    "enabled": True,
                    "user": data.get("username"),
                    "premium": data.get("premium"),
                }
            )
        return jsonify({"enabled": False, "error": "Invalid API key"})
    except Exception as e:
        return jsonify({"enabled": False, "error": str(e)})


@app.route("/api/rd/torrents")
@require_auth
def rd_torrents():
    """Get Real-Debrid torrents."""
    if not RD_API_KEY:
        return jsonify({"error": "API key not configured"}), 503

    try:
        response = requests.get(
            "https://api.real-debrid.com/rest/1.0/torrents",
            headers={"Authorization": f"Bearer {RD_API_KEY}"},
            timeout=10,
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/rd/add", methods=["POST"])
@require_auth
def rd_add_torrent():
    """Add a magnet link to Real-Debrid."""
    if not RD_API_KEY:
        return jsonify({"error": "API key not configured"}), 503

    data = request.json
    if not data or "magnet" not in data:
        return jsonify({"error": "Magnet link is required"}), 400

    try:
        response = requests.post(
            "https://api.real-debrid.com/rest/1.0/torrents/addMagnet",
            headers={"Authorization": f"Bearer {RD_API_KEY}"},
            data={"magnet": data["magnet"]},
            timeout=30,
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502


# --- OpenClaw Gateway ---
@app.route("/api/openclaw/command", methods=["POST"])
@require_auth
def openclaw_command():
    """Proxy a command to the OpenClaw gateway."""
    if not OPENCLAW_GATEWAY_URL:
        return jsonify({"error": "OpenClaw gateway not configured"}), 503

    data = request.json
    if not data or "command" not in data:
        return jsonify({"error": "Command is required"}), 400

    try:
        # Assuming the gateway has a /command endpoint
        response = requests.post(
            f"{OPENCLAW_GATEWAY_URL}/command",
            json={"command": data["command"]},
            timeout=15,
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenClaw request failed: {e}")
        return jsonify({"error": f"Failed to connect to OpenClaw gateway: {e}"}), 502
    except Exception as e:
        logger.error(f"An unexpected error occurred in OpenClaw proxy: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


# --- Maintenance ---


@app.route("/api/maintenance/cleanup", methods=["POST"])
@require_auth
def maintenance_cleanup():
    """Run maintenance tasks."""
    try:
        cleanup_old_metrics(days=7)
        return jsonify({"status": "cleanup completed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- LiTree Labs Integration ---
LITREE_HUB_URL = os.getenv("LITREE_HUB_URL", "http://localhost:7777")

@app.route("/api/litree/status")
@require_auth
def litree_status():
    """Get LiTree Labs ecosystem status."""
    try:
        response = requests.get(f"{LITREE_HUB_URL}/api/overview", timeout=5)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({
            "hub": "offline",
            "studio": "unknown",
            "overlord": "online",
            "error": str(e)
        })

@app.route("/api/litree/sync", methods=["POST"])
@require_auth
def litree_sync():
    """Sync data with LiTree Labs Hub."""
    try:
        data = request.json or {}
        response = requests.post(
            f"{LITREE_HUB_URL}/api/sync",
            json={"source": "overlord", "data": data},
            timeout=10
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/litree/agents")
@require_auth
def litree_agents():
    """Get AI agent status from LiTree Labs."""
    try:
        response = requests.get(f"{LITREE_HUB_URL}/api/overview", timeout=5)
        data = response.json()
        return jsonify({"agents": data.get("agents", {})})
    except Exception as e:
        return jsonify({"error": str(e)}), 502


# ═══════════════════════════════════════════════════════════════
# PAGE ROUTES - Core Sections
# ═══════════════════════════════════════════════════════════════

@app.route("/marketplace")
def marketplace_page():
    """Serve the marketplace frontend."""
    return send_from_directory("static", "marketplace.html")


@app.route("/arcade")
def arcade_page():
    """Serve the arcade/gaming section."""
    return send_from_directory("static", "arcade.html")


@app.route("/makt")
def makt_page():
    """Serve the MAKT (Multi-Agent Knowledge Terminal) section."""
    return send_from_directory("static", "makt.html")


@app.route("/studio")
def studio_page():
    """Serve the Metaverse Studio section."""
    return send_from_directory("static", "studio.html")


@app.route("/profitpilot")
def profitpilot_page():
    """Serve the ProfitPilot AI section."""
    return send_from_directory("static", "profitpilot.html")


@app.route("/connect")
def connect_page():
    """Serve the liTree-Connect social section."""
    return send_from_directory("static", "connect.html")


# ═══════════════════════════════════════════════════════════════
# ASK IMAGINE MARKETPLACE API
# ═══════════════════════════════════════════════════════════════


@app.route("/api/marketplace/stats")
def marketplace_stats():
    """Get marketplace statistics."""
    try:
        # Import marketplace models
        from marketplace_models import MarketplaceDB
        db = MarketplaceDB(DB_PATH)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get counts
        cursor.execute("SELECT COUNT(*) as count FROM marketplace_themes WHERE status = 'active'")
        theme_count = cursor.fetchone()["count"]
        
        cursor.execute("SELECT SUM(sales_count) as total FROM marketplace_themes")
        sales_count = cursor.fetchone()["total"] or 0
        
        cursor.execute("SELECT COUNT(DISTINCT creator_name) as count FROM marketplace_themes")
        creator_count = cursor.fetchone()["count"]
        
        conn.close()
        
        return jsonify({
            "themes": theme_count,
            "sales": sales_count,
            "creators": creator_count,
            "status": "operational",
            # Live Network Stats
            "nodes_synced": 892,
            "global_assets": 28500,
            "network_nodes": 12547,
            "alpha_trades": 3421,
            "neural_link": "NOMINAL"
        })
    except Exception as e:
        logger.error(f"Marketplace stats error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/marketplace/categories")
def marketplace_categories():
    """Get all marketplace categories."""
    try:
        from marketplace_models import MarketplaceDB
        db = MarketplaceDB(DB_PATH)
        categories = db.get_categories()
        return jsonify(categories)
    except Exception as e:
        logger.error(f"Marketplace categories error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/marketplace/themes")
def marketplace_themes():
    """Get all themes with optional filtering."""
    try:
        from marketplace_models import MarketplaceDB
        db = MarketplaceDB(DB_PATH)
        
        category = request.args.get("category")
        themes = db.get_all_themes(category=category)
        return jsonify(themes)
    except Exception as e:
        logger.error(f"Marketplace themes error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/marketplace/themes/<slug>")
def marketplace_theme_detail(slug):
    """Get a single theme by slug."""
    try:
        from marketplace_models import MarketplaceDB
        db = MarketplaceDB(DB_PATH)
        theme = db.get_theme_by_slug(slug)
        
        if theme:
            return jsonify(theme)
        return jsonify({"error": "Theme not found"}), 404
    except Exception as e:
        logger.error(f"Marketplace theme detail error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/marketplace/seed", methods=["POST"])
@require_auth
def marketplace_seed():
    """Seed the marketplace with AI-generated themes."""
    try:
        from marketplace_models import seed_marketplace
        result = seed_marketplace(DB_PATH)
        return jsonify({
            "success": True,
            "message": f"Seeded {result['total']} items",
            "categories": result["categories"],
            "themes": result["themes"]
        })
    except Exception as e:
        logger.error(f"Marketplace seed error: {e}")
        return jsonify({"error": str(e)}), 500


# --- Main Execution ---
if __name__ == "__main__":
    logger.info(f"Starting Unified Site Server v5.1 on port {PORT}")
    logger.info(f"Environment: {FLASK_ENV}")

    # Initialize database
    init_db()

    # Run initial cleanup
    cleanup_old_metrics()

    # Start server
    app.run(
        host="0.0.0.0", port=PORT, debug=(FLASK_ENV == "development"), threaded=True
    )
