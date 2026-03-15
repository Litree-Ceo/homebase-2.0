"""
ADB Manager Module
Handles Android Debug Bridge operations for device management
"""

import logging
import os
from typing import List, Optional

from ppadb.client import Client as AdbClient
from ppadb.device import Device

log = logging.getLogger(__name__)


class AdbManager:
    """Manages ADB connections and device operations"""

    def __init__(self, host: str = "127.0.0.1", port: int = 5037):
        """
        Initialize ADB client

        Args:
            host: ADB server host (default: localhost)
            port: ADB server port (default: 5037)
        """
        self.host = host
        self.port = port
        self.client: Optional[AdbClient] = None
        self._connect()

    def _connect(self) -> bool:
        """Establish connection to ADB server"""
        try:
            self.client = AdbClient(host=self.host, port=self.port)
            # Test connection
            self.client.version()
            log.info("ADB connected to %s:%s", self.host, self.port)
            return True
        except RuntimeError:
            log.error("ADB connection failed", exc_info=True)
            self.client = None
            return False

    def is_connected(self) -> bool:
        """Check if ADB server is connected"""
        if not self.client:
            return self._connect()
        try:
            self.client.version()
            return True
        except RuntimeError:
            return self._connect()

    def get_devices(self) -> List[Device]:
        """
        Get list of connected devices

        Returns:
            List of Device objects
        """
        if not self.is_connected() or not self.client:
            return []
        try:
            return self.client.devices()
        except RuntimeError:
            log.error("Failed to get devices", exc_info=True)
            return []

    def get_device_info(self, device_serial: str) -> dict:
        """
        Get detailed information about a device

        Args:
            device_serial: Device serial number

        Returns:
            Dictionary with device info
        """
        device = self._get_device(device_serial)
        if not device:
            return {"error": f"Device {device_serial} not found"}

        try:
            return {
                "serial": device.serial,
                "model": device.shell("getprop ro.product.model").strip(),
                "android_version": device.shell(
                    "getprop ro.build.version.release"
                ).strip(),
                "sdk": device.shell("getprop ro.build.version.sdk").strip(),
                "battery": self._get_battery_info(device),
            }
        except RuntimeError:
            log.error("Failed to get device info", exc_info=True)
            return {"error": "Failed to get device info"}

    def _get_battery_info(self, device: Device) -> dict:
        """Extract battery information from device"""
        try:
            output = device.shell("dumpsys battery")
            battery = {
                "level": "Unknown",
                "status": "Unknown",
                "temperature": "Unknown",
            }
            for line in output.split("\n"):
                if "level:" in line.lower():
                    battery["level"] = line.split(":")[1].strip()
                elif "status:" in line.lower():
                    battery["status"] = line.split(":")[1].strip()
                elif "temperature:" in line.lower():
                    temp_str = line.split(":")[1].strip()
                    if temp_str.isdigit():
                        battery["temperature"] = f"{float(temp_str) / 10}°C"
            return battery
        except RuntimeError:
            log.error("Error getting battery info", exc_info=True)
            return {"level": "Unknown", "status": "Unknown", "temperature": "Unknown"}

    def shell(self, serial: str, command: str) -> Optional[str]:
        """Execute a shell command on a device."""
        device = self._get_device(serial)
        if not device:
            return None
        try:
            return device.shell(command)
        except RuntimeError:
            log.error("Shell command failed", exc_info=True)
            return None

    def push(self, serial: str, local_path: str, remote_path: str) -> bool:
        """Push a file to a device."""
        device = self._get_device(serial)
        if not device:
            return False
        try:
            device.push(local_path, remote_path)
            log.info("Pushed %s to %s on %s", local_path, remote_path, serial)
            return True
        except RuntimeError:
            log.error("Push failed", exc_info=True)
            return False

    def pull(self, device_serial: str, remote_path: str, local_path: str) -> str:
        """
        Pull file from device

        Args:
            device_serial: Device serial number
            remote_path: Remote file path
            local_path: Local destination path

        Returns:
            Status message
        """
        device = self._get_device(device_serial)
        if not device:
            return f"Error: Device {device_serial} not found."

        try:
            device.pull(remote_path, local_path)
            log.info("Pulled %s to %s from %s", remote_path, local_path, device_serial)
            return f"Success: Pulled {remote_path} to {local_path}"
        except RuntimeError:
            log.error("Pull failed", exc_info=True)
            return "Error: Pull failed"

    def install_apk(self, device_serial: str, apk_path: str) -> str:
        """
        Install APK on device

        Args:
            device_serial: Device serial number
            apk_path: Path to APK file

        Returns:
            Status message
        """
        device = self._get_device(device_serial)
        if not device:
            return f"Error: Device {device_serial} not found."

        if not os.path.exists(apk_path):
            return f"Error: APK not found: {apk_path}"

        if not apk_path.endswith(".apk"):
            return "Error: File must be an APK"

        try:
            # The install method returns a boolean, but we simplify to a single success message
            # assuming an exception will be raised on critical failure.
            device.install(apk_path)
            log.info("Installed %s on %s", apk_path, device_serial)
            return "Success: APK installed"
        except RuntimeError as e:
            log.error("Install failed", exc_info=True)
            return f"Error: Install failed: {e}"

    def _get_device(self, serial: str) -> Optional[Device]:
        """Get device by serial number"""
        if not self.is_connected() or not self.client:
            return None
        try:
            return self.client.device(serial)
        except RuntimeError:
            # Can be raised if the device is disconnected during the operation
            return None

    def disconnect(self):
        """Stop the ADB server and clean up resources."""
        if self.client:
            try:
                self.client.kill()
                log.info("ADB server stopped.")
            except RuntimeError:
                log.error("Failed to stop ADB server", exc_info=True)
        self.client = None
        log.info("ADB client disconnected.")


# Singleton instance for server use
_ADB_MANAGER = AdbManager()


def get_adb_manager() -> AdbManager:
    """Get singleton ADB manager instance"""
    return _ADB_MANAGER
