#!/usr/bin/env python3
"""
Module-level launcher wrapper - run from any module directory
Automatically finds and delegates to root launcher
Usage: python launcher.py [command] [args...]
       python launcher.py start
       python launcher.py --help
"""

import subprocess
import sys
from pathlib import Path


def find_root_dir() -> Path:
    """Find root directory by looking for .env.example or pyproject.toml"""
    current = Path.cwd()

    # Search up the directory tree
    for parent in [current, *current.parents]:
        if (parent / ".env.example").exists() or (parent / "pyproject.toml").exists():
            if (parent / "scripts" / "launcher.py").exists():
                return parent

    # Fallback: assume root is 2 levels up from modules/*
    if current.name in ("dashboard", "social", "grid"):
        return current.parent.parent

    # Last resort: current directory
    return current


def main():
    root_dir = find_root_dir()
    root_launcher = root_dir / "scripts" / "launcher.py"

    if not root_launcher.exists():
        print(f"ERROR: Root launcher not found at {root_launcher}")
        print(f"Searched from: {Path.cwd()}")
        print(f"Root directory detected: {root_dir}")
        sys.exit(1)

    # Run root launcher with all arguments
    cmd = [sys.executable, str(root_launcher), *sys.argv[1:]]
    result = subprocess.run(cmd, cwd=root_dir)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
