import logging
import paramiko

log = logging.getLogger(__name__)


class TermuxManager:
    def __init__(self):
        self.ssh = None

    def connect(self, hostname, port, username, password):
        try:
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh.connect(hostname, port, username, password, timeout=10)
            log.info("Successfully connected to %s@%s:%s", username, hostname, port)
            return True, "Connected"
        except paramiko.AuthenticationException:
            log.error("Authentication failed")
            return False, "Authentication failed"
        except paramiko.SSHException as e:
            log.error("SSH connection error", exc_info=True)
            return False, f"SSH connection error: {e}"
        except (OSError, paramiko.SSHException) as e:
            log.error("An unexpected error occurred during connection", exc_info=True)
            return False, f"An unexpected error occurred: {e}"

    def disconnect(self):
        if self.ssh:
            self.ssh.close()
            self.ssh = None
            log.info("Disconnected")

    def execute_command(self, command):
        if not self.ssh:
            return "Not connected"
        try:
            _, stdout, stderr = self.ssh.exec_command(command, timeout=15)
            output = stdout.read().decode()
            error = stderr.read().decode()
            if error:
                log.warning("Command '%s' produced stderr: %s", command, error)
            return output or error
        except paramiko.SSHException:
            log.error("Error executing command", exc_info=True)
            return "Error executing command"

    def list_files(self, path):
        if not self.ssh:
            return "Not connected"
        try:
            sftp = self.ssh.open_sftp()
            files = sftp.listdir(path)
            sftp.close()
            return files
        except FileNotFoundError:
            log.warning("SFTP: Directory not found at %s", path)
            return f"Directory not found: {path}"
        except paramiko.SFTPError:
            log.error("SFTP error listing files", exc_info=True)
            return "SFTP error"

    def run_aider(self, files, prompt):
        if not self.ssh:
            return "Not connected"

        # Sanitize and quote arguments to prevent injection
        safe_files = " ".join([f'"{f}"' for f in files])
        safe_prompt = f'"{prompt}"'

        command = f"python aider_agent.py {safe_files} {safe_prompt}"
        return self.execute_command(command)

    def read_file(self, path):
        if not self.ssh:
            return "Not connected"
        try:
            sftp = self.ssh.open_sftp()
            with sftp.open(path) as f:
                content = f.read().decode()
            sftp.close()
            return content
        except FileNotFoundError:
            log.warning("SFTP: File not found at %s", path)
            return f"File not found: {path}"
        except paramiko.SFTPError:
            log.error("SFTP error reading file", exc_info=True)
            return "SFTP error"

    def write_file(self, path, content):
        if not self.ssh:
            return "Not connected"
        try:
            sftp = self.ssh.open_sftp()
            with sftp.open(path, "w") as f:
                f.write(content)
            sftp.close()
            return "Success"
        except paramiko.SFTPError:
            log.error("SFTP error writing file", exc_info=True)
            return "SFTP error"
