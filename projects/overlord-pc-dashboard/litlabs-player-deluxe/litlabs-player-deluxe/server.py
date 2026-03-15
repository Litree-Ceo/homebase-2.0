#!/usr/bin/env python3
"""
Litlab Player Server
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
import urllib.request
from datetime import datetime
import logging
import logging.handlers

import yaml
from dotenv import load_dotenv

from tools import available_tools, get_pc_stats, tools_list as tools

# Load .env first (environment variables override config.yaml)
try:
    load_dotenv()
except ImportError:
    pass

# Load configuration from config.yaml (after .env so env vars can override if needed)
CONFIG = {}
try:
    with open("config.yaml", "r", encoding="utf-8") as f:
        CONFIG = yaml.safe_load(f) or {}
except FileNotFoundError:
    logging.warning("config.yaml not found, using defaults")
except Exception as e:
    logging.error("Error loading config.yaml: %s", e, exc_info=True)

# Get server and auth config with fallbacks
SERVER_CONFIG = CONFIG.get("server", {})
AUTH_CONFIG = CONFIG.get("auth", {})

# API Keys - Load from environment, require proper API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "")
API_KEY = os.getenv("API_KEY", "")

# Authentication and port from config.yaml
# auth.enabled from config.yaml controls whether API key is required
AUTH_ON = AUTH_CONFIG.get("enabled", False)

# Port: config.yaml has priority, then environment variable
PORT = SERVER_CONFIG.get("port", 8080)
port_env = os.getenv("PORT")
if port_env:
    try:
        PORT = int(port_env)
    except ValueError:
        pass

# Validate authentication configuration
if AUTH_ON and not API_KEY:
    logging.warning("Authentication is ENABLED but no API_KEY is set in .env file!")
    logging.warning("Please set API_KEY in .env to access protected endpoints.")

# Agent memory (simple in-memory)
agent_memory = {}


def call_groq(messages, model="llama3-8b-8192", max_tokens=1500, use_tools=False):
    """Call Groq API, with optional tool support"""
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

        if use_tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"

        req = urllib.request.Request(
            url, data=json.dumps(payload).encode(), headers=headers, method="POST"
        )
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        with urllib.request.urlopen(req, context=context, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            return result["choices"][0]["message"]
    except urllib.error.URLError as e:
        return {"error": f"URL Error: {e.reason}"}
    except json.JSONDecodeError as e:
        return {"error": f"JSON Decode Error: {e}"}
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
    except urllib.error.URLError as e:
        return {"error": f"URL Error: {e.reason}"}
    except json.JSONDecodeError as e:
        return {"error": f"JSON Decode Error: {e}"}
    except Exception as e:
        return {"error": str(e)}


# Tool functions are now imported from the tools.py module.


def agent_process(user_message, session_id="default"):
    """Main agent processing loop using native tool calls."""

    # Initialize session memory
    if session_id not in agent_memory:
        agent_memory[session_id] = []

    memory = agent_memory[session_id]

    # System prompt remains minimal as tool definitions are sent via API
    system_prompt = "You are Litlab Player, a helpful AI assistant with access to tools. Be concise and action-oriented."

    messages = (
        [{"role": "system", "content": system_prompt}]
        + memory[-10:]
        + [{"role": "user", "content": user_message}]
    )

    # First API call to get the agent's response or tool calls
    response = call_groq(messages, use_tools=True)

    # Append the user message and the initial response to memory
    memory.append({"role": "user", "content": user_message})
    memory.append(response)

    tool_calls = response.get("tool_calls")

    # If there are tool calls, execute them
    if tool_calls:
        for tool_call in tool_calls:
            function_name = tool_call["function"]["name"]
            function_to_call = available_tools.get(function_name)

            if not function_to_call:
                tool_feedback = f"Error: Tool '{function_name}' is not available."
            else:
                try:
                    function_args = json.loads(tool_call["function"]["arguments"])
                    result = function_to_call(**function_args)
                    result_str = (
                        json.dumps(result)
                        if isinstance(result, (dict, list))
                        else str(result)
                    )
                    tool_feedback = (
                        f"Tool {function_name} executed. Result: {result_str}"
                    )
                except json.JSONDecodeError as e:
                    tool_feedback = (
                        f"Tool {function_name} failed. Error decoding arguments: {e}"
                    )
                except Exception as e:
                    tool_feedback = (
                        f"Tool {function_name} failed. Error during execution: {e}"
                    )

            # Append tool result to messages for the second API call
            memory.append(
                {
                    "tool_call_id": tool_call["id"],
                    "role": "tool",
                    "name": function_name,
                    "content": tool_feedback,
                }
            )

        # Second API call to get a summary response after tool execution
        final_messages = [{"role": "system", "content": system_prompt}] + memory[-10:]

        second_response = call_groq(
            final_messages, use_tools=False
        )  # No tools needed for the final summary
        response_text = second_response.get(
            "content", "Error: No content in final response."
        )
        memory.append(second_response)

    # If no tool calls, just use the initial response
    else:
        response_text = response.get("content", "I am sorry, I encountered an error.")

    # Save memory and return the final response
    agent_memory[session_id] = memory[
        -12:
    ]  # Keep a bit more memory for tool call context
    return {"response": response_text}


def setup_logging(config):
    """Set up logging based on configuration."""
    log_config = config.get("logging", {})
    level = log_config.get("level", "INFO").upper()
    log_file = log_config.get("file", "litlab-player.log")
    max_bytes = log_config.get("max_bytes", 1048576)
    backup_count = log_config.get("backup_count", 3)
    json_format = log_config.get("json_format", False)

    log = logging.getLogger()
    log.setLevel(level)

    handler = logging.handlers.RotatingFileHandler(
        log_file, maxBytes=max_bytes, backupCount=backup_count
    )

    if json_format:
        # You would need a json formatter library for this, e.g., python-json-logger
        # For now, we will use a basic formatter.
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )

    handler.setFormatter(formatter)
    log.addHandler(handler)

    # Also log to console
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    log.addHandler(stream_handler)

    return logging.getLogger(__name__)


class AgentHandler(http.server.SimpleHTTPRequestHandler):

    # pylint: disable=invalid-name
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
        
        # Check header first
        if self.headers.get("X-API-Key") == API_KEY:
            return True

        # Check query parameter as a fallback
        from urllib.parse import parse_qs, urlparse
        query = urlparse(self.path).query
        params = parse_qs(query)
        if params.get("api_key", [None])[0] == API_KEY:
            return True

        return False

    # pylint: disable=invalid-name
    def do_POST(self):
        if not self.check_auth():
            self.send_json({"error": "Unauthorized"}, 401)
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode() if content_length else "{}"

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            data = {}

        # Route handlers
        if self.path == "/api/agent/chat":
            message = data.get("message", "")
            session = data.get("session_id", "default")
            result = agent_process(message, session)
            self.send_json(result)

        elif self.path == "/api/n8n/webhook":
            # n8n webhook endpoint for backward compatibility or specific n8n tasks
            action = data.get("action", "chat")
            message = data.get("message", "")

            if action == "search":
                result = call_perplexity(message)
            elif action == "stats":
                result = available_tools["get_pc_stats"]()
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
        from urllib.parse import urlparse
        path = urlparse(self.path).path

        if path in ("/api/health", "/api/config"):
            if path == "/api/health":
                self.send_json(
                    {
                        "status": "healthy",
                        "agent": True,
                        "groq": bool(GROQ_API_KEY),
                        "perplexity": bool(PERPLEXITY_API_KEY),
                    }
                )
            elif path == "/api/config":
                self.send_json(
                    {
                        "auth_on": AUTH_ON,
                        "groq_enabled": bool(GROQ_API_KEY),
                        "perplexity_enabled": bool(PERPLEXITY_API_KEY),
                    }
                )
            return

        if not self.check_auth():
            self.send_json({"error": "Unauthorized"}, 401)
            return

        if path == "/api/stats":
            self.send_json(get_pc_stats())
            return

        if path == "/":
            # pylint: disable=attribute-defined-outside-init
            self.path = "/agent.html"

        super().do_GET()


def main():
    log = setup_logging(CONFIG)
    log.info("Starting Litlab Player v1.0")

    with socketserver.TCPServer(("", PORT), AgentHandler) as httpd:
        log.info("Agent server running on port %s", PORT)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
