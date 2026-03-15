#!/usr/bin/env python3
"""
Overlord PC Dashboard - Main Server with AI Chat
Fast, simple, and reliable
"""

import http.server
import socketserver
import json
import os
import sys
from pathlib import Path
from urllib.parse import parse_qs

import yaml

# Load .env
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# ------------------ Configuration Loading ------------------

CONFIG = {
    "server": {"host": "0.0.0.0", "port": 8080},
    "auth": {"enabled": True},
}

try:
    with open("config.yaml", "r") as f:
        yaml_config = yaml.safe_load(f)
        if yaml_config:
            CONFIG["server"].update(yaml_config.get("server", {}))
            CONFIG["auth"].update(yaml_config.get("auth", {}))
except (FileNotFoundError, yaml.YAMLError) as e:
    print(
        f"[!] Warning: Could not load or parse config.yaml. Using defaults. Error: {e}"
    )

# Environment variable overrides
PORT = int(os.getenv("PORT", CONFIG["server"]["port"]))
API_KEY = os.getenv("API_KEY", "o49eSUdxJehy05JxECmP33I9GQLaQCh0pYaGk7aXeok")
AUTH_ON = os.getenv("AUTH_ON", str(CONFIG["auth"]["enabled"])).lower() in (
    "true",
    "1",
    "yes",
)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# -----------------------------------------------------------


class OverlordHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        # API: Chat with AI
        if self.path == "/api/chat":
            self.handle_chat()
            return

        # Default: 404
        self.send_json({"error": "Not found"}, 404)

    def handle_chat(self):
        """Handle AI chat requests"""
        # Check auth
        if AUTH_ON and self.headers.get("X-API-Key") != API_KEY:
            self.send_json({"error": "Unauthorized"}, 401)
            return

        # Read body
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            self.send_json({"error": "No data"}, 400)
            return

        try:
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body)
            message = data.get("message", "").strip()

            if not message:
                self.send_json({"error": "Empty message"}, 400)
                return

            # Call Groq API
            response_text = self.call_groq(message)
            self.send_json({"response": response_text})

        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON"}, 400)
        except Exception as e:
            print(f"[!] Chat error: {e}")
            self.send_json({"error": str(e)}, 500)

    def call_groq(self, message):
        """Call Groq API for chat response"""
        if not GROQ_API_KEY:
            return "⚠️ GROQ_API_KEY not set. Add it to your .env file."

        try:
            import urllib.request
            import ssl

            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": "llama3-8b-8192",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant for the Overlord PC Dashboard. Be concise and friendly.",
                    },
                    {"role": "user", "content": message},
                ],
                "max_tokens": 500,
                "temperature": 0.7,
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )

            # Disable SSL verification for simplicity (not for production)
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            with urllib.request.urlopen(req, context=context, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]

        except Exception as e:
            print(f"[!] Groq API error: {e}")
            return f"Error: {str(e)}"

    def do_GET(self):
        # API: Health check
        if self.path == "/api/health":
            self.send_json(
                {"status": "healthy", "version": "4.3.0", "ai_chat": bool(GROQ_API_KEY)}
            )
            return

        # API: Config (for frontend)
        if self.path == "/api/config":
            self.send_json(
                {
                    "auth_enabled": AUTH_ON,
                    "refresh_interval": 5000,
                    "version": "4.3.0",
                    "ai_chat_enabled": bool(GROQ_API_KEY),
                }
            )
            return

        # API: Stats
        if self.path == "/api/stats":
            if AUTH_ON and self.headers.get("X-API-Key") != API_KEY:
                self.send_json({"error": "Unauthorized"}, 401)
                return

            try:
                import psutil

                stats = {
                    "cpu": {"percent": psutil.cpu_percent(interval=0.1)},
                    "ram": {
                        "percent": psutil.virtual_memory().percent,
                        "used_gb": round(psutil.virtual_memory().used / (1024**3), 1),
                        "total_gb": round(psutil.virtual_memory().total / (1024**3), 1),
                    },
                    "disk": {
                        "percent": psutil.disk_usage("/").percent,
                        "used_gb": round(psutil.disk_usage("/").used / (1024**3), 1),
                        "total_gb": round(psutil.disk_usage("/").total / (1024**3), 1),
                    },
                }
                self.send_json(stats)
            except Exception as e:
                self.send_json({"error": str(e)}, 500)
            return

        # API: History (placeholder)
        if self.path == "/api/history":
            self.send_json({"history": []})
            return

        # Serve index.html for root
        if self.path == "/":
            self.path = "/index.html"

        # Default: serve static files
        return super().do_GET()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


def main():
    chat_status = (
        "✅ AI Chat enabled"
        if GROQ_API_KEY
        else "⚠️ AI Chat disabled (set GROQ_API_KEY)"
    )

    print(
        f"""
    +{'='*58}+
    |           OVERLORD DASHBOARD v4.3.0                    |
    +{'='*58}+
    |  URL: http://localhost:{PORT:<51}|
    |  API: http://localhost:{PORT}/api/stats{' '*39}|
    |  CHAT: http://localhost:{PORT}/api/chat{' '*40}|
    |                                                          |
    |  {chat_status:<54}|
    |                                                          |
    |  Press Ctrl+C to stop                                    |
    +{'='*58}+
    """
    )

    try:
        with socketserver.TCPServer(("", PORT), OverlordHandler) as httpd:
            print(f"[*] Server running on port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"[!] Port {PORT} already in use. Server may already be running.")
            print(f"[*] Try: http://localhost:{PORT}")
        else:
            raise


if __name__ == "__main__":
    main()
