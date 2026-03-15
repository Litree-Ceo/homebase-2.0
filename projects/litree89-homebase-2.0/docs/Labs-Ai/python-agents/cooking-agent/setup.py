#!/usr/bin/env python3
"""
Setup and installation helper for the Cooking AI Agent
Handles initial configuration and dependency installation
"""

import os
import sys
import subprocess
from pathlib import Path


def check_python_version():
    """Check if Python version is 3.10 or higher"""
    if sys.version_info < (3, 10):
        print(f"❌ Python 3.10+ required. Current: {sys.version_info.major}.{sys.version_info.minor}")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")


def check_venv():
    """Check if running in virtual environment"""
    if sys.prefix == sys.base_prefix:
        print("⚠️  Not running in a virtual environment")
        print("It's recommended to create one:")
        print("  python -m venv venv")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    else:
        print("✅ Virtual environment detected")


def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    print("Note: --pre flag is required for agent-framework-azure-ai\n")
    
    try:
        # Install from requirements.txt
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Dependencies installed")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        print("Try installing manually:")
        print("  pip install agent-framework-azure-ai --pre")
        print("  pip install python-dotenv aiohttp pydantic")
        sys.exit(1)


def setup_env_file():
    """Setup .env file"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return
    
    if env_example.exists():
        # Copy from example
        env_file.write_text(env_example.read_text())
        print("✅ Created .env from .env.example")
    else:
        # Create from scratch
        env_file.write_text("GITHUB_TOKEN=your_github_token_here\nDEBUG=false\n")
        print("✅ Created .env file")
    
    print("\n⚠️  Configure your .env file:")
    print("  1. Get GitHub token from: https://github.com/settings/tokens?type=beta")
    print("  2. Add your token to .env as: GITHUB_TOKEN=your_token_here")


def verify_setup():
    """Verify all setup is correct"""
    print("\n🔍 Verifying setup...")
    
    checks = {
        "Python version": check_python_version,
        "Virtual environment": check_venv,
        ".env file": lambda: None,  # Already checked
    }
    
    all_good = True
    
    # Check .env file
    env_file = Path(".env")
    if env_file.exists():
        content = env_file.read_text()
        if "your_github_token_here" in content:
            print("⚠️  GitHub token not configured in .env")
            all_good = False
        else:
            print("✅ .env file configured")
    else:
        print("❌ .env file not found")
        all_good = False
    
    return all_good


def main():
    """Main setup function"""
    print("=" * 60)
    print("🍳 Cooking AI Agent - Setup")
    print("=" * 60)
    
    # Check Python version
    check_python_version()
    
    # Check virtual environment
    check_venv()
    
    # Install dependencies
    install_dependencies()
    
    # Setup .env file
    setup_env_file()
    
    # Verify setup
    print()
    if verify_setup():
        print("\n✅ Setup complete! You're ready to run:")
        print("   python main.py")
    else:
        print("\n⚠️  Setup has warnings. Please configure .env file before running.")
        print("   See instructions above.")
    
    print("\n📖 For more information, see README.md")


if __name__ == "__main__":
    main()
