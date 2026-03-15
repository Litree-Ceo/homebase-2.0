import logging
from typing import Optional

from ppadb.client import Client as AdbClient
from ppadb.device import Device

# Use core logger for consistency and security sanitization
try:
    from core import get_logger
    log = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    log = logging.getLogger(__name__)

class AdbManager:
    """Manages ADB connections and device operations."""

    def __init__(self, host="127.0.0.1", port=5037):
        self.host = host
        self.port = port
        self.client = None

    def connect_client(self):
        """Establish a connection to the ADB server."""
        try:
            self.client = AdbClient(host=self.host, port=self.port)
            log.info("ADB client connected successfully at %s:%s", self.host, self.port)
            return self.client
        except (RuntimeError, ConnectionRefusedError) as e:
            log.error("Failed to connect to ADB server: %s", e, exc_info=True)
            return None

    def get_devices(self) -> list[Device]:
        """Get a list of connected devices."""
        if not self.client:
            log.warning("ADB client not connected. Call connect_client() first.")
            return []
        try:
            return self.client.devices()
        except Exception as e:
            log.error("Failed to get devices: %s", e, exc_info=True)
            return []

    def get_device(self, serial: str) -> Device | None:
        """Get a specific device by its serial number."""
        if not self.client:
            log.warning("ADB client not connected.")
            return None
        try:
            return self.client.device(serial)
        except Exception as e:
            log.error("Failed to get device %s: %s", serial, e, exc_info=True)
            return None

    def shell(self, serial: str, command: str) -> str | None:
        """Execute a shell command on a device."""
        device = self.get_device(serial)
        if not device:
            return None
        try:
            return device.shell(command)
        except Exception as e:
            log.error("Shell command failed on %s: %s", serial, e, exc_info=True)
            return None

    def push(self, serial: str, local_path: str, remote_path: str) -> bool:
        """Push a file to the device."""
        device = self.get_device(serial)
        if not device:
            return False
        try:
            device.push(local_path, remote_path)
            log.info("Pushed %s to %s on %s", local_path, remote_path, serial)
            return True
        except Exception as e:
            log.error("Push failed on %s: %s", serial, e, exc_info=True)
            return False

    def pull(self, device_serial: str, remote_path: str, local_path: str) -> str:
        """Pull a file from a device."""
        device = self.get_device(device_serial)
        if not device:
            return "Error: Device not found"
        try:
            device.pull(remote_path, local_path)
            log.info("Pulled %s to %s from %s", remote_path, local_path, device_serial)
            return f"Success: Pulled {remote_path} to {local_path}"
        except Exception as e:
            log.error("Pull failed on %s: %s", device_serial, e, exc_info=True)
            return f"Error: Pull failed - {e}"

    def install_apk(self, device_serial: str, apk_path: str) -> str:
        """Install an APK on a device."""
        device = self.get_device(device_serial)
        if not device:
            return "Error: Device not found"
        try:
            device.install(apk_path, nolaunch=True)
            log.info("Installed %s on %s", apk_path, device_serial)
            return "Success: APK installed"
        except Exception as e:
            log.error("Install failed on %s: %s", device_serial, e, exc_info=True)
            return f"Error: Install failed: {e}"

    def get_device_info(self, device: Device) -> dict:
        """Get detailed information about a single device."""
        try:
            props = device.get_properties()
            return {
                "serial": device.serial,
                "product": props.get("ro.product.model", "N/A"),
                "status": device.get_state(),
                "battery": device.get_battery_level(),
                "sdk_version": props.get("ro.build.version.sdk", "N/A"),
            }
        except (Exception, AttributeError) as e:
            log.error("Could not retrieve info for device %s: %s", device.serial, e, exc_info=True)
            return {"serial": device.serial, "status": "Offline or Error"}
