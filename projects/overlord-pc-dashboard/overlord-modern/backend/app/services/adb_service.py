"""ADB Service using the adb command-line tool."""

import subprocess
import logging

log = logging.getLogger(__name__)


def get_devices():
    """Get a list of connected ADB devices."""
    try:
        result = subprocess.run(
            ["adb", "devices"], capture_output=True, text=True, check=True
        )
        lines = result.stdout.strip().split("\n")[1:]
        devices = []
        for line in lines:
            if "\t" in line:
                serial, status = line.split("\t")
                devices.append({"serial": serial, "status": status})
        return devices
    except FileNotFoundError:
        log.error("adb command not found. Make sure it is in your system's PATH.")
        return {"error": "adb command not found."}
    except subprocess.CalledProcessError as e:
        log.error(f"An error occurred while running adb devices: {e.stderr}")
        return {"error": e.stderr}
