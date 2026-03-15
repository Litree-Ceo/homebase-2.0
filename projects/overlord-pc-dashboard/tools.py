"""
Overlord AI Agent - Tool Definitions
This file contains the definitions for functions that the AI agent can execute.
"""


def get_pc_stats():
    """
    Retrieves current PC statistics such as CPU, RAM, and disk usage.
    This function takes no arguments.
    """
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
        return stats
    except Exception as e:
        return {"error": str(e)}


def run_command(command: str):
    """
    Executes a shell command on the local machine and returns the output.
    Use this for simple, non-interactive commands.

    Args:
        command (str): The shell command to execute.
    """
    import subprocess

    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return result.stdout or "Command executed successfully with no output."
        else:
            return f"Error executing command: {result.stderr}"
    except Exception as e:
        return f"Exception during command execution: {str(e)}"


def file_op(operation: str, path: str, content: str = None):
    """
    Performs a file operation (read, write, or delete).

    Args:
        operation (str): The operation to perform. Must be one of 'read', 'write', or 'delete'.
        path (str): The absolute path to the file.
        content (str, optional): The content to write to the file. Required for 'write' operations.
    """
    import os

    try:
        if operation == "read":
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        elif operation == "write":
            if content is None:
                return "Error: Content must be provided for 'write' operation."
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            return f"Successfully wrote to {path}"
        elif operation == "delete":
            os.remove(path)
            return f"Successfully deleted {path}"
        else:
            return "Error: Invalid operation specified. Must be 'read', 'write', or 'delete'."
    except Exception as e:
        return f"Error during file operation: {str(e)}"


def call_perplexity(query: str, model: str = "llama-3-sonar-large-32k-online"):
    """
    Performs a web search using the Perplexity API to answer a user's query.
    Use this for questions about current events, facts, or general knowledge.

    Args:
        query (str): The search query.
        model (str, optional): The Perplexity model to use. Defaults to "llama-3-sonar-large-32k-online".
    """
    import os
    import urllib.request
    import json

    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
    if not PERPLEXITY_API_KEY:
        return {"error": "PERPLEXITY_API_KEY not set"}

    url = "https://api.perplexity.ai/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query},
        ],
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {PERPLEXITY_API_KEY}",
    }
    try:
        req = urllib.request.Request(
            url, data=json.dumps(payload).encode("utf-8"), headers=headers
        )
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        return {"error": f"Perplexity API call failed: {str(e)}"}


# This is the canonical list of tools provided to the AI model.
# It maps the function implementation to the schema the AI expects.
tools_list = [
    {
        "type": "function",
        "function": {
            "name": "get_pc_stats",
            "description": "Retrieves current PC statistics (CPU, RAM, disk).",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "Executes a shell command on the local machine.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The command to execute.",
                    }
                },
                "required": ["command"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "file_op",
            "description": "Perform a file operation (read, write, delete).",
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "description": "The operation: 'read', 'write', or 'delete'.",
                        "enum": ["read", "write", "delete"],
                    },
                    "path": {
                        "type": "string",
                        "description": "The absolute path to the file.",
                    },
                    "content": {
                        "type": "string",
                        "description": "Content to write for the 'write' operation.",
                    },
                },
                "required": ["operation", "path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "call_perplexity",
            "description": "Performs a web search using the Perplexity API to answer a user's query about current events, facts, or general knowledge.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query."}
                },
                "required": ["query"],
            },
        },
    },
]

# A dictionary to map tool names to their actual function objects.
available_tools = {
    "get_pc_stats": get_pc_stats,
    "run_command": run_command,
    "file_op": file_op,
    "call_perplexity": call_perplexity,
}
