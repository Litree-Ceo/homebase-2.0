#!/usr/bin/env python3
"""
Git Pre-Commit Hook for Overlord Project
Validates code quality and security before allowing commits.

Install:
    cp scripts/pre-commit.py .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
"""

import re
import subprocess
import sys
from pathlib import Path

# Colors for output
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def log_info(msg):
    print(f"{GREEN}[INFO]{RESET} {msg}")


def log_warn(msg):
    print(f"{YELLOW}[WARN]{RESET} {msg}")


def log_error(msg):
    print(f"{RED}[ERROR]{RESET} {msg}")


def check_weak_api_keys():
    """Check for weak/default API keys in staged files."""
    weak_patterns = [
        r'api_key:\s*["\']?\d{4,}["\']?',  # Numeric keys like "1421"
        r'api_key:\s*["\']?password["\']?',  # Common weak values
        r'api_key:\s*["\']?admin["\']?',
        r'api_key:\s*["\']?test["\']?',
        r'api_key:\s*["\']?overlord-change-me["\']?',
        r'api_key:\s*["\']?[^"\']{1,31}["\']?',  # Keys shorter than 32 chars
    ]

    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"], capture_output=True, text=True
        )
        staged_files = result.stdout.strip().split("\n")

        issues = []
        for file in staged_files:
            if not file or not Path(file).exists():
                continue

            # Skip binary and large files
            if file.endswith((".png", ".jpg", ".gif", ".ico", ".db", ".log")):
                continue

            try:
                with open(file, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for i, line in enumerate(content.split("\n"), 1):
                        for pattern in weak_patterns:
                            if re.search(pattern, line, re.IGNORECASE):
                                # Check if it's actually a weak key (not a placeholder comment)
                                if (
                                    "change" in line.lower()
                                    or "example" in line.lower()
                                ):
                                    continue
                                if len(re.findall(r"[A-Za-z0-9_-]", line)) < 32:
                                    issues.append(f"{file}:{i}: Potential weak API key")
            except Exception:
                continue

        if issues:
            log_error("Weak API keys detected:")
            for issue in issues:
                log_error(f"  - {issue}")
            log_info("\nGenerate a strong key with:")
            log_info('  python -c "import secrets; print(secrets.token_urlsafe(32))"')
            return False

        return True
    except Exception as e:
        log_warn(f"Could not check for weak keys: {e}")
        return True


def check_env_files():
    """Prevent committing .env files with secrets."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"], capture_output=True, text=True
        )
        staged_files = result.stdout.strip().split("\n")

        env_files = [f for f in staged_files if ".env" in f and ".env.example" not in f]

        if env_files:
            log_error("Attempting to commit .env files with potential secrets:")
            for f in env_files:
                log_error(f"  - {f}")
            log_info("\nAdd to .gitignore and use .env.example as template.")
            return False

        return True
    except Exception as e:
        log_warn(f"Could not check for .env files: {e}")
        return True


def check_yaml_syntax():
    """Validate YAML syntax in staged files."""
    try:
        import yaml
    except ImportError:
        log_warn("PyYAML not installed, skipping YAML validation")
        return True

    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"], capture_output=True, text=True
        )
        staged_files = result.stdout.strip().split("\n")

        yaml_files = [f for f in staged_files if f.endswith((".yaml", ".yml"))]

        issues = []
        for file in yaml_files:
            if not file or not Path(file).exists():
                continue

            try:
                with open(file, "r", encoding="utf-8") as f:
                    yaml.safe_load(f)
            except yaml.YAMLError as e:
                issues.append(f"{file}: {e}")

        if issues:
            log_error("YAML syntax errors:")
            for issue in issues:
                log_error(f"  - {issue}")
            return False

        return True
    except Exception as e:
        log_warn(f"Could not validate YAML: {e}")
        return True


def check_python_syntax():
    """Validate Python syntax in staged files."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"], capture_output=True, text=True
        )
        staged_files = result.stdout.strip().split("\n")

        py_files = [f for f in staged_files if f.endswith(".py")]

        issues = []
        for file in py_files:
            if not file or not Path(file).exists():
                continue

            try:
                with open(file, "r", encoding="utf-8") as f:
                    compile(f.read(), file, "exec")
            except SyntaxError as e:
                issues.append(f"{file}:{e.lineno}: {e.msg}")

        if issues:
            log_error("Python syntax errors:")
            for issue in issues:
                log_error(f"  - {issue}")
            return False

        return True
    except Exception as e:
        log_warn(f"Could not validate Python: {e}")
        return True


def check_secrets_in_code():
    """Check for hardcoded secrets in code."""
    secret_patterns = [
        (r'password\s*=\s*["\'][^"\']+["\']', "Hardcoded password"),
        (r'secret\s*=\s*["\'][^"\']+["\']', "Hardcoded secret"),
        (r'token\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded token"),
        (r'api[_-]?key\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded API key"),
        (r"-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----", "Private key"),
    ]

    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"], capture_output=True, text=True
        )
        staged_files = result.stdout.strip().split("\n")

        issues = []
        for file in staged_files:
            if not file or not Path(file).exists():
                continue

            # Skip common non-code files
            if file.endswith((".md", ".txt", ".rst", ".json", ".lock")):
                continue

            try:
                with open(file, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for i, line in enumerate(content.split("\n"), 1):
                        for pattern, desc in secret_patterns:
                            if re.search(pattern, line, re.IGNORECASE):
                                # Skip comments and example lines
                                stripped = line.strip()
                                if stripped.startswith("#") or stripped.startswith(
                                    "//"
                                ):
                                    continue
                                if (
                                    "example" in line.lower()
                                    or "placeholder" in line.lower()
                                ):
                                    continue
                                issues.append(f"{file}:{i}: {desc}")
            except Exception:
                continue

        if issues:
            log_error("Potential secrets in code:")
            for issue in issues[:10]:  # Show first 10
                log_error(f"  - {issue}")
            if len(issues) > 10:
                log_error(f"  ... and {len(issues) - 10} more")
            log_info("\nUse environment variables or a secrets manager instead.")
            return False

        return True
    except Exception as e:
        log_warn(f"Could not check for secrets: {e}")
        return True


def main():
    """Run all pre-commit checks."""
    log_info("Running pre-commit checks...")

    checks = [
        ("Weak API Keys", check_weak_api_keys),
        (".env Files", check_env_files),
        ("YAML Syntax", check_yaml_syntax),
        ("Python Syntax", check_python_syntax),
        ("Secrets in Code", check_secrets_in_code),
    ]

    all_passed = True

    for name, check_func in checks:
        print(f"\n  Checking {name}...", end=" ")
        try:
            if check_func():
                print(f"{GREEN}✓{RESET}")
            else:
                print(f"{RED}✗{RESET}")
                all_passed = False
        except Exception as e:
            print(f"{YELLOW}⚠{RESET}")
            log_warn(f"Check failed: {e}")

    print()

    if all_passed:
        log_info("All checks passed! Proceeding with commit.")
        return 0
    else:
        log_error("Pre-commit checks failed. Fix issues before committing.")
        log_info("\nTo bypass (not recommended): git commit --no-verify")
        return 1


if __name__ == "__main__":
    sys.exit(main())
