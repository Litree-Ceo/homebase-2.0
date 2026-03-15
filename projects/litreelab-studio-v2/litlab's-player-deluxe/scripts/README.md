# Scripts Directory - Utilities & Maintenance

This directory contains automation scripts for project maintenance, deployment, and quality assurance.

## Core Launchers & Environment

### `launcher.py` - Cross-Platform Launcher
Unified entry point for running scripts across Windows (PowerShell) and Unix (Bash).

**Usage:**
```bash
# From ROOT directory (recommended)
python launcher.py dashboard start
python launcher.py social dev
python launcher.py deploy

# From a MODULE directory (automatic root detection!)
cd modules/social
python launcher.py social dev  # Works from any module!
```

**Module-Level Wrappers:**
Each module has its own launcher for convenience:
```bash
cd modules/social
python launcher.py social dev   # Python wrapper (finds root automatically)
bash launcher.sh social dev     # Bash wrapper (Unix/Linux/macOS)
.\launcher.ps1 social dev       # PowerShell wrapper (Windows)
```

Features:
- Auto-detects OS (Windows, Linux, macOS)
- Routes to `.ps1` (Windows) or `.sh` (Unix) scripts
- Validates environment before execution
- Manages PID files and state
- **Works from any directory** - module wrappers find root automatically

### `validate-env.py` - Environment Validation
Validates `.env` file against `env.schema.json` schema.

**Usage:**
```bash
python scripts/validate-env.py
python scripts/validate-env.py --strict  # Exit on warnings
```

Checks:
- Required variables present
- Type validation (string, integer, enum)
- Value constraints (min/max, regex)
- Port conflicts

---

## Linting & Code Quality

### `lint-all.sh` / `lint-all.ps1` - Unified Linter
Runs all linters (Python, Shell, YAML, JSON) across the project.

**Usage:**
```bash
# Check only
bash scripts/lint-all.sh

# Auto-fix formatting
bash scripts/lint-all.sh --fix

# PowerShell version
powershell -ExecutionPolicy Bypass -File scripts/lint-all.ps1 -Fix
```

Includes:
- **Python:** black (formatter), ruff (linter), pylint (optional)
- **Shell:** shellcheck (linter)
- **YAML:** yamllint
- **JSON:** json.tool validation

Configuration:
- `.pylintrc` - Python linting rules
- `.yamllint` - YAML validation rules

---

## Script Guards & Helpers

### `bash-guard.sh` - Bash Best Practices Template
Include this in all bash scripts for error handling and logging.

**Features:**
- `set -euo pipefail` - Strict error handling
- Logging functions: `log_info()`, `log_error()`, `log_warn()`
- Automatic PID management
- Cleanup on exit
- Cross-platform path handling

**Usage:**
```bash
#!/usr/bin/env bash
# Source the guard
source scripts/bash-guard.sh

# Now use logging
log_info "Starting..."
check_command "docker"
check_file "$CONFIG_FILE"

# Your script here
init_script
```

### `powershell-guard.ps1` - PowerShell Best Practices Template
Include this in all PowerShell scripts.

**Features:**
- `$ErrorActionPreference = "Stop"` - Strict error handling
- Logging functions: `Write-LogInfo()`, `Write-LogError()`
- PID file management
- Cleanup on exit

**Usage:**
```powershell
# Dot-source at top
. .\scripts\powershell-guard.ps1

# Use functions
Write-LogInfo "Starting service..."
Test-FilePath "C:\path\to\config"
```

---

## Deployment & Configuration

### `generate-services.py` - Service File Generator
Generates systemd units (Linux) and NSSM scripts (Windows) from `config/services.yaml`.

**Usage:**
```bash
python scripts/generate-services.py
python scripts/generate-services.py --output-dir ./services-generated
```

Generates:
- `{service-name}.service` - systemd unit files
- `install-{service-name}-windows.cmd` - NSSM installation scripts

Output in `generated/services/` (NOT committed to git).

**Config:** `config/services.yaml`
- Defines dashboard, social, grid services
- Specifies ports, environment variables, restart policies

---

## Security & Validation

### `validate-firebase-rules.sh` - Firebase Security Audit
Validates Firestore and Realtime Database rules for security issues.

**Usage:**
```bash
bash scripts/validate-firebase-rules.sh
```

Checks:
- Firestore permissions (avoid `allow read, write: true`)
- RTDB permissions (avoid `.write: true`)
- Authentication requirements
- JSON syntax validity

Recommendations:
- Require auth on all rules
- Use specific match patterns
- Test with Firebase Emulator

### `harden-ssh-tunnel.sh` - SSH Security Hardening
Hardens SSH configuration and sets up firewall rules.

**Usage:**
```bash
sudo bash scripts/harden-ssh-tunnel.sh
```

Changes:
- Disables root login
- Disables password auth (keys only)
- Restricts weak ciphers
- Enables Fail2Ban rate limiting
- Configures firewall (ufw/firewalld)

**Requires:** Linux + root privileges

---

## Pre-commit & CI/CD

### `pre-commit.py` - Pre-commit Hook
Validates code before committing (Python syntax, no secrets, file size).

**Setup:**
```bash
cp scripts/pre-commit.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Checks:
- Python syntax
- JSON validity
- No large files (>50MB)
- No obvious secrets (passwords, keys)

---

## CI/CD Workflows

Located in `.github/workflows/`:

### `lint-test-security.yml`
Runs on every push and PR. Includes:
- Linting (Python, shell, YAML)
- Testing (pytest on Python 3.9-3.12)
- Firebase rules validation
- Docker build validation
- Security scanning (Bandit, Safety)

### `deploy.yml`
Runs on push to `main`. Includes:
- Environment validation
- Firebase rules audit
- Test execution
- Docker build
- Deployment notification

---

## Configuration Files

### `.env.example` - Environment Template
Copy to `.env` and fill in your values. DO NOT commit `.env`.

```bash
cp .env.example .env
# Edit .env with your configuration
```

### `env.schema.json` - Environment Schema
JSON Schema defining all environment variables (types, constraints, defaults).

Used by:
- `validate-env.py`
- `launcher.py`
- CI/CD pipelines

---

## Quick Reference

| Task | Command |
|------|---------|
| Validate code | `bash scripts/lint-all.sh` |
| Auto-fix formatting | `bash scripts/lint-all.sh --fix` |
| Validate environment | `python scripts/validate-env.py` |
| Generate service files | `python scripts/generate-services.py` |
| Audit Firebase rules | `bash scripts/validate-firebase-rules.sh` |
| Harden SSH (Linux) | `sudo bash scripts/harden-ssh-tunnel.sh` |
| Start dashboard | `python launcher.py dashboard start` |
| Start social | `python launcher.py social dev` |
| Setup pre-commit | `cp scripts/pre-commit.py .git/hooks/pre-commit` |

---

## Troubleshooting

### Scripts fail on Windows
Ensure PowerShell execution policy allows scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Linter not installed
Install manually:
```bash
pip install black ruff pylint yamllint
```

### Pre-commit isn't running
Check it's executable:
```bash
chmod +x .git/hooks/pre-commit
```

### SSH hardening fails
Ensure you have root/sudo privileges and Linux OS

---

## Related Documentation

- [WEB-SECURITY-BASELINE.md](../docs/WEB-SECURITY-BASELINE.md) - API security checklist
- [config/services.yaml](../config/services.yaml) - Service configurations
- [env.schema.json](../env.schema.json) - Environment variable schema
- [.github/workflows/](../.github/workflows/) - CI/CD pipelines
