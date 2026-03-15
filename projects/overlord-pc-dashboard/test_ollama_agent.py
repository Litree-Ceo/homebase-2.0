#!/usr/bin/env python3
"""Test Ollama integration for free agents"""

import sys

# Add current directory to path
sys.path.insert(0, ".")

# Set up environment
import os

os.environ["OLLAMA_ENABLED"] = "true"
os.environ["OLLAMA_HOST"] = "http://localhost:11434"
os.environ["OLLAMA_MODEL"] = "llama3.2"

from agent_server import agent_process, call_ollama


def test_ollama_connection():
    """Test basic Ollama connection"""
    print("Testing Ollama connection...")

    messages = [{"role": "user", "content": "Say hello in one word"}]

    result = call_ollama(messages, max_tokens=50)

    if "content" in result:
        print(f"[OK] Ollama working! Response: {result['content'][:100]}...")
        return True
    else:
        print(f"[FAIL] Ollama failed: {result}")
        return False


def test_agent_with_ollama():
    """Test agent process with Ollama"""
    print("\nTesting agent with Ollama...")

    result = agent_process("What is 2+2? Answer briefly.")

    if "response" in result:
        print(f"✅ Agent working! Response: {result['response'][:100]}...")
        print(f"   Model used: {result.get('model', 'unknown')}")
        return True
    else:
        print(f"❌ Agent failed: {result}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("OLLAMA FREE AGENTS INTEGRATION TEST")
    print("=" * 50)

    success1 = test_ollama_connection()
    success2 = test_agent_with_ollama()

    print("\n" + "=" * 50)
    if success1 and success2:
        print("🎉 ALL TESTS PASSED - Ollama free agents ready!")
    else:
        print("⚠️  Some tests failed - check Ollama is running and has models")
    print("=" * 50)
