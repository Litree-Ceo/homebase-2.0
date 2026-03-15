#!/usr/bin/env python3
"""
Cross-platform launcher for Overlord Monolith.
Detects OS and invokes appropriate scripts with proper environment setup.
Usage: python launcher.py [module] [command] [--help]
"""

import os
import platform
import subprocess
import sys
from pathlib import Path


class OsDetector:
    """Detect OS and provide platform-specific utilities."""

    WINDOWS = "Windows"
    LINUX = "Linux"
    MACOS = "Darwin"

    @staticmethod
    def get_os() -> str:
        """Return OS name: 'Windows', 'Linux', or 'Darwin'."""
        return platform.system()

    @staticmethod
    def is_windows() -> bool:
        return OsDetector.get_os() == OsDetector.WINDOWS

    @staticmethod
    def is_linux() -> bool:
        return OsDetector.get_os() == OsDetector.LINUX

    @staticmethod
    def is_macos() -> bool:
        return OsDetector.get_os() == OsDetector.MACOS

    @staticmethod
    def is_unix() -> bool:
        return OsDetector.get_os() in (OsDetector.LINUX, OsDetector.MACOS)


class ScriptDispatcher:
    """Dispatch to OS-appropriate scripts."""

    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.os_type = OsDetector.get_os()
        self.project_name = "Overlord Monolith"

    def get_script_path(self, module: str, command: str) -> Path:
        """
        Find and return the appropriate script path.
        Prefers .ps1 on Windows, .sh on Unix.
        """
        scripts_dir = self.root_dir / "modules" / module

        if OsDetector.is_windows():
            script = scripts_dir / f"{command}.ps1"
            if script.exists():
                return script
        else:
            script = scripts_dir / f"{command}.sh"
            if script.exists():
                return script

        # Fallback to root scripts
        if OsDetector.is_windows():
            script = self.root_dir / f"{command}.ps1"
        else:
            script = self.root_dir / f"{command}.sh"

        if script.exists():
            return script

        return None

    def setup_environment(self):
        """
        Set up common environment variables.
        Validates .env prior to launch.
        """
        env_validator = self.root_dir / "scripts" / "validate-env.py"
        if env_validator.exists():
            result = subprocess.run(
                [sys.executable, str(env_validator)],
                cwd=self.root_dir,
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                print("Environment validation failed:")
                print(result.stdout)
                if result.stderr:
                    print("STDERR:", result.stderr)
                print()
                print("To fix: Copy .env.example to .env and update values")
                print("  cp .env.example .env")
                sys.exit(1)

        # Load .env manually
        env_file = self.root_dir / ".env"
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, value = line.split("=", 1)
                        os.environ[key.strip()] = value.strip()

        # Set PYTHONPATH for cross-platform import
        python_path = os.environ.get("PYTHONPATH", "")
        if not python_path:
            modules = [
                str(self.root_dir / "modules" / "dashboard"),
                str(self.root_dir / "modules" / "social"),
                str(self.root_dir / "modules" / "grid"),
            ]
            sep = ";" if OsDetector.is_windows() else ":"
            os.environ["PYTHONPATH"] = sep.join(modules)

    def execute(self, module: str, command: str, args: list):
        """Execute the appropriate script for the module and command."""
        script_path = self.get_script_path(module, command)

        if not script_path:
            print(f"ERROR: Script '{command}' not found for module '{module}'")
            print(f"  Searched: {self.root_dir}/modules/{module}/{command}.{{ps1|sh}}")
            print(f"  Searched: {self.root_dir}/{command}.{{ps1|sh}}")
            sys.exit(1)

        self.setup_environment()

        # Prepare command
        if OsDetector.is_windows():
            # PowerShell execution
            cmd = [
                "powershell",
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(script_path),
            ] + args
        else:
            # Bash execution
            cmd = ["bash", str(script_path)] + args

        print(f"[{self.project_name}] OS: {self.os_type}")
        print(f"[{self.project_name}] Executing: {' '.join(cmd)}")
        print("-" * 70)

        result = subprocess.run(cmd, cwd=self.root_dir)
        sys.exit(result.returncode)

    def show_help(self):
        """Display usage information."""
        print(
            f"""
{self.project_name} - Cross-Platform Launcher

USAGE:
  python launcher.py [module] [command] [args...]

MODULES:
  dashboard    Dashboard server and system monitoring
  social       Social module
  grid         Grid module
  (none)       Root-level scripts

COMMON COMMANDS:
  start        Start the module service
  stop         Stop the module service
  dev          Start in development mode with watch
  deploy       Deploy the module
  test         Run tests
  setup        Initial setup

EXAMPLES:
  python launcher.py dashboard start
  python launcher.py social dev
  python launcher.py deploy
  python launcher.py --help

NOTES:
  - On Windows, scripts should be .ps1 files
  - On Linux/macOS, scripts should be .sh files
  - Environment variables are loaded from .env
  - .env is validated before execution
"""
        )


def main():
    """Main entry point."""
    if not sys.argv[1:] or sys.argv[1] in ("--help", "-h", "help"):
        dispatcher = ScriptDispatcher()
        dispatcher.show_help()
        sys.exit(0)

    dispatcher = ScriptDispatcher()

    # Parse arguments: [module] [command] [args...]
    args = sys.argv[1:]

    # Check if first arg is a module (directory exists in modules/)
    first_arg = args[0] if args else None
    module_path = dispatcher.root_dir / "modules" / first_arg

    if first_arg and module_path.is_dir():
        # First arg is a module
        module = first_arg
        command = args[1] if len(args) > 1 else "start"
        remaining_args = args[2:] if len(args) > 2 else []
    else:
        # Root-level command
        module = None
        command = first_arg or "start"
        remaining_args = args[1:] if len(args) > 1 else []

    # Handle root commands differently
    if not module:
        script_path = dispatcher.root_dir / (
            f"{command}.ps1" if OsDetector.is_windows() else f"{command}.sh"
        )
        if not script_path.exists():
            print(f"ERROR: Root script '{command}' not found")
            sys.exit(1)
        dispatcher.execute("", command, remaining_args)
    else:
        dispatcher.execute(module, command, remaining_args)


if __name__ == "__main__":
    main()
