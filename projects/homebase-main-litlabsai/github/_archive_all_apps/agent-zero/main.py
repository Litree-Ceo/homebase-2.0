#!/usr/bin/env python3
"""
Agent Zero - A versatile AI agent with multiple capabilities
"""

import os
import sys
import json
import time
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum

# Try to import AI libraries, but don't fail if they're not available
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import google.generativeai as genai
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

class AgentState(Enum):
    """Agent states"""
    IDLE = "idle"
    THINKING = "thinking"
    PROCESSING = "processing"
    ERROR = "error"

class AgentZero:
    """Agent Zero - A versatile AI agent"""
    
    def __init__(self, name: str = "Agent Zero"):
        self.name = name
        self.state = AgentState.IDLE
        self.conversation_history = []
        self.capabilities = [
            "conversation", "task_planning", "code_analysis", 
            "file_operations", "system_monitoring"
        ]
        self.start_time = datetime.now()
        
        # Initialize AI providers
        self.initialize_ai_providers()
    
    def initialize_ai_providers(self):
        """Initialize AI providers"""
        global GOOGLE_AVAILABLE
        
        # OpenAI
        if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            print("✅ OpenAI initialized")
        
        # Anthropic
        if ANTHROPIC_AVAILABLE and os.getenv("ANTHROPIC_API_KEY"):
            self.anthropic_client = anthropic.Anthropic(
                api_key=os.getenv("ANTHROPIC_API_KEY")
            )
            print("✅ Anthropic initialized")
        
        # Google
        if GOOGLE_AVAILABLE and os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"):
            try:
                genai.configure(api_key=os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"))
                self.google_model = genai.GenerativeModel('gemini-pro')
                print("✅ Google AI initialized")
            except Exception as e:
                print(f"⚠️  Google AI initialization failed: {e}")
                GOOGLE_AVAILABLE = False
    
    def initialize(self) -> bool:
        """Initialize the agent"""
        print(f"🤖 {self.name} Initializing...")
        print(f"📅 Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⚡ Capabilities: {', '.join(self.capabilities)}")
        
        # Set initial state
        self.state = AgentState.IDLE
        
        print("✅ Agent Zero is ready!")
        print("=" * 50)
        
        return True
    
    def get_status(self) -> Dict:
        """Get agent status"""
        uptime = datetime.now() - self.start_time
        return {
            "name": self.name,
            "state": self.state.value,
            "uptime": str(uptime).split('.')[0],
            "messages_processed": len(self.conversation_history),
            "capabilities": self.capabilities,
            "ai_providers": {
                "openai": OPENAI_AVAILABLE and bool(os.getenv("OPENAI_API_KEY")),
                "anthropic": ANTHROPIC_AVAILABLE and bool(os.getenv("ANTHROPIC_API_KEY")),
                "google": GOOGLE_AVAILABLE and bool(os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"))
            }
        }
    
    def generate_response(self, command: str) -> str:
        """Generate a response to a command"""
        self.state = AgentState.THINKING
        
        try:
            # Simple demo responses
            if "status" in command.lower():
                status = self.get_status()
                uptime = datetime.now() - self.start_time
                return f"Agent Zero Status:\n- State: {status['state']}\n- Uptime: {str(uptime).split('.')[0]}\n- Messages: {status['messages_processed']}\n- AI Providers: {status['ai_providers']}"
            
            elif "hello" in command.lower() or "hi" in command.lower():
                return f"Hello! I'm {self.name}, your AI assistant. I'm currently running in demo mode without external AI providers, but I can still help with basic tasks and system operations."
            
            elif "help" in command.lower():
                return f"Available commands:\n- status: Show agent status\n- hello: Greeting\n- help: Show this help\n- capabilities: List my capabilities\n- history: Show conversation history\n- save <file>: Save conversation to file\n- load <file>: Load conversation from file\n- clear: Clear conversation history\n- exit/quit: Exit the agent"
            
            elif "capabilities" in command.lower():
                return f"My capabilities include:\n- {chr(10).join('- ' + cap for cap in self.capabilities)}"
            
            elif "history" in command.lower():
                if self.conversation_history:
                    return f"Conversation history ({len(self.conversation_history)} messages):\n" + "\n".join(self.conversation_history[-10:]) # Last 10
                else:
                    return "No conversation history yet."
            
            elif command.lower().startswith("save "):
                filename = command[5:].strip()
                return self.save_conversation(filename)
            
            elif command.lower().startswith("load "):
                filename = command[5:].strip()
                return self.load_conversation(filename)
            
            elif "clear" in command.lower():
                self.conversation_history.clear()
                return "Conversation history cleared."
            
            else:
                # Default response
                return f"I received your command: '{command}'. I'm running in demo mode, so I can't process complex requests right now. Try 'help' to see what I can do."
        
        except Exception as e:
            self.state = AgentState.ERROR
            return f"Error processing command: {str(e)}"
        
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
            return f"Conversation saved to {filepath}"
        except Exception as e:
            return f"Error saving conversation: {str(e)}"
    
    def load_conversation(self, filename: str) -> str:
        """Load conversation history from file"""
        try:
            filepath = os.path.join("data", filename)
            with open(filepath, 'r') as f:
                self.conversation_history = json.load(f)
            return f"Conversation loaded from {filepath} ({len(self.conversation_history)} messages)"
        except Exception as e:
            return f"Error loading conversation: {str(e)}"
    
    def interactive_mode(self):
        """Run in interactive mode"""
        print("🤖 Agent Zero Interactive Mode")
        print("Type 'help' for available commands, 'exit' to quit")
        print("-" * 50)
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ["exit", "quit", "bye"]:
                    print("Agent Zero: Goodbye!")
                    break
                
                response = self.process_command(user_input)
                print(f"Agent Zero: {response}")
                
            except KeyboardInterrupt:
                print("\nAgent Zero: Goodbye!")
                break
            except Exception as e:
                print(f"Error: {e}")

def main():
    """Main function to run Agent Zero"""
    print("🚀 Starting Agent Zero...")
    
    # Create and initialize the agent
    agent = AgentZero()
    
    if not agent.initialize():
        print("❌ Failed to initialize Agent Zero")
        return 1
    
    # Check if we're in a Docker container or running interactively
    if os.getenv("AGENT_ZERO_INTERACTIVE", "true").lower() == "true":
        agent.interactive_mode()
    else:
        # Run in daemon mode (keep alive)
        print("Running in non-interactive daemon mode...")
        print(agent.process_command("status"))
        print(agent.process_command("hello"))
        
        print("Agent Zero is listening for events (Daemon mode)...")
        try:
            while True:
                time.sleep(60)
                # Here we could check for file-based commands or other triggers
        except KeyboardInterrupt:
            print("Agent Zero shutting down.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())