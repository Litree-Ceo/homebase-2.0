"""
Mock AI Assistant Module
Simulates AI chat responses for testing and demonstration
"""

import logging
import random
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List

# Use core logger for consistency and security sanitization
try:
    from core import get_logger

    logger = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    logger = logging.getLogger(__name__)


@dataclass
class Message:
    """Represents a chat message"""

    role: str  # 'user' or 'assistant'
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


class MockAIAssistant:
    """A mock AI assistant that generates predefined responses"""

    def __init__(self, max_history: int = 100):
        self.conversation_history: deque = deque(maxlen=max_history)
        self.is_processing = False

        # Predefined response templates
        self.response_templates = {
            "greeting": [
                "Hello! I'm your AI assistant. How can I help you today?",
                "Hi there! I'm here to assist you. What would you like to know?",
                "Greetings! How may I be of service to you?",
                "Welcome! I'm your PC Dashboard assistant. What can I do for you?",
            ],
            "help": [
                "I can help you with various tasks including:\n"
                "• System monitoring (CPU, memory, disk usage)\n"
                "• Service management (start, stop, restart services)\n"
                "• File operations and management\n"
                "• General questions and information\n\n"
                "Just ask me anything!",
                "I'm here to assist! I can:\n"
                "✓ Answer questions about your system\n"
                "✓ Provide status updates\n"
                "✓ Help with dashboard operations\n"
                "✓ Execute simple commands\n\n"
                "What would you like to do?",
            ],
            "status": [
                "📊 System Status Report:\n"
                "• CPU Usage: 45%\n"
                "• Memory Usage: 62%\n"
                "• Disk Usage: 78%\n"
                "• All services: Operational ✓",
                "✅ All systems are running smoothly!\n"
                "• Web Server: Running\n"
                "• Database: Connected\n"
                "• Docker: Active\n"
                "• Monitoring: Enabled",
            ],
            "docker": [
                "🐳 Docker Status:\n"
                "• Containers running: 3\n"
                "• Images available: 12\n"
                "• Volume mounts: 5\n"
                "Use 'docker ps' for detailed container info.",
                "Docker Overview:\n"
                "Container | Status | Ports\n"
                "----------|--------|------\n"
                "web-app   | Running| 3000\n"
                "db        | Running| 5432\n"
                "redis     | Running| 6379",
            ],
            "files": [
                "📁 File System:\n"
                "• Total files: 1,247\n"
                "• Storage used: 234 GB\n"
                "• Available: 66 GB\n\n"
                "Would you like me to list specific directories?"
            ],
            "network": [
                "🌐 Network Status:\n"
                "• Connection: Active\n"
                "• IP Address: 192.168.1.100\n"
                "• Latency: 12ms\n"
                "• Upload: 5.2 Mbps\n"
                "• Download: 45.8 Mbps"
            ],
            "default": [
                "I understand your request. Let me process that for you...",
                "That's an interesting query. Here's my response:",
                "I've analyzed your input. Here's what I can tell you:",
                "Thank you for that information. Based on my analysis:",
                "Processing your request. Here's the result:",
            ],
        }

        # Keyword to category mapping
        self.keyword_map = {
            "greeting": [
                "hello",
                "hi",
                "hey",
                "greetings",
                "good morning",
                "good evening",
                "good afternoon",
            ],
            "help": [
                "help",
                "assist",
                "support",
                "what can you do",
                "capabilities",
                "features",
                "commands",
            ],
            "status": [
                "status",
                "system",
                "cpu",
                "memory",
                "running",
                "performance",
                "health",
                "check",
            ],
            "docker": [
                "docker",
                "container",
                "containers",
                "images",
                "volumes",
                "kubernetes",
            ],
            "files": [
                "file",
                "files",
                "directory",
                "folder",
                "storage",
                "disk",
                "space",
            ],
            "network": [
                "network",
                "internet",
                "connection",
                "ip",
                "wifi",
                "ethernet",
                "latency",
            ],
        }

    def process_message(self, user_input: str) -> str:
        """
        Process user input and generate a response

        Args:
            user_input: The user's message

        Returns:
            The AI's response string
        """
        if self.is_processing:
            return "I'm currently processing another request. Please wait."

        self.is_processing = True

        # Add user message to history
        self.conversation_history.append(Message(role="user", content=user_input))

        # Simulate processing delay
        delay = random.uniform(0.1, 1.5)
        time.sleep(delay)

        # Generate response
        response = self._generate_response(user_input.lower())

        # Add AI response to history
        self.conversation_history.append(Message(role="assistant", content=response))

        self.is_processing = False
        return response

    def _generate_response(self, input_text: str) -> str:
        """Generate a response based on keywords in the input"""

        # Check for keyword matches
        for category, keywords in self.keyword_map.items():
            if any(keyword in input_text for keyword in keywords):
                templates = self.response_templates.get(
                    category, self.response_templates["default"]
                )
                return random.choice(templates)

        # Return random default response
        defaults = self.response_templates["default"]
        base_response = random.choice(defaults)

        # Add some context-specific follow-up
        followups = [
            "\n\nIs there anything else you'd like to know?",
            "\n\nFeel free to ask more questions!",
            "\n\nWould you like more details on any specific aspect?",
            "\n\nLet me know if you need help with anything else.",
        ]

        return base_response + random.choice(followups)

    def get_history(self) -> List[Dict]:
        """Get conversation history"""
        return [
            {"role": msg.role, "content": msg.content, "timestamp": msg.timestamp}
            for msg in self.conversation_history
        ]

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history.clear()

    def process_command(self, command: str) -> str:
        """
        Process system commands

        Args:
            command: The command to execute

        Returns:
            Command result string
        """
        cmd = command.lower().strip()

        command_handlers = {
            "system status": lambda: (
                "🖥️ System Status:\n"
                "• OS: Windows 11 / Linux (WSL)\n"
                "• CPU: AMD Ryzen 7, 8 cores @ 3.8GHz\n"
                "• RAM: 32GB DDR4\n"
                "• Uptime: 3 days, 14 hours"
            ),
            "list services": lambda: (
                "📋 Active Services:\n"
                "• Web Server (Port 3000): Running\n"
                "• Database (Port 5432): Connected\n"
                "• Redis (Port 6379): Active\n"
                "• Docker Engine: Running\n"
                "• SSH Tunnel: Connected"
            ),
            "get logs": lambda: (
                f"📜 Recent Logs:\n"
                f"[{datetime.now().isoformat()}] INFO: Server started\n"
                f"[{datetime.now().isoformat()}] INFO: Database connected\n"
                f"[{datetime.now().isoformat()}] INFO: All systems nominal\n"
                f"[{datetime.now().isoformat()}] DEBUG: Monitoring enabled"
            ),
            "check updates": lambda: (
                "🔄 Update Status:\n"
                "• System packages: Up to date\n"
                "• Docker images: 2 updates available\n"
                "• Dashboard: Latest version v4.2.1"
            ),
            "disk usage": lambda: (
                "💾 Disk Usage:\n"
                "• C:\\ (Windows): 78% used (234GB/300GB)\n"
                "• D:\\ (Data): 45% used (450GB/1TB)\n"
                "• /home (Linux): 62% used (124GB/200GB)"
            ),
            "memory": lambda: (
                "🧠 Memory Status:\n"
                "• Total: 32GB\n"
                "• Used: 19.8GB (62%)\n"
                "• Available: 12.2GB\n"
                "• Swap: 4GB used / 8GB total"
            ),
        }

        for key, handler in command_handlers.items():
            if key in cmd:
                return handler()

        return (
            f"Command '{command}' not recognized.\n\n"
            "Available commands:\n"
            "• system status\n"
            "• list services\n"
            "• get logs\n"
            "• check updates\n"
            "• disk usage\n"
            "• memory"
        )

    def get_quick_responses(self) -> List[str]:
        """Get quick response suggestions for UI"""
        return [
            "What is the system status?",
            "Show me Docker containers",
            "Check disk usage",
            "List active services",
            "What can you help me with?",
        ]


