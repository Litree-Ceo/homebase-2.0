#!/usr/bin/env python3
"""Pull Ollama model for free agents"""

import urllib.request
import json
import sys

OLLAMA_HOST = "http://localhost:11434"
MODEL_NAME = "llama3.2"

def pull_model():
    """Pull a model from Ollama"""
    print(f"Pulling model: {MODEL_NAME}")
    print("This may take a few minutes for the first download...")
    
    url = f"{OLLAMA_HOST}/api/pull"
    payload = {"name": MODEL_NAME, "stream": True}
    
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=600) as resp:
            # Read streaming response
            while True:
                line = resp.readline()
                if not line:
                    break
                try:
                    data = json.loads(line.decode())
                    if "status" in data:
                        print(f"  {data.get('status', '')}")
                    if "error" in data:
                        print(f"  Error: {data['error']}")
                        return False
                except:
                    pass
        
        print(f"\n[OK] Model {MODEL_NAME} pulled successfully!")
        return True
        
    except Exception as e:
        print(f"[FAIL] Failed to pull model: {e}")
        return False

def check_models():
    """Check available models"""
    url = f"{OLLAMA_HOST}/api/tags"
    
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            models = data.get("models", [])
            print(f"Available models: {len(models)}")
            for m in models:
                print(f"  - {m.get('name', 'unknown')}")
            return models
    except Exception as e:
        print(f"Error checking models: {e}")
        return []

if __name__ == "__main__":
    print("=" * 50)
    print("OLLAMA MODEL PULL")
    print("=" * 50)
    
    # Check current models
    check_models()
    
    # Pull model
    pull_model()
    
    # Check again
    print("\nAfter pull:")
    check_models()