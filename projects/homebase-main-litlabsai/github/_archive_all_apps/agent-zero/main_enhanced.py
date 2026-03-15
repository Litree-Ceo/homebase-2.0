#!/usr/bin/env python3
"""
Agent Zero Enhanced - A Trae-integrated development assistant
No external API dependencies - works offline with enhanced capabilities
"""

import os
import sys
import json
import time
import subprocess
import glob
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

class AgentState(Enum):
    """Agent states"""
    IDLE = "idle"
    THINKING = "thinking"
    PROCESSING = "processing"
    ERROR = "error"
    BUILDING = "building"
    ANALYZING = "analyzing"

class AgentZeroEnhanced:
    """Enhanced Agent Zero - A Trae-integrated development assistant"""
    
    def __init__(self, name: str = "Agent Zero Enhanced"):
        self.name = name
        self.state = AgentState.IDLE
        self.conversation_history = []
        self.capabilities = [
            "trae_integration", "code_analysis", "file_operations", 
            "build_system", "git_operations", "docker_management",
            "project_scanning", "dependency_analysis", "error_detection"
        ]
        self.start_time = datetime.now()
        self.project_root = "/workspace" if os.path.exists("/workspace") else os.getcwd()
        self.is_trae_environment = self.detect_trae_environment()
        self.project_type = "Unknown"  # Initialize project_type
        
        print(f"🚀 {self.name} Enhanced Starting...")
        print(f"📁 Project Root: {self.project_root}")
        print(f"🔧 Trae Environment: {'Yes' if self.is_trae_environment else 'No'}")
    
    def detect_trae_environment(self) -> bool:
        """Detect if running in Trae IDE environment"""
        trae_indicators = [
            "/.trae", "/opt/trae", "TRAE_", 
            os.path.exists("/.trae"),
            os.environ.get("TRAE_VERSION") is not None
        ]
        return any(trae_indicators)
    
    def initialize(self) -> bool:
        """Initialize the enhanced agent"""
        print(f"🤖 {self.name} Enhanced Initializing...")
        print(f"📅 Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⚡ Enhanced Capabilities: {', '.join(self.capabilities)}")
        
        # Set initial state
        self.state = AgentState.IDLE
        
        # Scan project structure
        self.scan_project()
        
        print("✅ Agent Zero Enhanced is ready!")
        print("=" * 60)
        
        return True
    
    def scan_project(self):
        """Scan the project structure"""
        print("🔍 Scanning project structure...")
        
        # Look for common project files
        project_files = {
            "package.json": "Node.js project detected",
            "requirements.txt": "Python project detected", 
            "Cargo.toml": "Rust project detected",
            "go.mod": "Go project detected",
            "pom.xml": "Maven project detected",
            "build.gradle": "Gradle project detected",
            "Dockerfile": "Docker project detected",
            "docker-compose.yml": "Docker Compose project detected",
            ".git": "Git repository detected"
        }
        
        self.project_type = "Unknown"
        for filename, description in project_files.items():
            if os.path.exists(os.path.join(self.project_root, filename)):
                print(f"📋 {description}")
                if filename in ["package.json", "requirements.txt", "Cargo.toml", "go.mod"]:
                    self.project_type = filename
                break
    
    def get_status(self) -> Dict:
        """Get enhanced agent status"""
        uptime = datetime.now() - self.start_time
        return {
            "name": self.name,
            "state": self.state.value,
            "uptime": str(uptime).split('.')[0],
            "messages_processed": len(self.conversation_history),
            "project_root": self.project_root,
            "project_type": self.project_type,
            "trae_environment": self.is_trae_environment,
            "capabilities": self.capabilities,
            "working_directory": os.getcwd()
        }
    
    def run_command(self, command: str, cwd: str = None) -> str:
        """Run shell commands with real-time output streaming"""
        try:
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=cwd or self.project_root,
                bufsize=1,  # Line buffered
                universal_newlines=True
            )
            
            output_lines = []
            start_time = time.time()
            
            while True:
                # Check for timeout
                if time.time() - start_time > 300:
                    process.terminate()
                    return "Error: Command timed out after 5 minutes"
                
                # Read from stdout
                line = process.stdout.readline()
                if line:
                    print(line.strip())  # Stream to console
                    output_lines.append(line.strip())
                
                # Check if process finished
                if process.poll() is not None:
                    break
            
            # Read any remaining output
            remaining = process.stdout.read()
            if remaining:
                print(remaining.strip())
                output_lines.append(remaining.strip())
            
            # Read stderr
            error = process.stderr.read()
            if process.returncode != 0:
                if error:
                    print(f"Error: {error.strip()}")
                return f"Error: {error.strip() or 'Command failed'}"
            
            return "\n".join(output_lines)
        except Exception as e:
            return f"Error: {str(e)}"
    
    def analyze_codebase(self) -> str:
        """Analyze the current codebase"""
        self.state = AgentState.ANALYZING
        
        analysis = []
        analysis.append("📊 Codebase Analysis:")
        
        # Count files by type
        file_counts = {}
        for root, dirs, files in os.walk("."):
            # Skip node_modules and other common ignore dirs
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext:
                    file_counts[ext] = file_counts.get(ext, 0) + 1
        
        if file_counts:
            analysis.append("File types found:")
            for ext, count in sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
                analysis.append(f"  {ext}: {count} files")
        
        # Check for build files
        build_files = ["package.json", "requirements.txt", "Makefile", "build.gradle", "pom.xml"]
        found_build_files = [f for f in build_files if os.path.exists(f)]
        if found_build_files:
            analysis.append(f"Build files: {', '.join(found_build_files)}")
        
        self.state = AgentState.IDLE
        return "\n".join(analysis)
    
    def build_project(self) -> str:
        """Build the current project"""
        self.state = AgentState.BUILDING
        
        if os.path.exists("package.json"):
            print("📦 Building Node.js project...")
            return self.run_command("npm run build")
        elif os.path.exists("requirements.txt"):
            print("🐍 Setting up Python environment...")
            return self.run_command("pip install -r requirements.txt")
        elif os.path.exists("Cargo.toml"):
            print("🦀 Building Rust project...")
            return self.run_command("cargo build")
        elif os.path.exists("go.mod"):
            print("🐹 Building Go project...")
            return self.run_command("go build")
        else:
            return "No build configuration found for this project type. Skipping build."
    
    def lint_code(self) -> str:
        """Run linting on the codebase"""
        if os.path.exists("package.json"):
            return self.run_command("npm run lint")
        elif os.path.exists("requirements.txt"):
            # Try to run flake8 or pylint
            result = self.run_command("python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics")
            if "Error:" in result:
                result = self.run_command("python -m pylint --errors-only *.py")
            return result
        else:
            return "No linting configuration found"
    
    def git_status(self) -> str:
        """Get git status"""
        if os.path.exists(".git"):
            return self.run_command("git status --porcelain")
        else:
            return "Not a git repository"
    
    def docker_status(self) -> str:
        """Check Docker status"""
        return self.run_command("docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'")

    def full_optimize(self) -> str:
        """Perform full project optimization using all capabilities"""
        self.state = AgentState.PROCESSING
        results = []
        
        # Project Scanning
        results.append("🔍 Project Scanning:")
        self.scan_project()
        results.append(f"Project Type: {self.project_type}")
        
        # Code Analysis
        results.append("\n📊 Code Analysis:")
        results.append(self.analyze_codebase())
        
        # Dependency Analysis
        results.append("\n📦 Dependency Analysis:")
        if self.project_type == "package.json":
            deps = self.run_command("npm list --depth=0")
        elif self.project_type == "requirements.txt":
            deps = self.run_command("pip list")
        else:
            deps = "No dependencies detected"
        results.append(deps)
        
        # Error Detection (Linting)
        results.append("\n🚨 Error Detection:")
        lint_result = self.lint_code()
        results.append(lint_result)
        
        # Build System
        results.append("\n🛠️ Build:")
        build_result = self.build_project()
        results.append(build_result)
        
        # Git Operations
        results.append("\n📝 Git Status:")
        git_result = self.git_status()
        results.append(git_result)
        
        # Docker Management
        results.append("\n🐳 Docker Status:")
        docker_result = self.docker_status()
        results.append(docker_result)
        
        # File Operations (example: list files)
        results.append("\n📁 File Operations:")
        files = self.run_command("ls -lah")
        results.append(files)
        
        # Trae Integration (if applicable)
        if self.is_trae_environment:
            results.append("\n💡 Trae Integration:")
            results.append("Trae environment detected - optimization complete")
        
        self.state = AgentState.IDLE
        return "\n".join(results)
    
    def generate_response(self, command: str) -> str:
        """Generate enhanced responses"""
        self.state = AgentState.THINKING
        
        try:
            command_lower = command.lower().strip()
            
            # Status and info commands
            if command_lower == "status":
                status = self.get_status()
                return f"""🤖 Agent Zero Enhanced Status:
📊 State: {status['state']}
⏱️  Uptime: {status['uptime']}
💬 Messages: {status['messages_processed']}
📁 Project: {status['project_type']}
🔧 Trae Mode: {status['trae_environment']}
📍 Location: {status['working_directory']}"""
            
            elif "hello" in command_lower or "hi" in command_lower:
                return f"""🤖 Hello! I'm {self.name}, your enhanced development assistant!

I'm designed to work seamlessly with Trae IDE and help you with:
🔧 Code analysis and building
📊 Project scanning and dependency management
🐳 Docker container management
📝 Git operations and version control
⚡ Development workflow optimization

Try these commands:
- 'analyze' - Analyze your codebase
- 'build' - Build your project
- 'lint' - Run code linting
- 'git status' - Check git status
- 'docker status' - Check Docker containers
- 'help' - See all available commands"""
            
            elif "help" in command_lower:
                return """🛠️  Agent Zero Enhanced Commands:

📊 Analysis:
- analyze / scan - Analyze codebase structure
- status - Show agent and project status

🔧 Development:
- build - Build the current project
- lint / check - Run code linting
- test - Run tests (if configured)

🗂️  Project Management:
- git status - Show git repository status
- docker status - Show Docker containers
- files / structure - Show project structure

🤖 Agent:
- hello / hi - Greeting
- capabilities - List enhanced capabilities
- history - Show conversation history
- clear - Clear history
- save <file> - Save conversation
- load <file> - Load conversation

💡 Try 'hello' to get started!"""
            
            elif "analyze" in command_lower or "scan" in command_lower:
                return self.analyze_codebase()
            
            elif "build" in command_lower:
                return self.build_project()
            
            elif "lint" in command_lower or "check" in command_lower:
                return self.lint_code()
            
            elif "git status" in command_lower:
                return self.git_status()
            
            elif "docker status" in command_lower:
                return self.docker_status()
            
            elif "optimize" in command_lower or "full_optimize" in command_lower:
                return self.full_optimize()
            
            elif "capabilities" in command_lower:
                return f"🛠️  Enhanced Capabilities:\n" + "\n".join(f"- {cap}" for cap in self.capabilities)
            
            elif "files" in command_lower or "structure" in command_lower:
                return self.run_command("find . -maxdepth 2 -type f -name '*.py' -o -name '*.js' -o -name '*.ts' -o -name '*.json' | head -20")
            
            elif command_lower.startswith("save "):
                filename = command[5:].strip()
                return self.save_conversation(filename)
            
            elif command_lower.startswith("load "):
                filename = command[5:].strip()
                return self.load_conversation(filename)
            
            elif "clear" in command_lower:
                self.conversation_history.clear()
                return "🗑️ Conversation history cleared."
            
            elif "history" in command_lower:
                if self.conversation_history:
                    return f"📜 Conversation history ({len(self.conversation_history)} messages):\n" + "\n".join(self.conversation_history[-10:])
                else:
                    return "📭 No conversation history yet."
            
            elif command_lower.startswith("run "):
                # Run custom commands
                cmd = command[4:].strip()
                return self.run_command(cmd)
            
            else:
                # Try to interpret as a development command
                return f"""🤔 I received: '{command}'

I'm in enhanced mode and can help with development tasks. Try:
- 'help' for available commands
- 'analyze' to scan your codebase
- 'build' to build your project
- 'hello' for an introduction

Or type 'run <command>' to execute shell commands."""
        
        except Exception as e:
            self.state = AgentState.ERROR
            return f"❌ Error processing command: {str(e)}"
        
        finally:
            self.state = AgentState.IDLE
    
    def process_command(self, command: str) -> str:
        """Process a command and add to history"""
        response = self.generate_response(command)
        
        # Add to conversation history
        self.conversation_history.append(f"User: {command}")
        self.conversation_history.append(f"Agent: {response}")
        
        return response
    
    def save_conversation(self, filename: str) -> str:
        """Save conversation history to file"""
        try:
            os.makedirs("data", exist_ok=True)
            filepath = os.path.join("data", filename)
            with open(filepath, 'w') as f:
                json.dump(self.conversation_history, f, indent=2)
            return f"💾 Conversation saved to {filepath}"
        except Exception as e:
            return f"❌ Error saving conversation: {str(e)}"
    
    def load_conversation(self, filename: str) -> str:
        """Load conversation history from file"""
        try:
            filepath = os.path.join("data", filename)
            with open(filepath, 'r') as f:
                self.conversation_history = json.load(f)
            return f"📂 Conversation loaded from {filepath} ({len(self.conversation_history)} messages)"
        except Exception as e:
            return f"❌ Error loading conversation: {str(e)}"
    
    def interactive_mode(self):
        """Run in interactive mode"""
        print("🚀 Agent Zero Enhanced Interactive Mode")
        print("💡 Enhanced for Trae IDE integration")
        print("Type 'help' for commands, 'exit' to quit")
        print("-" * 60)
        
        while True:
            try:
                user_input = input("🧑‍💻 You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ["exit", "quit", "bye"]:
                    print("👋 Agent Zero: Goodbye! Happy coding!")
                    break
                
                response = self.process_command(user_input)
                print(f"🤖 Agent Zero: {response}")
                print()  # Add spacing
                
            except KeyboardInterrupt:
                print("\n👋 Agent Zero: Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

def main():
    """Main function to run Agent Zero Enhanced"""
    print("🚀 Starting Agent Zero Enhanced...")
    
    # Create and initialize the enhanced agent
    agent = AgentZeroEnhanced()
    
    if not agent.initialize():
        print("❌ Failed to initialize Agent Zero Enhanced")
        return 1
    
    # Check if we're in a Docker container or running interactively
    if os.getenv("AGENT_ZERO_INTERACTIVE", "true").lower() == "true":
        agent.interactive_mode()
    else:
        # Run in daemon mode with enhanced features
        print("🔧 Running in enhanced daemon mode...")
        print(agent.process_command("hello"))
        print(agent.process_command("status"))
        
        print("🤖 Agent Zero Enhanced is monitoring your development environment...")
        try:
            while True:
                time.sleep(60)
                # Could add file watching, build monitoring, etc. here
        except KeyboardInterrupt:
            print("👋 Agent Zero Enhanced shutting down.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())