#!/usr/bin/env python3
"""
Environment validation script.
Validates .env against env.schema.json and checks required variables.
Usage: python scripts/validate-env.py [--strict]
"""

import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Dict, List


def load_schemas() -> Dict:
    """Load environment schema."""
    schema_path = Path(__file__).parent.parent / "env.schema.json"
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error("Schema file not found: %s", schema_path)
        raise SystemExit(1)
    except json.JSONDecodeError as e:
        logging.error("Failed to parse schema file %s: %s", schema_path, e)
        raise SystemExit(1)


def load_env() -> Dict[str, str]:
    """Load .env file and environment variables as a single dict."""
    env_path = Path(__file__).parent.parent / ".env"
    env_vars = os.environ.copy()

    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, value = line.split("=", 1)
                        env_vars[key.strip()] = value.strip()
        except IOError as e:
            logging.error("Failed to read .env file at %s: %s", env_path, e)
            # Continue with just environment variables

    return env_vars


def validate_env(schema: Dict, env: Dict) -> List[str]:
    """Validate environment against schema. Returns list of errors."""
    errors = []

    # Check required fields
    for required_key in schema.get("required", []):
        if required_key not in env:
            errors.append(f"MISSING: Required variable '{required_key}' not set")

    # Validate property constraints
    for prop_name, prop_schema in schema.get("properties", {}).items():
        if prop_name not in env:
            continue

        value = env[prop_name]

        # Enum validation
        if "enum" in prop_schema and value not in prop_schema["enum"]:
            errors.append(
                f"INVALID: '{prop_name}' must be one of {prop_schema['enum']}, "
                f"got '{value}'"
            )

        # Type validation for integer
        if prop_schema.get("type") == "integer":
            try:
                int_val = int(value)
                if "minimum" in prop_schema and int_val < prop_schema["minimum"]:
                    errors.append(
                        f"INVALID: '{prop_name}' must be >= {prop_schema['minimum']}"
                    )
                if "maximum" in prop_schema and int_val > prop_schema["maximum"]:
                    errors.append(
                        f"INVALID: '{prop_name}' must be <= {prop_schema['maximum']}"
                    )
            except ValueError:
                errors.append(
                    f"INVALID: '{prop_name}' must be an integer, got '{value}'"
                )

        # Pattern validation (regex)
        if "pattern" in prop_schema and not re.match(prop_schema["pattern"], value):
            errors.append(
                f"INVALID: '{prop_name}' does not match pattern {prop_schema['pattern']}"
            )

    return errors


def main() -> int:
    """Validate environment and exit with appropriate code."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    try:
        schema = load_schemas()
        env = load_env()
        errors = validate_env(schema, env)

        if errors:
            logging.error("Environment Validation Failed:")
            logging.error("=" * 60)
            for error in errors:
                logging.error("  [X] %s", error)
            logging.error("=" * 60)
            logging.info("\nFix errors and try again, or run: cp .env.example .env")
            return 1

        logging.info("[OK] Environment validation passed")
        return 0
    except SystemExit as e:
        return e.code


if __name__ == "__main__":
    sys.exit(main())
