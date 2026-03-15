"""Overlord PC Dashboard - Traditional Python HTTP Server.

This is the legacy backend using Python's built-in http.server.
For modern applications, consider using main.py (FastAPI) instead.
"""

import http.server
import json
import logging
import os
import socketserver
import subprocess
import sys
from threading import Thread
from urllib.parse import urlparse

# Load environment variables from .env file
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, assume env vars are set externally

# Import from core module (unified configuration, logging, and stats)
from core import Config, get_config, get_gpu_stats, get_system_stats, logger
from db_manager import clear_old_logs_periodically
from discord_client import send_discord_notification

# --- Configuration ---
# Use core Config - loads from config.yaml and environment variables
config = get_config()
log = logger  # Use core logger for consistency

# Log startup
log.info("Starting Overlord Dashboard server.py (legacy backend)")


# --- Server --- #
class OverlordHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for the Overlord Dashboard."""

    def __init__(self, *args, **kwargs):
        # Correctly determine the directory for serving files.
        # When running as a script, __file__ is defined.
        # When running with `python -m http.server`, we fall back to cwd.
        base_dir = (
            os.path.dirname(os.path.abspath(__file__))
            if "__file__" in globals()
            else os.getcwd()
        )
        web_dir = os.path.join(base_dir, "web")
        super().__init__(*args, directory=web_dir, **kwargs)

    def _check_auth(self) -> bool:
        """Check if the request is authenticated."""
        # Use core Config's get method for nested keys
        auth_required = config.get("server.auth_required", True)
        if not auth_required:
            return True  # Authentication is disabled

        # Check for API key in the X-API-Key header
        api_key_header = self.headers.get("X-API-Key")

        # Use config for the expected key (reads from env via core Config)
        expected_key = config.get("auth.api_key", "")

        # Note: The startup check in run_server() ensures expected_key is present if auth is required.
        return api_key_header == expected_key

    def _send_json(self, data, status_code=200):
        """Helper to send JSON responses with security headers."""
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self._add_security_headers()
        self._add_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _add_security_headers(self):
        """Add OWASP security headers to all responses."""
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-XSS-Protection", "1; mode=block")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        )
        self.send_header(
            "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
        )
        self.send_header(
            "Permissions-Policy", "geolocation=(), microphone=(), camera=()"
        )

    def _add_cors_headers(self):
        """Add CORS headers based on configuration."""
        cors_config = config.get("cors", {})
        if cors_config.get("enabled", False):
            origin = self.headers.get("Origin", "")
            allowed_origins = cors_config.get("allowed_origins", [])
            if origin in allowed_origins or "*" in allowed_origins:
                self.send_header(
                    "Access-Control-Allow-Origin", origin if origin else "*"
                )
            self.send_header(
                "Access-Control-Allow-Methods",
                ", ".join(cors_config.get("allowed_methods", ["GET", "POST"])),
            )
            self.send_header(
                "Access-Control-Allow-Headers",
                ", ".join(
                    cors_config.get("allowed_headers", ["Content-Type", "X-API-Key"])
                ),
            )

    def do_GET(self):
        """Handle GET requests."""
        parsed = urlparse(self.path)
        path = parsed.path

        # Public health endpoint (no auth required)
        if path == "/api/health":
            self._send_json({"status": "ok", "version": "4.3.0"})
            return

        # API endpoints
        if path.startswith("/api/"):
            if not self._check_auth():
                self._send_json({"error": "Unauthorized"}, 401)
                return

            if path == "/api/stats":
                self._send_json(get_system_stats())
            elif path == "/api/gpu":
                self._send_json(get_gpu_stats())
            elif path == "/api/config":
                # Return safe config subset (non-sensitive)
                self._send_json(
                    {
                        "server": config.get("server", {}),
                        "dashboard": config.get("dashboard", {}),
                        "cors": config.get("cors", {}),
                        "gpu_monitor": config.get("gpu_monitor", {}),
                    }
                )
            else:
                self._send_json({"error": "Not found"}, 404)
            return

        # Serve static files from the 'web' directory
        # Note: Security headers added via end_headers override in send_header
        super().do_GET()

    def do_POST(self):
        """Handle POST requests for AI agent."""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/ai/generate":
            if not self._check_auth():
                self._send_json({"error": "Unauthorized"}, 401)
                return

            try:
                content_length = int(self.headers.get("Content-Length", 0))
                if content_length == 0:
                    self._send_json({"error": "Empty request body"}, 400)
                    return

                post_data = self.rfile.read(content_length)
                body = json.loads(post_data.decode("utf-8"))
                prompt = body.get("prompt")

                if not prompt or not isinstance(prompt, str) or not prompt.strip():
                    self._send_json(
                        {"error": "'prompt' must be a non-empty string"}, 400
                    )
                    return

                # Determine which AI agent to use (live or mock)
                gemini_api_key = os.getenv("GEMINI_API_KEY")
                use_mock_ai = (
                    not gemini_api_key or "your_gemini_api_key_here" in gemini_api_key
                )

                if use_mock_ai:
                    script_name = "mock_ai_assistant.py"
                    log.info(
                        "Using Mock AI Assistant (GEMINI_API_KEY not found or is a placeholder)"
                    )
                else:
                    script_name = "gemini_agent.py"
                    log.info("Using live Gemini AI Assistant")

                # Execute the appropriate script as a subprocess
                script_path = os.path.join(os.path.dirname(__file__), script_name)
                env = os.environ.copy()

                process = subprocess.Popen(
                    [sys.executable, script_path, prompt],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    encoding="utf-8",
                    env=env,
                )

                stdout, stderr = process.communicate()

                if process.returncode != 0:
                    log.error(f"AI agent script '{script_name}' failed: {stderr}")
                    self._send_json(
                        {
                            "error": "Failed to get response from AI assistant.",
                            "details": stderr,
                        },
                        500,
                    )
                else:
                    self._send_json({"response": stdout})

            except json.JSONDecodeError:
                self._send_json({"error": "Invalid JSON"}, 400)
            except Exception as e:
                log.error(f"Error handling AI request: {e}", exc_info=True)
                self._send_json({"error": "An internal error occurred."}, 500)
            return

        self._send_json({"error": "Not found"}, 404)

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(204)
        self._add_security_headers()
        self._add_cors_headers()
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()


def run_server():
    """Runs the Overlord web server."""
    server_config = config.get("server", {})
    host = server_config.get("host", "0.0.0.0")
    port = server_config.get("port", 8999)

    # --- Startup Validation ---
    if server_config.get("auth_required", True):
        api_key = config.get("auth.api_key", "")
        if not api_key:
            log.critical(
                "CRITICAL: Authentication is required, but no API key is configured. Server will not start."
            )
            sys.exit(1)  # Exit with a non-zero status code to indicate failure

    # The handler needs to know where the web files are.
    # We use partial to pass the directory to the handler.
    handler_class = OverlordHttpRequestHandler

    try:
        with socketserver.TCPServer((host, port), handler_class) as httpd:
            log.info(f"Starting Overlord Dashboard v4.2.1 on {host}:{port}")
            log.info(f"Server running on http://{host}:{port}")
            print("\n" + "=" * 40)
            print(f"[FIRE] Overlord Dashboard v4.2.1")
            print("=" * 40)
            print(f"[CHART] Dashboard:  http://localhost:{port}/")
            print(f"[PLUG]  API:        http://localhost:{port}/api/stats")
            print(f"[HEART] Health:     http://localhost:{port}/api/health")
            print("=" * 40 + "\n")

            # Send startup notification
            send_discord_notification(
                message=f"Server is online and operational on port **{port}**.",
                embed_title="System Online",
            )

            httpd.serve_forever()
    except OSError as e:
        log.error(
            f"Could not start server on {host}:{port}. Port might be in use. Error: {e}"
        )
    except Exception as e:
        log.critical(f"An unexpected error occurred: {e}", exc_info=True)


if __name__ == "__main__":
    # Start the periodic log cleanup in a separate thread
    cleanup_thread = Thread(target=clear_old_logs_periodically, daemon=True)
    cleanup_thread.start()
    log.info("Database cleanup thread started")

    run_server()
