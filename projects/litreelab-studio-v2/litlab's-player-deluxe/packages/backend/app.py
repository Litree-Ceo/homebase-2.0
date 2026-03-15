from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import subprocess
import requests
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET = os.getenv("OVERLORD_SECRET", "default_secret_change_me")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route("/api/status")
def status():
    return jsonify({"status": "ok"})

@app.route("/ai/explain", methods=["POST"])
def ai_explain():
    auth_token = request.headers.get("X-Auth-Token")
    if auth_token != SECRET:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "No content provided"}), 400
    
    if not OPENROUTER_API_KEY:
        return jsonify({"error": "OpenRouter API Key not configured"}), 500

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": "You are LiTLab AI. Explain the following code or logs clearly."},
                    {"role": "user", "content": data["content"]}
                ]
            }
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ai/plan-commands", methods=["POST"])
def ai_plan():
    auth_token = request.headers.get("X-Auth-Token")
    if auth_token != SECRET:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data or "objective" not in data:
        return jsonify({"error": "No objective provided"}), 400
    
    if not OPENROUTER_API_KEY:
        return jsonify({"error": "OpenRouter API Key not configured"}), 500

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": "You are LiTLab AI. Plan shell commands for the following objective. Return a JSON list of commands."},
                    {"role": "user", "content": data["objective"]}
                ]
            }
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/pc/exec", methods=["POST"])
def pc_exec():
    auth_token = request.headers.get("X-Auth-Token")
    if auth_token != SECRET:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    if not data or "command" not in data:
        return jsonify({"error": "No command provided"}), 400
    command = data["command"]
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=60
        )
        return jsonify(
            {
                "success": True,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "code": result.returncode,
            }
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/pc/status", methods=["GET"])
def pc_status():
    return jsonify(
        {
            "status": "online",
            "hostname": os.environ.get("COMPUTERNAME", "unknown"),
            "user": os.environ.get("USERNAME", "unknown"),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
