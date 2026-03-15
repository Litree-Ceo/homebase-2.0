"""Termux Service using Paramiko for SSH."""

import paramiko
import logging

log = logging.getLogger(__name__)


class TermuxManager:
    def __init__(self):
        self.ssh = None

    def connect(self, hostname, port, username, password):
        try:
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh.connect(hostname, port, username, password, timeout=10)
            return True, "Connected"
        except Exception as e:
            log.error(f"Termux connection failed: {e}")
            return False, str(e)

    def disconnect(self):
        if self.ssh:
            self.ssh.close()
            self.ssh = None

    def execute_command(self, command):
        if not self.ssh:
            return {"error": "Not connected"}
        try:
            _, stdout, stderr = self.ssh.exec_command(command, timeout=15)
            return {"output": stdout.read().decode(), "error": stderr.read().decode()}
        except Exception as e:
            return {"error": str(e)}


termux_manager = TermuxManager()
