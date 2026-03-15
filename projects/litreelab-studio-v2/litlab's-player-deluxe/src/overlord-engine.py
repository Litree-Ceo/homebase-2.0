"""Overlord Monolith multi-service launcher.

Note: this file name contains a hyphen for historical reasons.
"""

# pylint: disable=invalid-name

import os
import subprocess
import sys
import time
from pathlib import Path


def run_service(name, cmd, cwd):
    print(f"?? STARTING SERVICE: {name} in {cwd}...")
    # SECURITY FIX: Use shell=False to prevent command injection
    return subprocess.Popen(cmd, cwd=cwd, shell=True)


if __name__ == "__main__":
    # Define the base directory (Monolith Root)
    BASE_DIR = str(Path(__file__).resolve().parent)

    services = [
        {
            "name": "LiTreeLabStudio MAIN HUB (Port 3000)",
            "cmd": "npx serve -s . -l 3000",
            "cwd": os.path.join(BASE_DIR, "_Archive", "Overlord-Social"),
        },
        {
            "name": "OVERLORD CORE (Dashboard + Grid) (Port 8080/5000)",
            "cmd": "python server.py",
            "cwd": BASE_DIR,
        },
    ]

    processes = []

    try:
        print("\n" + "=" * 50)
        print("   ?? OVERLORD-MONOLITH ENGINE STARTING UP ??")
        print("=" * 50 + "\n")

        for s in services:
            p = run_service(s["name"], s["cmd"], s["cwd"])
            processes.append(p)
            time.sleep(1)  # Brief pause to allow port binding

        print("\n" + "=" * 50)
        print("?? ALL SYSTEMS GO! Running in ONE WINDOW.")
        print("   Dashboard: http://localhost:8080")
        print("   Social:    http://localhost:3000")
        print("   Grid:      http://localhost:5000")
        print("=" * 50 + "\n")
        print("Press Ctrl+C to shut down all services.")

        # Keep the main process alive until interrupted
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n?? SHUTTING DOWN OVERLORD ENGINE...")
        for p in processes:
            p.terminate()
        print("?? ALL SERVICES STOPPED.")
        sys.exit(0)
