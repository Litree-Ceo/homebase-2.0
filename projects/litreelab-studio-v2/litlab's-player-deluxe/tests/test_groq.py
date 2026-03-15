#!/usr/bin/env python3
"""Quick Groq API test - CLI style"""
import os
import sys
from groq import Groq


def main():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("❌ Set GROQ_API_KEY env var first")
        sys.exit(1)

    client = Groq(api_key=api_key)

    # Simple chat loop
    print("🤖 Groq Chat (type 'exit' to quit)\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("exit", "quit"):
            break

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input},
            ],
        )
        print(f"AI: {response.choices[0].message.content}\n")


if __name__ == "__main__":
    main()
