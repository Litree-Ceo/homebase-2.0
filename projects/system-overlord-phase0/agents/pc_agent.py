#!/usr/bin/env python3
"""
System Overlord PC Agent
Executes security tool commands from Firebase command queue on PC platforms
Supports native execution and Docker-based containerized execution
"""

import os
import sys
import json
import time
import logging
import subprocess
import hashlib
from datetime import datetime
from threading import Thread
from typing import Optional, Dict, Any
from pathlib import Path
import uuid

import firebase_admin
from firebase_admin import credentials, db, firestore
import docker
from docker.models.containers import Container

# Configuration
AGENT_ID = os.environ.get("AGENT_ID", f"pc-{uuid.getnode()}")
AGENT_PLATFORM = os.environ.get("AGENT_PLATFORM", "pc-docker")  # pc-native, pc-docker
FIREBASE_DB_URL = os.environ.get("FIREBASE_DB_URL", "https://overlord-command-center.firebaseio.com")
FIREBASE_CREDENTIALS = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "./firebase-key.json")

# Supported tools (PC agent subset)
SUPPORTED_TOOLS = {
    "nmap-scan": {"docker_image": "insready/nmap", "executable": "nmap"},
    "httpx-probe": {"docker_image": "projectdiscovery/httpx", "executable": "httpx"},
    "nikto-scan": {"docker_image": "fkr73/nikto", "executable": "nikto"},
    "sqlmap-injection": {"docker_image": "pycurl/nmap", "executable": "sqlmap"},
    "gobuster-fuzz": {"docker_image": "projectdiscovery/nuclei", "executable": "gobuster"},
}

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("pc_agent.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("PCAgent")


class PCAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.platform = AGENT_PLATFORM
        self.running = False
        self.docker_client: Optional[docker.DockerClient] = None
        self.db = None
        self.firestore_db = None
        self._initialize_firebase()
        self._initialize_docker()

    def _initialize_firebase(self):
        """Initialize Firebase connection"""
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(FIREBASE_CREDENTIALS)
                firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DB_URL})

            self.firestore_db = firestore.client()
            self.db = firebase_admin.db.reference()
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            sys.exit(1)

    def _initialize_docker(self):
        """Initialize Docker client (if using Docker execution)"""
        if self.platform == "pc-docker":
            try:
                self.docker_client = docker.from_env()
                self.docker_client.ping()
                logger.info("Docker client initialized")
            except Exception as e:
                logger.warning(f"Docker not available: {e}")
                self.platform = "pc-native"

    def register_agent(self):
        """Register this agent with Firebase"""
        try:
            agent_data = {
                "agentId": self.agent_id,
                "platform": self.platform,
                "status": "online",
                "lastHeartbeat": datetime.utcnow().isoformat(),
                "capabilities": list(SUPPORTED_TOOLS.keys()),
                "version": "1.0.0",
            }

            self.firestore_db.collection("agents").document(self.agent_id).set(agent_data)
            logger.info(f"Agent registered: {self.agent_id}")
        except Exception as e:
            logger.error(f"Failed to register agent: {e}")

    def update_heartbeat(self):
        """Update agent heartbeat to indicate it's alive"""
        try:
            self.firestore_db.collection("agents").document(self.agent_id).update({
                "lastHeartbeat": datetime.utcnow().isoformat(),
                "status": "online",
            })
        except Exception as e:
            logger.warning(f"Failed to update heartbeat: {e}")

    def poll_commands(self) -> list:
        """Poll for pending commands from Firebase"""
        try:
            query = (
                self.firestore_db.collection("security_commands")
                .where("status", "==", "pending")
                .where("targetAgent", "==", self.platform)
                .limit(5)
            )
            docs = query.stream()
            commands = []
            for doc in docs:
                commands.append({"id": doc.id, **doc.to_dict()})
            return commands
        except Exception as e:
            logger.error(f"Failed to poll commands: {e}")
            return []

    def execute_command(self, command_id: str, command_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a security tool command"""
        logger.info(f"Executing command {command_id}: {command_data['toolId']}")

        try:
            tool_id = command_data.get("toolId")
            parameters = command_data.get("parameters", {})

            if tool_id not in SUPPORTED_TOOLS:
                raise ValueError(f"Tool {tool_id} not supported on this agent")

            # Execute based on platform
            if self.platform == "pc-docker" and self.docker_client:
                return self._execute_docker(tool_id, parameters, command_id)
            else:
                return self._execute_native(tool_id, parameters, command_id)

        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            return {"success": False, "error": str(e), "output": ""}

    def _execute_docker(self, tool_id: str, parameters: Dict[str, Any], command_id: str) -> Dict[str, Any]:
        """Execute command in Docker container"""
        tool_config = SUPPORTED_TOOLS[tool_id]
        image = tool_config["docker_image"]
        executable = tool_config["executable"]

        try:
            # Build command arguments
            args = self._build_command_args(tool_id, parameters)
            full_cmd = f"{executable} {' '.join(args)}"

            logger.info(f"Docker exec: {full_cmd}")

            # Pull image if needed
            try:
                self.docker_client.images.get(image)
            except docker.errors.ImageNotFound:
                logger.info(f"Pulling Docker image: {image}")
                self.docker_client.images.pull(image)

            # Run container with timeout and resource limits
            container = self.docker_client.containers.run(
                image,
                full_cmd,
                detach=False,
                remove=True,
                timeout=300,  # 5 minute timeout
                mem_limit="512m",
                memswap_limit="512m",
                cpu_quota=50000,  # 50% CPU limit
                cap_drop=["ALL"],
                cap_add=["NET_RAW"],  # Allow network tools
                network_mode="host",  # Required for network scanning
            )

            output = container.decode("utf-8") if isinstance(container, bytes) else str(container)

            return {
                "success": True,
                "output": output,
                "executionTime": time.time(),
                "container": "completed",
            }

        except docker.errors.ContainerError as e:
            logger.error(f"Container execution error: {e}")
            return {"success": False, "error": str(e), "output": e.stderr.decode() if e.stderr else ""}
        except Exception as e:
            logger.error(f"Docker execution error: {e}")
            return {"success": False, "error": str(e), "output": ""}

    def _execute_native(self, tool_id: str, parameters: Dict[str, Any], command_id: str) -> Dict[str, Any]:
        """Execute command natively (requires tool installed locally)"""
        tool_config = SUPPORTED_TOOLS[tool_id]
        executable = tool_config["executable"]

        try:
            # Build command arguments
            args = self._build_command_args(tool_id, parameters)
            cmd = [executable] + args

            logger.info(f"Native exec: {' '.join(cmd)}")

            # Execute with timeout
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
            )

            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr if result.returncode != 0 else None,
                "returnCode": result.returncode,
            }

        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Command timed out (300s limit)", "output": ""}
        except FileNotFoundError:
            return {"success": False, "error": f"Tool not found: {executable}", "output": ""}
        except Exception as e:
            logger.error(f"Native execution error: {e}")
            return {"success": False, "error": str(e), "output": ""}

    def _build_command_args(self, tool_id: str, parameters: Dict[str, Any]) -> list:
        """Build command arguments from parameters dict"""
        args = []

        if tool_id == "nmap-scan":
            args.append(parameters.get("scanType", "-sS"))
            if "ports" in parameters:
                args.extend(["-p", parameters["ports"]])
            args.extend(["--max-rtt-timeout", f"{parameters.get('timeout', 300)}ms"])
            args.append(parameters["target"])

        elif tool_id == "httpx-probe":
            if parameters.get("followRedirects"):
                args.append("-follow-redirects")
            args.extend(["-timeout", str(parameters.get("timeout", 10))])
            args.extend(["-l", "-"])  # Read from stdin
            # Will pipe URLs via stdin

        elif tool_id == "nikto-scan":
            args.extend(["-h", parameters["target"]])
            if "port" in parameters:
                args.extend(["-p", str(parameters["port"])])
            if parameters.get("ssl"):
                args.append("-ssl")

        elif tool_id == "sqlmap-injection":
            args.extend(["-u", parameters["url"]])
            if "techniques" in parameters:
                args.extend(["-t", "".join(parameters["techniques"])])
            if "riskLevel" in parameters:
                args.extend(["--risk", str(parameters["riskLevel"])])

        return args

    def update_command_status(self, command_id: str, status: str, result: Dict[str, Any]):
        """Update command status in Firebase"""
        try:
            update_data = {
                "status": status,
                "updatedAt": datetime.utcnow().isoformat(),
            }

            if status == "completed":
                update_data["result"] = result
                update_data["resultHash"] = hashlib.sha256(
                    json.dumps(result, sort_keys=True).encode()
                ).hexdigest()

            elif status == "failed":
                update_data["error"] = result.get("error")

            # Add audit log entry
            audit_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "event": f"command_{status}",
                "agentId": self.agent_id,
                "details": result,
            }

            self.firestore_db.collection("security_commands").document(command_id).update({
                **update_data,
                "auditLog": firestore.ArrayUnion([audit_entry]),
            })

            logger.info(f"Command {command_id} status updated: {status}")

        except Exception as e:
            logger.error(f"Failed to update command status: {e}")

    def run_loop(self):
        """Main agent loop"""
        self.running = True
        self.register_agent()

        logger.info(f"PC Agent starting (platform: {self.platform})")

        while self.running:
            try:
                # Update heartbeat
                self.update_heartbeat()

                # Poll for commands
                commands = self.poll_commands()

                for command in commands:
                    command_id = command["id"]
                    logger.info(f"Processing command: {command_id}")

                    # Mark as executing
                    self.update_command_status(command_id, "executing", {})

                    # Execute
                    result = self.execute_command(command_id, command)

                    # Update status
                    status = "completed" if result.get("success") else "failed"
                    self.update_command_status(command_id, status, result)

                # Sleep before next poll
                time.sleep(10)

            except KeyboardInterrupt:
                logger.info("Agent shutting down...")
                self.running = False
            except Exception as e:
                logger.error(f"Loop error: {e}")
                time.sleep(30)

    def shutdown(self):
        """Clean shutdown"""
        self.running = False
        try:
            self.firestore_db.collection("agents").document(self.agent_id).update({
                "status": "offline",
                "lastHeartbeat": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
        logger.info("Agent shutdown complete")


def main():
    agent = PCAgent()
    try:
        agent.run_loop()
    except KeyboardInterrupt:
        agent.shutdown()


if __name__ == "__main__":
    main()
