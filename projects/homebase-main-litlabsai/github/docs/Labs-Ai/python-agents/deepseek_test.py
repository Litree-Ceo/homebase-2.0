#!/usr/bin/env python3
"""
Quick test for DeepSeek integration (Python)
Run: python python-agents/deepseek_test.py
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from deepseek_client import DeepSeekClient, DeepSeekMessage


def main():
    print("🚀 DeepSeek Integration Test (Python)\n")

    # Initialize client (reads DEEPSEEK_API_KEY from env)
    try:
        client = DeepSeekClient()
        print("✓ DeepSeek client initialized\n")
    except RuntimeError as e:
        print(f"✗ Failed to initialize client: {e}")
        print("  Make sure DEEPSEEK_API_KEY is set in .env.local")
        return

    # Test 1: Simple chat
    print("--- Test 1: Simple Chat ---")
    try:
        response = client.simple_chat("Say hello in one sentence, briefly.")
        print(f"✓ Response: {response}")
    except Exception as e:
        print(f"✗ Failed: {e}")

    # Test 2: Code generation
    print("\n--- Test 2: Code Generation (Python) ---")
    try:
        code = client.generate_code(
            "Write a Python function that adds two numbers and returns the result",
            language="python",
        )
        print(f"✓ Generated code:\n{code}")
    except Exception as e:
        print(f"✗ Failed: {e}")

    # Test 3: Multi-turn conversation
    print("\n--- Test 3: Multi-turn Conversation ---")
    try:
        messages = [
            DeepSeekMessage("system", "You are a helpful assistant."),
            DeepSeekMessage("user", "What is 2+2?"),
        ]
        response = client.chat(messages)
        print(f"✓ Response: {response}")
    except Exception as e:
        print(f"✗ Failed: {e}")

    print("\n✓ All tests completed")


if __name__ == "__main__":
    main()
