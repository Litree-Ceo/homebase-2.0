from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import subprocess
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET = os.getenv("OVERLORD_SECRET", "default_secret_change_me")


@app.route("/api/status")
def status():
    return jsonify({"status": "ok"})


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
