#!/usr/bin/env python3
"""
Git Pre-Commit Hook for Litlab Player Project
Validates code quality and security before allowing commits.

Install:
    cp scripts/pre-commit.py .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
"""

import logging
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Tuple

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is not installed. Please run: pip install PyYAML")
    sys.exit(1)

# Colors for output - using them for direct terminal feedback
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"

# --- State --- #
HAS_ERRORS = False

# --- Helper Functions ---


def get_staged_files() -> List[str]:
    """Get a list of all staged files for the upcoming commit."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB"],
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8",
        )
        return result.stdout.strip().split("\n")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        logging.error("Failed to get staged files from Git: %s", e)
        # If we can't get staged files, we can't check them.
        # It is safer to exit non-zero to block the commit.
        raise SystemExit(1) from e


def run_check(name: str, check_func, *args) -> None:
    """Run a check function and print its status."""
    global HAS_ERRORS
    logging.info("Checking %s...", name)
    try:
        if check_func(*args):
            logging.info("  -> %sOK%s", GREEN, RESET)
        else:
            logging.error("  -> %sFAIL%s", RED, RESET)
            HAS_ERRORS = True
    except Exception as e:
        logging.error("  -> %sERROR%s: Check failed unexpectedly: %s", YELLOW, RESET, e)
        HAS_ERRORS = True


# --- Check Implementations ---


def check_env_files(staged_files: List[str]) -> bool:
    """Prevent committing .env files with secrets."""
    env_files = [f for f in staged_files if ".env" in f and ".env.example" not in f]

    if env_files:
        logging.error("Attempting to commit .env files with potential secrets:")
        for f in env_files:
            logging.error("  - %s", f)
        logging.info("Add to .gitignore and use .env.example as a template.")
        return False
    return True


def check_yaml_syntax(staged_files: List[str]) -> bool:
    """Validate YAML syntax in staged files."""
    yaml_files = [f for f in staged_files if f.endswith((".yaml", ".yml"))]
    issues = []

    for file_path in yaml_files:
        if not file_path or not Path(file_path).exists():
            continue
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                yaml.safe_load(f)
        except yaml.YAMLError as e:
            issues.append(f"{file_path}: {e}")

    if issues:
        logging.error("YAML syntax errors found:")
        for issue in issues:
            logging.error("  - %s", issue)
        return False
    return True


def check_python_syntax(staged_files: List[str]) -> bool:
    """Validate Python syntax in staged files."""
    py_files = [f for f in staged_files if f.endswith(".py")]
    issues = []

    for file_path in py_files:
        if not file_path or not Path(file_path).exists():
            continue
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                compile(f.read(), file_path, "exec")
        except SyntaxError as e:
            issues.append(f"{file_path}:{e.lineno}: {e.msg}")

    if issues:
        logging.error("Python syntax errors found:")
        for issue in issues:
            logging.error("  - %s", issue)
        return False
    return True


def check_secrets_in_code(staged_files: List[str]) -> bool:
    """Check for hardcoded secrets in code, ignoring common false positives."""
    # More specific patterns to reduce false positives
    secret_patterns: List[Tuple[str, str]] = [
        (
            r"(password|secret|token|api_key)\s*[:=]\s*['\"]([a-zA-Z0-9_\-]{16,})['\"]",
            "Hardcoded credential-like string",
        ),
        (r"-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----", "Private key"),
    ]
    issues = []

    for file_path in staged_files:
        # Skip files where secrets are expected or less likely
        if not Path(file_path).exists() or Path(file_path).suffix in (
            ".json",
            ".lock",
            ".md",
            ".txt",
        ):
            continue

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                for i, line in enumerate(f, 1):
                    # Ignore comments and example lines
                    stripped_line = line.strip()
                    if (
                        stripped_line.startswith(("#", "//", "*"))
                        or "example" in stripped_line.lower()
                    ):
                        continue

                    for pattern, desc in secret_patterns:
                        if re.search(pattern, stripped_line, re.IGNORECASE):
                            issues.append(f"{file_path}:{i}: {desc}")
        except (IOError, UnicodeDecodeError) as e:
            logging.warning(
                "Could not read file %s to check for secrets: %s", file_path, e
            )
            continue

    if issues:
        logging.error("Potential secrets detected in code:")
        for issue in issues[:15]:  # Show first 15
            logging.error("  - %s", issue)
        if len(issues) > 15:
            logging.error("  ... and %d more", len(issues) - 15)
        logging.info("Use environment variables or a secrets manager instead.")
        return False
    return True


# --- Main Execution ---


def main() -> int:
    """Run all pre-commit checks and exit with the appropriate status code."""
    logging.basicConfig(
        level=logging.INFO, format=f"{GREEN}[%(levelname)s]{RESET} %(message)s"
    )

    try:
        staged_files = get_staged_files()
        if not staged_files or staged_files == [""]:
            logging.info("No staged files to check. Skipping.")
            return 0
    except SystemExit as e:
        return e.code  # Propagate exit code from get_staged_files

    run_check(".env Files", check_env_files, staged_files)
    run_check("YAML Syntax", check_yaml_syntax, staged_files)
    run_check("Python Syntax", check_python_syntax, staged_files)
    run_check("Secrets in Code", check_secrets_in_code, staged_files)

    print()  # Add a newline for readability

    if HAS_ERRORS:
        logging.error("Pre-commit checks failed. Fix issues before committing.")
        logging.info("To bypass (not recommended): git commit --no-verify")
        return 1

    logging.info("All checks passed! Proceeding with commit.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