# Singleton instance
_MOCK_AI_INSTANCE = MockAIAssistant()


def get_mock_ai() -> MockAIAssistant:
    """Get the singleton mock AI instance"""
    return _MOCK_AI_INSTANCE


def get_mock_response(prompt: str) -> str:
    """Get a mock AI response for the given prompt."""
    ai = get_mock_ai()
    return ai.process_message(prompt)


if __name__ == "__main__":
    import sys

    # Check if called with command line argument (from server.py)
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
        ai = MockAIAssistant()
        response = ai.process_message(prompt)
        # Use ASCII-safe output for Windows console
        response = response.encode("ascii", "replace").decode("ascii")
        print(response)
        sys.exit(0)

    # Demo usage (interactive mode)
    ai_demo = MockAIAssistant()

    print("=== Mock AI Assistant Demo ===\n")

    # Test various inputs
    test_inputs = [
        "Hello there!",
        "What can you help me with?",
        "What's the system status?",
        "Show me docker containers",
        "How's the network?",
    ]

    for demo_input in test_inputs:
        print(f"User: {demo_input}")
        demo_response = ai_demo.process_message(demo_input)
        demo_response = demo_response.encode("ascii", "replace").decode("ascii")
        print(f"AI: {demo_response}\n")
        time.sleep(0.5)

    print("\n=== Conversation History ===")
    for msg in ai_demo.get_history():
        print(f"[{msg['role']}] {msg['content'][:50]}...")
