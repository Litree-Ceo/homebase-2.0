#!/usr/bin/env python3
"""
Service file generator for cross-platform deployment.
Generates systemd units (Linux) and Windows service configs from services.yaml
Usage: python scripts/generate-services.py [--output-dir OUTPUT]
"""

import os
import sys
from pathlib import Path
from typing import Dict

import yaml


class ServiceGenerator:
    """Generate platform-specific service files."""

    def __init__(self, config_path: Path, output_dir: Path):
        self.config_path = config_path
        self.output_dir = output_dir
        self.config = self._load_config()
        self.env = os.environ.copy()
        self._set_defaults()

    def _load_config(self) -> Dict:
        """Load services.yaml configuration."""
        with open(self.config_path, "r") as f:
            return yaml.safe_load(f)

    def _set_defaults(self):
        """Set environment variable defaults."""
        script_dir = Path(__file__).parent
        root_dir = script_dir.parent

        defaults = {
            "ROOT_DIR": str(root_dir),
            "PYTHON_BIN": "python3",
            "NODE_BIN": "node",
            "NODE_ENV": "development",
            "LOG_LEVEL": "INFO",
            "DASHBOARD_PORT": "5000",
            "SOCIAL_PORT": "5001",
            "GRID_PORT": "5002",
            "SERVICE_USER": "overlord",
            "SERVICE_GROUP": "overlord",
        }

        for key, value in defaults.items():
            if key not in self.env:
                self.env[key] = value

    def _substitute_vars(self, template: str) -> str:
        """Substitute ${VAR} placeholders in template."""
        for key, value in self.env.items():
            template = template.replace(f"${{{key}}}", value)
        return template

    def generate_systemd(self, service_name: str, config: Dict) -> str:
        """Generate systemd unit file."""
        template = f"""[Unit]
Description={config.get('description', service_name)}
After={','.join(config.get('systemd_after', ['network-online.target']))}
Wants={config.get('wants', 'network-online.target')}

[Service]
Type={config.get('type', 'simple')}
User={config.get('user', 'overlord')}
Group={config.get('group', 'overlord')}
WorkingDirectory={config.get('working_directory')}
ExecStart={config.get('executable')} {' '.join(config.get('arguments', []))}
Restart={config.get('restart_policy', 'on-failure')}
RestartSec={config.get('restart_sec', 10)}

"""

        # Add environment variables
        for env_var in config.get("environment", []):
            template += f'Environment="{env_var}"\n'

        template += """
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
        return self._substitute_vars(template)

    def generate_windows_nssm(self, service_name: str, config: Dict) -> str:
        """Generate NSSM installation commands for Windows."""
        exe = config.get("executable")
        args = " ".join(config.get("arguments", []))
        work_dir = config.get("working_directory")

        commands = f"""# NSSM Service Installation for {service_name}
# Requires: nssm (Non-Sucking Service Manager)
# Install nssm: choco install nssm -y

# Install service
nssm install {service_name} {exe} {args}

# Configure service
nssm set {service_name} AppDirectory {work_dir}
nssm set {service_name} AppExit Default Restart
nssm set {service_name} AppRestartDelay {config.get('restart_sec', 10) * 1000}

# Environment variables
"""

        for env_var in config.get("environment", []):
            commands += f"nssm set {service_name} AppEnvironmentExtra {env_var}\n"

        commands += f"""
# Logging
nssm set {service_name} AppStdout logs\\{service_name}.log
nssm set {service_name} AppStderr logs\\{service_name}.log
nssm set {service_name} AppRotateFiles 1
nssm set {service_name} AppRotateOnline 1
nssm set {service_name} AppRotateBytes 10485760

# Start service
nssm start {service_name}
nssm status {service_name}
"""
        return self._substitute_vars(commands)

    def generate(self):
        """Generate all service files."""
        if not self.output_dir.exists():
            self.output_dir.mkdir(parents=True, exist_ok=True)

        for service_name, service_config in self.config.get("services", {}).items():
            print(f"Generating {service_name}...")

            # Generate systemd unit
            systemd_file = self.output_dir / f"{service_name}.service"
            with open(systemd_file, "w") as f:
                f.write(self.generate_systemd(service_name, service_config))
            print(f"  ✓ {systemd_file}")

            # Generate Windows NSSM script
            nssm_file = self.output_dir / f"install-{service_name}-windows.cmd"
            with open(nssm_file, "w") as f:
                f.write(self.generate_windows_nssm(service_name, service_config))
            print(f"  ✓ {nssm_file}")

        print("\n✓ Service files generated successfully")
        print(f"  Output directory: {self.output_dir}")
        print("\nNote: Generated service files are NOT committed to git.")
        print("      Commit config/services.yaml instead and regenerate as needed.")


def main():
    config_file = Path(__file__).parent.parent / "config" / "services.yaml"
    output_dir = Path(__file__).parent.parent / "generated" / "services"

    if not config_file.exists():
        print(f"ERROR: Config file not found: {config_file}")
        sys.exit(1)

    generator = ServiceGenerator(config_file, output_dir)
    generator.generate()


if __name__ == "__main__":
    main()
