#!/usr/bin/env python3
"""
Service file generator for cross-platform deployment.
Generates systemd units (Linux) and Windows service configs from services.yaml
Usage: python scripts/generate-services.py [--output-dir OUTPUT]
"""

import logging
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
        try:
            with open(self.config_path, "r", encoding="utf-8") as config_file_handle:
                return yaml.safe_load(config_file_handle)
        except (IOError, yaml.YAMLError) as e:
            logging.error("Failed to load or parse config %s: %s", self.config_path, e)
            raise SystemExit(1) from e

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
        if "environment" in config:
            env_vars = "\n".join(
                [f'Environment="{env_var}"' for env_var in config["environment"]]
            )
            template += f"{env_vars}\n"

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
nssm install {service_name} "{exe}" "{args}"

# Configure service
nssm set {service_name} AppDirectory "{work_dir}"
nssm set {service_name} AppExit Default Restart
nssm set {service_name} AppRestartDelay {config.get('restart_sec', 10) * 1000}
"""

        # Environment variables
        if "environment" in config:
            env_vars = " ".join(config["environment"])
            commands += f'nssm set {service_name} AppEnvironmentExtra "{env_vars}"\n'

        commands += f"""
# Logging
nssm set {service_name} AppStdout "logs\\{service_name}.log"
nssm set {service_name} AppStderr "logs\\{service_name}.log"
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
            logging.info("Created output directory: %s", self.output_dir)

        for service_name, service_config in self.config.get("services", {}).items():
            logging.info("Generating %s...", service_name)

            # Generate systemd unit
            systemd_file = self.output_dir / f"{service_name}.service"
            try:
                with open(systemd_file, "w", encoding="utf-8") as service_file:
                    service_file.write(
                        self.generate_systemd(service_name, service_config)
                    )
                logging.info("  ✓ %s", systemd_file)
            except IOError as e:
                logging.error("  ✗ Failed to write %s: %s", systemd_file, e)

            # Generate Windows NSSM script
            nssm_file = self.output_dir / f"install-{service_name}-windows.cmd"
            try:
                with open(nssm_file, "w", encoding="utf-8") as nssm_script_file:
                    nssm_script_file.write(
                        self.generate_windows_nssm(service_name, service_config)
                    )
                logging.info("  ✓ %s", nssm_file)
            except IOError as e:
                logging.error("  ✗ Failed to write %s: %s", nssm_file, e)

        logging.info("\n✓ Service files generated successfully")
        logging.info("  Output directory: %s", self.output_dir)
        logging.info("\nNote: Generated service files are NOT committed to git.")
        logging.info(
            "      Commit config/services.yaml instead and regenerate as needed."
        )


def main():
    """Parse arguments and run the service generator."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    config_file = Path(__file__).parent.parent / "config" / "services.yaml"
    output_dir = Path(__file__).parent.parent / "generated" / "services"

    if not config_file.exists():
        logging.error("Config file not found: %s", config_file)
        raise SystemExit(1)

    generator = ServiceGenerator(config_file, output_dir)
    generator.generate()


if __name__ == "__main__":
    main()
