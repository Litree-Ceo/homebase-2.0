import asyncio
import json
import os
import socket
import sys

import psutil
import websockets
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Allow importing sibling scripts (wallpaper_gen is in the same directory)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wallpaper_gen import generate_wallpaper  # noqa: E402

# OVERLORD BRIDGE v2.0 — auth-first, heartbeat, action dispatcher
# ws://localhost:8765  (falls back to next free port if occupied)

AUTH_TOKEN = os.getenv("OVERLORD_AUTH_TOKEN")
if not AUTH_TOKEN:
    raise RuntimeError("OVERLORD_AUTH_TOKEN environment variable is required")

KALI_RESPONSES = {
    "nmap -sv": (
        "Starting Nmap 7.94\nScan report for 192.168.0.77\n"
        "PORT     STATE  SERVICE  VERSION\n"
        "8080/tcp open   http     Python/Flask 3.1\n"
        "22/tcp   open   ssh      OpenSSH 9.2\n"
        "Nmap done: 1 IP scanned in 2.31s"
    ),
    "msfconsole": (
        "       =[ metasploit v6.3.44-dev ]\n"
        "+ -- --=[ 2374 exploits - 1232 auxiliary ]\n"
        "msf6 > [DEMO MODE ACTIVE]"
    ),
    "airmon-ng": "PHY   Interface  Driver\nphy0  wlan0      mt7921e\n[*] Monitor mode enabled",
    "whoami": "overlord",
    "uname -a": "Linux kali 6.6.9-amd64 #1 SMP Debian x86_64 GNU/Linux",
    "ls": "Desktop  Documents  Downloads  Tools  exploits  wordlists",
    "ifconfig": (
        "eth0: flags=4163  mtu 1500\n"
        "  inet 192.168.0.77  netmask 255.255.255.0\n"
        "  TX packets 9271  RX packets 12843"
    ),
    "pwd": "/root",
    "id": "uid=0(root) gid=0(root) groups=0(root)",
    "ps aux": "root  1  0.0  0.1  /sbin/init\nroot  825  0.2  0.8  python overlord_bridge.py",
    "netstat -tulpn": "tcp 0 0 0.0.0.0:8080 LISTEN\ntcp 0 0 127.0.0.1:8765 LISTEN",
    "cat /etc/passwd": "root:x:0:0:root:/root:/bin/bash\noverlord:x:1000:1000::/home/overlord:/bin/zsh",
}


async def _heartbeat(websocket):
    """Ping client every 20 s to keep the connection alive."""
    while True:
        await asyncio.sleep(20)
        try:
            await websocket.ping()
        except (OSError, websockets.ConnectionClosed, asyncio.CancelledError):
            break


async def handler(websocket, _path=None):
    addr = getattr(websocket, "remote_address", "unknown")
    print(f"[BRIDGE] New connection: {addr}")
    try:
        # ── AUTH FIRST MESSAGE (2026 pattern) ──────────────────────────────
        try:
            auth = await asyncio.wait_for(websocket.recv(), timeout=5.0)
        except (TimeoutError, asyncio.TimeoutError):
            await websocket.close(1008, "Auth timeout")
            return
        if auth.strip() != AUTH_TOKEN:
            print(f"[BRIDGE] Auth rejected from {addr}")
            await websocket.close(1008, "Auth failed")
            return
        print(f"[BRIDGE] Authenticated ✓ — {addr}")

        # Send immediate confirmation
        await websocket.send(
            json.dumps({"type": "auth_ok", "msg": "OVERLORD BRIDGE ONLINE"})
        )

        # Start heartbeat task
        asyncio.create_task(_heartbeat(websocket))

        # ── COMMAND LOOP ───────────────────────────────────────────────────
        async for message in websocket:
            # Input validation
            if not isinstance(message, str) or len(message) > 4096:
                continue
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                continue

            action = data.get("action") or data.get("command", "")
            if not isinstance(action, str) or len(action) > 80:
                continue

            # ── get_stats ─────────────────────────────────────────────────
            if action in ("get_stats", "stats"):
                stats = {
                    "cpu": psutil.cpu_percent(interval=0.1),
                    "mem": psutil.virtual_memory().percent,
                    "disk": psutil.disk_usage("/").percent,
                }
                await websocket.send(json.dumps({"type": "stats", "data": stats}))

            # ── kali_command ─────────────────────────────────────────────
            elif action == "kali_command":
                cmd = str(data.get("cmd", "")).strip()[:200]
                output = KALI_RESPONSES.get(
                    cmd.lower(),
                    f"root@overlord:~# {cmd}\nCommand executed. (demo mode)",
                )
                await websocket.send(
                    json.dumps({"type": "kali_response", "output": output})
                )

            # ── generate_wallpaper ───────────────────────────────────────
            elif action == "generate_wallpaper":
                theme = str(data.get("theme", "neon"))[:20]
                try:
                    path = generate_wallpaper(theme)
                    filename = os.path.basename(path)
                    await websocket.send(
                        json.dumps(
                            {
                                "type": "wallpaper",
                                "url": f"/wallpapers/{filename}",
                                "path": path,
                            }
                        )
                    )
                except (OSError, ValueError, RuntimeError) as e:
                    await websocket.send(json.dumps({"type": "error", "msg": str(e)}))

            # ── chaos_mutation ────────────────────────────────────────────
            elif action == "chaos_mutation":
                print("[BRIDGE] MUTATION INITIATED")
                await websocket.send(
                    json.dumps({"type": "status", "msg": "LOCAL_HARDWARE_MUTATED"})
                )

    except websockets.ConnectionClosed:
        print(f"[BRIDGE] Connection closed — {addr}")
    except (OSError, ValueError, RuntimeError) as e:
        print(f"[BRIDGE ERROR] {e}")


def get_free_port(preferred: int = 8765) -> int:
    """Return preferred port if free, otherwise find an available one."""
    for port in range(preferred, preferred + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("localhost", port))
                return port
            except OSError:
                continue
    raise OSError("No free port found in range 8765-8784")


async def main():
    try:
        port = get_free_port(8765)
        if port != 8765:
            print(f"[BRIDGE] Port 8765 in use — binding to {port} instead.")
        async with websockets.serve(handler, "localhost", port):
            print(f"[BRIDGE] ✅ Overlord Master Bridge ONLINE → ws://localhost:{port}")
            print(
                "[BRIDGE] 🟢 Waiting for dashboard to connect... (open lit-grid-v11.5.html)"
            )
            await asyncio.Future()  # run forever
    except OSError as e:
        print(f"[BRIDGE ERROR] Could not start: {e}")
        print("Tip: Kill existing bridge via Task Manager → python.exe")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
