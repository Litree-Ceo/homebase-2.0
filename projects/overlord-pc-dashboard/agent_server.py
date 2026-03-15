#!/usr/bin/env python3
"""
Overlord AI Agent Server
- Perplexity for web search/research
- Groq for reasoning/chat
- Tool execution (commands, files, PC stats)
- n8n webhook integration
"""

import http.server
import json
import os
import socketserver
import ssl
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Load .env
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "")
API_KEY = os.getenv("API_KEY", "o49eSUdxJehy05JxECmP33I9GQLaQCh0pYaGk7aXeok")
AUTH_ON = os.getenv("AUTH_ON", "true").lower() in ("true", "1", "yes")
PORT = int(os.getenv("PORT", "8080"))

# Ollama Configuration (Free Local AI)
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")  # Free local model
OLLAMA_ENABLED = os.getenv("OLLAMA_ENABLED", "true").lower() in ("true", "1", "yes")

# Agent memory (simple in-memory)
agent_memory = {}


def call_groq(messages, model="llama3-8b-8192", max_tokens=1000):
    """Call Groq API"""
    if not GROQ_API_KEY:
        return {"error": "GROQ_API_KEY not set"}

    try:
        import urllib.request

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }

        req = urllib.request.Request(
            url, data=json.dumps(payload).encode(), headers=headers, method="POST"
        )
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        with urllib.request.urlopen(req, context=context, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            return {"content": result["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"error": str(e)}


def call_ollama(messages, model=None, max_tokens=2000):
    """Call local Ollama instance (FREE - no API key needed)

    Uses /api/generate endpoint (Ollama v0.17.7+)
    Converts messages to a single prompt string for compatibility.
    """
    if not OLLAMA_ENABLED:
        return {"error": "Ollama is disabled"}

    target_model = model or OLLAMA_MODEL
    url = f"{OLLAMA_HOST}/api/generate"

    # Convert messages array to a single prompt string
    # Format: "System: <system_message>\nUser: <user_message>\nAssistant:"
    prompt = ""
    if isinstance(messages, list):
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                prompt += f"System: {content}\n"
            elif role == "user":
                prompt += f"User: {content}\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n"
        prompt += "Assistant:"
    else:
        prompt = str(messages)

    payload = {
        "model": target_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.7,
        },
    }

    try:
        import urllib.request

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode())
            return {"content": result.get("response", "")}
    except Exception as e:
        return {"error": str(e)}


def call_perplexity(query, model="sonar-pro"):
    """Call Perplexity API for web search"""
    if not PERPLEXITY_API_KEY:
        return {"error": "PERPLEXITY_API_KEY not set"}

    try:
        import urllib.request

        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful research assistant. Provide accurate, up-to-date information with citations.",
                },
                {"role": "user", "content": query},
            ],
            "max_tokens": 1000,
        }

        req = urllib.request.Request(
            url, data=json.dumps(payload).encode(), headers=headers, method="POST"
        )
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        with urllib.request.urlopen(req, context=context, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            return {
                "content": result["choices"][0]["message"]["content"],
                "citations": result.get("citations", []),
            }
    except Exception as e:
        return {"error": str(e)}


def execute_command(command, timeout=30):
    """Execute shell command safely"""
    # Block dangerous commands
    blocked = ["rm -rf /", "format", "del /", "rd /s", "> /dev/null"]
    for b in blocked:
        if b in command.lower():
            return {"error": f"Blocked dangerous command: {b}"}

    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return {
            "stdout": result.stdout[:2000],  # Limit output
            "stderr": result.stderr[:1000],
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"error": "Command timed out"}
    except Exception as e:
        return {"error": str(e)}


def get_pc_stats():
    """Get current PC stats"""
    try:
        import psutil

        return {
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
    except Exception as e:
        return {"error": str(e)}


def read_file(filepath, max_lines=100):
    """Read file contents"""
    try:
        path = Path(filepath)
        if not path.exists():
            return {"error": "File not found"}
        if path.stat().st_size > 100000:  # 100KB limit
            return {"error": "File too large"}

        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()[:max_lines]
            return {"content": "".join(lines)}
    except Exception as e:
        return {"error": str(e)}


def write_file(filepath, content):
    """Write file contents"""
    try:
        path = Path(filepath)
        # Prevent writing to sensitive locations
        if any(
            x in str(path.absolute())
            for x in ["Windows\\System", "C:\\Windows", "/etc/", "/bin/"]
        ):
            return {"error": "Cannot write to system directories"}

        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return {"success": True, "path": str(path)}
    except Exception as e:
        return {"error": str(e)}


def agent_process(user_message, session_id="default"):
    """Main agent processing with tools"""

    # Initialize session memory
    if session_id not in agent_memory:
        agent_memory[session_id] = []

    memory = agent_memory[session_id]

    # Build system prompt with available tools
    system_prompt = """You are Overlord Agent, a helpful AI assistant with access to tools.

Available tools:
1. web_search(query) - Search the web using Perplexity for current information
2. run_command(cmd) - Execute shell commands (safe mode)
3. read_file(path) - Read file contents
4. write_file(path, content) - Write to files
5. pc_stats() - Get current PC statistics

When you need to use a tool, respond with JSON:
{"tool": "tool_name", "args": {"param": "value"}}

After receiving tool results, provide a helpful response to the user.
Be concise and action-oriented."""

    # Check if user wants web search
    if any(
        word in user_message.lower()
        for word in [
            "search",
            "look up",
            "find",
            "what is",
            "how to",
            "latest",
            "news",
            "current",
        ]
    ):
        # Auto-trigger web search
        search_result = call_perplexity(user_message)
        if "content" in search_result:
            return {
                "response": search_result["content"],
                "sources": search_result.get("citations", []),
                "tool_used": "web_search",
            }

    # Check for explicit tool calls in message
    if user_message.startswith("/"):
        parts = user_message[1:].split(" ", 1)
        cmd = parts[0]
        args = parts[1] if len(parts) > 1 else ""

        if cmd == "cmd":
            result = execute_command(args)
            return {
                "response": f"Command result:\n```\n{result.get('stdout', result.get('error', 'No output'))}\n```",
                "tool_used": "run_command",
            }

        elif cmd == "read":
            result = read_file(args)
            return {
                "response": f"File contents:\n```\n{result.get('content', result.get('error', 'Error'))}\n```",
                "tool_used": "read_file",
            }

        elif cmd == "stats":
            result = get_pc_stats()
            return {
                "response": f"PC Stats:\n```json\n{json.dumps(result, indent=2)}\n```",
                "tool_used": "pc_stats",
            }

    # Regular chat - Use Ollama (FREE) first, fallback to Groq
    messages = (
        [{"role": "system", "content": system_prompt}]
        + memory[-5:]
        + [{"role": "user", "content": user_message}]
    )

    # Try Ollama first (free local AI)
    if OLLAMA_ENABLED:
        response = call_ollama(messages)
        if "content" in response:
            # Store in memory
            memory.append({"role": "user", "content": user_message})
            memory.append({"role": "assistant", "content": response["content"]})
            memory = memory[-10:]  # Keep last 10 messages
            agent_memory[session_id] = memory
            return {"response": response["content"], "model": "ollama"}

    # Fallback to Groq if Ollama fails or is disabled
    response = call_groq(messages)

    if "content" in response:
        # Store in memory
        memory.append({"role": "user", "content": user_message})
        memory.append({"role": "assistant", "content": response["content"]})
        memory = memory[-10:]  # Keep last 10 messages
        agent_memory[session_id] = memory

        return {"response": response["content"]}
    else:
        return {"response": f"Error: {response.get('error', 'Unknown error')}"}


class AgentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def check_auth(self):
        if not AUTH_ON:
            return True
        return self.headers.get("X-API-Key") == API_KEY

    def do_POST(self):
        if not self.check_auth():
            self.send_json({"error": "Unauthorized"}, 401)
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode() if content_length else "{}"

        try:
            data = json.loads(body)
        except:
            data = {}

        # Route handlers
        if self.path == "/api/agent/chat":
            message = data.get("message", "")
            session = data.get("session_id", "default")
            result = agent_process(message, session)
            self.send_json(result)

        elif self.path == "/api/agent/search":
            query = data.get("query", "")
            result = call_perplexity(query)
            self.send_json(result)

        elif self.path == "/api/agent/command":
            cmd = data.get("command", "")
            result = execute_command(cmd)
            self.send_json(result)

        elif self.path == "/api/n8n/webhook":
            # n8n webhook endpoint
            action = data.get("action", "chat")
            message = data.get("message", "")

            if action == "search":
                result = call_perplexity(message)
            elif action == "stats":
                result = get_pc_stats()
            else:
                result = agent_process(message)

            self.send_json(
                {
                    "success": True,
                    "result": result,
                    "timestamp": datetime.now().isoformat(),
                }
            )

        else:
            self.send_json({"error": "Unknown endpoint"}, 404)

    def do_GET(self):
        if not self.check_auth():
            self.send_json({"error": "Unauthorized"}, 401)
            return

        if self.path == "/api/health":
            self.send_json(
                {
                    "status": "healthy",
                    "agent": True,
                    "ollama": {
                        "enabled": OLLAMA_ENABLED,
                        "model": OLLAMA_MODEL,
                        "host": OLLAMA_HOST,
                    },
                    "groq": bool(GROQ_API_KEY),
                    "perplexity": bool(PERPLEXITY_API_KEY),
                }
            )

        elif self.path == "/api/stats":
            self.send_json(get_pc_stats())

        elif self.path == "/":
            self.path = "/agent.html"
            return super().do_GET()

        else:
            return super().do_GET()


def main():
    print(
        f"""
    ╔══════════════════════════════════════════════════════════════════╗
    ║           🤖 OVERLORD AI AGENT v2.0 - ENHANCED                   ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║  🌐 Dashboard:  http://localhost:{PORT}/                          ║
    ║  🔌 API:        http://localhost:{PORT}/api/agent/chat            ║
    ║  📊 Stats:      http://localhost:{PORT}/api/stats                 ║
    ║  🔗 n8n Hook:   http://localhost:{PORT}/api/n8n/webhook           ║
    ║                                                                  ║
    ║  ✨ Features:                                                    ║
    ║     • 🔍 Perplexity web search with citations                   ║
    ║     • 🧠 Groq AI reasoning (Llama 3)                            ║
    ║     • ⚡ Command execution (safe mode)                          ║
    ║     • 📁 File browser with read/write                           ║
    ║     • 📊 Real-time PC stats monitoring                          ║
    ║     • 💬 Persistent session memory                              ║
    ║                                                                  ║
    ║  ⌨️  Quick Commands:                                             ║
    ║     /cmd <command>  - Execute shell command                     ║
    ║     /read <path>    - Read file contents                        ║
    ║     /stats          - Show PC statistics                        ║
    ║     /search <query> - Search the web                            ║
    ╚══════════════════════════════════════════════════════════════════╝
    """
    )

    with socketserver.TCPServer(("", PORT), AgentHandler) as httpd:
        print(f"[*] Agent server running on port {PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
