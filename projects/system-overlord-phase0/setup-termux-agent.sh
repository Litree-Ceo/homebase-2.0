#!/bin/bash
#
# System Overlord Termux Agent Setup
# Installs Kali Linux tools available in Termux and configures Python execution environment
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== System Overlord Termux Agent Setup ===${NC}"

# Step 1: Update package manager
echo -e "${YELLOW}[1/5] Updating package manager...${NC}"
pkg update -y
pkg upgrade -y

# Step 2: Install core dependencies
echo -e "${YELLOW}[2/5] Installing core dependencies...${NC}"
pkg install -y \
  python \
  python-pip \
  git \
  curl \
  wget \
  openssh \
  nano

# Step 3: Install reconnaissance tools (LOW risk)
echo -e "${YELLOW}[3/5] Installing reconnaissance tools...${NC}"
pkg install -y \
  nmap \
  nikto \
  dnsutils \
  iputils \
  net-tools \
  whois

# Step 4: Install web assessment tools (MEDIUM risk)
echo -e "${YELLOW}[4/5] Installing web assessment tools...${NC}"
pkg install -y \
  sqlmap \
  hydra \
  hashcat

# Step 5: Setup Python environment
echo -e "${YELLOW}[5/5] Setting up Python environment...${NC}"
pip install --upgrade pip
pip install \
  firebase-admin \
  requests \
  beautifulsoup4 \
  python-dotenv \
  pydantic \
  docker

# Create agents directory if not exists
mkdir -p ~/System-Overlord-Phase0/agents

# Copy termux agent script
echo -e "${GREEN}Installing Termux agent...${NC}"

cat > ~/System-Overlord-Phase0/agents/termux_agent.py << 'EOF'
#!/usr/bin/env python3
"""
System Overlord Termux Agent
Lightweight command execution for Android Termux environment
Subset of tools available in Termux package manager
"""

import os
import sys
import json
import time
import logging
import subprocess
import threading
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("ERROR: firebase-admin not installed. Run: pip install firebase-admin")
    sys.exit(1)

# Configuration
AGENT_ID = os.environ.get("AGENT_ID", f"termux-{uuid.uuid4().hex[:8]}")
AGENT_PLATFORM = "termux"
FIREBASE_CREDENTIALS = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "./firebase-key.json")

# Termux-available tools
SUPPORTED_TOOLS = {
    "nmap-scan": {"executable": "nmap", "riskLevel": "LOW"},
    "nikto-scan": {"executable": "nikto", "riskLevel": "MEDIUM"},
    "sqlmap-injection": {"executable": "sqlmap", "riskLevel": "MEDIUM"},
    "hydra-crack": {"executable": "hydra", "riskLevel": "HIGH"},
    "whois-lookup": {"executable": "whois", "riskLevel": "LOW"},
}

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.path.expanduser("~/termux_agent.log")),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("TermuxAgent")


class TermuxAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.platform = AGENT_PLATFORM
        self.running = False
        self.firestore_db = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase connection"""
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(FIREBASE_CREDENTIALS)
                firebase_admin.initialize_app(cred)

            self.firestore_db = firestore.client()
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            sys.exit(1)

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
                "riskProfile": "MEDIUM",  # Termux has limitations
            }

            self.firestore_db.collection("agents").document(self.agent_id).set(agent_data)
            logger.info(f"Agent registered: {self.agent_id}")
        except Exception as e:
            logger.error(f"Failed to register agent: {e}")

    def update_heartbeat(self):
        """Update agent heartbeat"""
        try:
            self.firestore_db.collection("agents").document(self.agent_id).update({
                "lastHeartbeat": datetime.utcnow().isoformat(),
                "status": "online",
            })
        except Exception as e:
            logger.warning(f"Failed to update heartbeat: {e}")

    def poll_commands(self) -> list:
        """Poll for pending commands"""
        try:
            query = (
                self.firestore_db.collection("security_commands")
                .where("status", "==", "pending")
                .where("targetAgent", "==", self.platform)
                .limit(3)  # Termux: limit concurrency
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
        """Execute command on Termux"""
        logger.info(f"Executing command {command_id}")

        try:
            tool_id = command_data.get("toolId")
            parameters = command_data.get("parameters", {})

            if tool_id not in SUPPORTED_TOOLS:
                raise ValueError(f"Tool {tool_id} not supported on Termux")

            # Build command
            args = self._build_command_args(tool_id, parameters)
            executable = SUPPORTED_TOOLS[tool_id]["executable"]
            cmd = [executable] + args

            logger.info(f"Executing: {' '.join(cmd)}")

            # Run with timeout (Termux: 120s limit for battery)
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,  # 2 minute timeout for Termux
            )

            return {
                "success": result.returncode == 0,
                "output": result.stdout[:5000],  # Limit output size
                "error": result.stderr[:1000] if result.returncode != 0 else None,
                "returnCode": result.returncode,
                "executedAt": datetime.utcnow().isoformat(),
            }

        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Command timed out (120s limit)", "output": ""}
        except FileNotFoundError:
            return {"success": False, "error": "Tool not found. Install with: pkg install nmap", "output": ""}
        except Exception as e:
            logger.error(f"Execution error: {e}")
            return {"success": False, "error": str(e), "output": ""}

    def _build_command_args(self, tool_id: str, parameters: Dict[str, Any]) -> list:
        """Build command arguments"""
        args = []

        if tool_id == "nmap-scan":
            args.append(parameters.get("scanType", "-sS"))
            if "ports" in parameters:
                args.extend(["-p", parameters["ports"]])
            args.extend(["--max-rtt-timeout", "150ms"])  # Mobile-optimized
            args.append(parameters["target"])

        elif tool_id == "nikto-scan":
            args.extend(["-h", parameters["target"]])

        elif tool_id == "sqlmap-injection":
            args.extend(["-u", parameters["url"]])
            args.extend(["-t", "".join(parameters.get("techniques", ["B", "E"]))])

        elif tool_id == "whois-lookup":
            args.append(parameters.get("target"))

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

            elif status == "failed":
                update_data["error"] = result.get("error")

            self.firestore_db.collection("security_commands").document(command_id).update(update_data)
            logger.info(f"Command {command_id} status: {status}")

        except Exception as e:
            logger.error(f"Failed to update status: {e}")

    def run_loop(self):
        """Main agent loop"""
        self.running = True
        self.register_agent()

        logger.info("Termux Agent starting")

        while self.running:
            try:
                self.update_heartbeat()

                # Poll for commands
                commands = self.poll_commands()

                for command in commands:
                    command_id = command["id"]
                    logger.info(f"Processing: {command_id}")

                    self.update_command_status(command_id, "executing", {})
                    result = self.execute_command(command_id, command)

                    status = "completed" if result.get("success") else "failed"
                    self.update_command_status(command_id, status, result)

                time.sleep(15)  # Poll every 15 seconds

            except KeyboardInterrupt:
                logger.info("Shutting down...")
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
            })
        except Exception as e:
            logger.error(f"Shutdown error: {e}")


def main():
    agent = TermuxAgent()
    try:
        agent.run_loop()
    except KeyboardInterrupt:
        agent.shutdown()


if __name__ == "__main__":
    main()
EOF

chmod +x ~/System-Overlord-Phase0/agents/termux_agent.py

echo -e "${GREEN}✓ Termux agent installed${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create Firebase credentials: export GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json"
echo "2. Start agent: python3 ~/System-Overlord-Phase0/agents/termux_agent.py"
echo "3. Monitor in dashboard: https://overlord-command-center.web.app/agents"
