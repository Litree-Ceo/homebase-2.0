import subprocess

from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


def run_engine_command(*args: str) -> None:
    subprocess.run(["python", "overlord-engine.py", *args], check=False)


@socketio.on("engine_command")
def handle_engine_command(data):
    cmd = (data or {}).get("command", "")

    if cmd == "INCREASE_CHAOS_LEVEL":
        run_engine_command("--chaos", "MAX")
        emit("response", {"message": "CHAOS OVERFLOW ACTIVATED 💥"})
    elif cmd == "GET_MEM_LEVEL":
        emit(
            "response",
            {
                "mem_level": 97,
                "message": "MEM_LEVEL GOD-TIER — AUTO BLOOD THEME ENGAGED",
            },
        )
    else:
        emit("response", {"message": f"UNKNOWN COMMAND: {cmd}"})


@app.post("/telegram")
def telegram_command():
    payload = request.get_json(silent=True) or {}
    cmd = (payload.get("command") or "").strip().upper()

    if not cmd:
        return jsonify({"ok": False, "error": "missing command"}), 400

    socketio.emit("response", {"message": f"TELEGRAM COMMAND RECEIVED: {cmd}"})
    handle_engine_command({"command": cmd})
    return jsonify({"ok": True, "command": cmd})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
