# Overlord Monolith - Documentation Index

Welcome to the Overlord Monolith documentation. This is your guide to the project structure, setup, and operations.

## 🚀 Quick Start

**New to the project?** Start here:
1. [Initial Setup Guide](#setup) - Set up your development environment
2. [Environment Configuration](#environment) - Configure `.env`
3. [Project Structure](#structure) - Understand module layouts

### ✨ Key Feature: Run from Anywhere!
All scripts work from **any directory** - root or module subdirectory. Use the module launchers:
```bash
cd modules/social
python launcher.py dashboard start   # Finds root automatically!
bash launcher.sh social dev          # Unix support
.\launcher.ps1 social dev            # Windows support
```
See [scripts/README.md](scripts/README.md) and [QUICK-REFERENCE.md](../QUICK-REFERENCE.md) for examples.

## 📚 Documentation by Topic

### Setup & Deployment {#setup}

| Document | Purpose |
|----------|---------|
| [scripts/README.md](scripts/README.md) | **START HERE** - Guide to all automation scripts |
| [QUICK-START.md](QUICK-START.md) | Step-by-step initial setup |
| [modules/dashboard/README.md](modules/dashboard/README.md) | Dashboard module setup |
| [modules/social/README.md](modules/social/README.md) | Social module setup |
| [modules/grid/README.md](modules/grid/README.md) | Grid module setup |

### Environment & Configuration {#environment}

| Document | Purpose |
|----------|---------|
| [.env.example](.env.example) | Copy to `.env` and customize |
| [env.schema.json](env.schema.json) | Schema for all environment variables |
| [config/services.yaml](config/services.yaml) | Service definitions (dashboard, social, grid) |

### Project Structure {#structure}

```
Overlord-Monolith/
├── modules/                  # Application modules
│   ├── dashboard/           # Dashboard server (Python/Flask)
│   ├── social/              # Social module (Node.js)
│   └── grid/                # Grid module
├── scripts/                 # Automation & maintenance tools
│   ├── launcher.py          # Cross-platform entry point
│   ├── validate-env.py      # Environment validation
│   ├── lint-all.sh/.ps1     # Unified linter
│   ├── generate-services.py # Service file generator
│   ├── validate-firebase-rules.sh
│   └── harden-ssh-tunnel.sh # SSH security hardening
├── config/                  # Configuration sources
│   └── services.yaml        # Service definitions
├── docs/                    # Documentation
│   └── WEB-SECURITY-BASELINE.md  # API security checklist
├── .github/workflows/       # CI/CD pipelines
│   ├── lint-test-security.yml
│   └── deploy.yml
├── .env.example             # Environment template
├── env.schema.json          # Environment schema
├── requirements.txt         # Python dependencies (pinned)
├── pyproject.toml          # Python project config
├── docker-compose.yml      # Local dev stack
└── README.md               # This project's main README
```

### Security & Compliance

| Document | Purpose |
|----------|---------|
| [docs/WEB-SECURITY-BASELINE.md](docs/WEB-SECURITY-BASELINE.md) | **API security checklist** - Auth, CORS, rate limiting, input validation |
| [DEPLOYMENT.md](modules/dashboard/DEPLOYMENT.md) | Deployment procedures |
| [FIREBASE-SETUP.md](modules/dashboard/FIREBASE-SETUP.md) | Firebase configuration |
| [scripts/validate-firebase-rules.sh](scripts/validate-firebase-rules.sh) | Audit Firebase permissions |
| [scripts/harden-ssh-tunnel.sh](scripts/harden-ssh-tunnel.sh) | SSH hardening (Linux) |

### Operations & Troubleshooting

| Document | Purpose |
|----------|---------|
| [OPTIMIZATION-GUIDE.md](modules/dashboard/OPTIMIZATION-GUIDE.md) | Performance tuning |
| [REMOTE-ACCESS-GUIDE.md](modules/dashboard/REMOTE-ACCESS-GUIDE.md) | Setting up remote access |
| [TUNNEL-INSTRUCTIONS.md](modules/dashboard/TUNNEL-INSTRUCTIONS.md) | SSH tunnel setup |

---

## 🔧 Common Tasks

### Starting the Project

```bash
# Option 1: Cross-platform launcher (recommended)
python launcher.py dashboard start
python launcher.py social dev
python launcher.py grid start

# Option 2: OS-specific scripts
bash modules/dashboard/start-all-servers.sh    # Linux/macOS
powershell -ExecutionPolicy Bypass -File modules\dashboard\start-all.ps1  # Windows
```

### Code Quality

```bash
# Lint all code
bash scripts/lint-all.sh

# Auto-fix formatting
bash scripts/lint-all.sh --fix

# Validate environment
python scripts/validate-env.py --strict

# Security audit (Firebase)
bash scripts/validate-firebase-rules.sh
```

### Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env  # or use your editor

# Validate configuration
python scripts/validate-env.py
```

### Deployment

```bash
# Generate service files (systemd/Windows)
python scripts/generate-services.py

# Deploy to production
# (Runs via CI/CD on push to main)
```

### Security

```bash
# Harden SSH (Linux only, requires root)
sudo bash scripts/harden-ssh-tunnel.sh

# Install pre-commit hooks
cp scripts/pre-commit.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 📋 Environment Variables

All environment variables are defined in `env.schema.json`. Key variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Application environment | `development`, `staging`, `production` |
| `LOG_LEVEL` | Logging verbosity | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `DASHBOARD_PORT` | Dashboard server port | `5000` |
| `SOCIAL_PORT` | Social module port | `5001` |
| `GRID_PORT` | Grid module port | `5002` |
| `FIREBASE_PROJECT_ID` | Firebase project | Your project ID |
| `ALLOWED_CORS_ORIGINS` | CORS whitelist | `http://localhost:5000,http://localhost:5001` |
| `SSH_KEY_PATH` | SSH private key | `~/.ssh/id_rsa` |
| `TUNNEL_HOST` | Tunnel server | Your server hostname |

See [.env.example](.env.example) for all variables and defaults.

---

## 🔒 Security Checklist

Before deploying, ensure:

### Code Quality
- [ ] Run `scripts/lint-all.sh` and fix issues
- [ ] Run tests: `pytest tests/`
- [ ] Check for secrets: `scripts/pre-commit.py`

### Web Modules (Dashboard, Social, Grid)
- [ ] Follow [WEB-SECURITY-BASELINE.md](docs/WEB-SECURITY-BASELINE.md)
- [ ] All endpoints require authentication
- [ ] CORS properly configured (NOT `*` in production)
- [ ] Rate limiting enabled
- [ ] Input validation implemented

### Firebase
- [ ] Run `scripts/validate-firebase-rules.sh`
- [ ] Rules require `request.auth != null`
- [ ] User data isolated to own documents
- [ ] Admin operations require custom claims

### Deployment
- [ ] `.env` created from `.env.example` (NOT committed)
- [ ] Secrets stored in `.env`, NOT in code
- [ ] SSH keys with proper permissions (`600`)
- [ ] Firewall rules configured
- [ ] Monitoring/logging enabled

### Database & Secrets
- [ ] Firebase key file NOT in git (in `.gitignore`)
- [ ] API keys in `.env` only
- [ ] Database backups configured
- [ ] Password hashing enabled (bcrypt/argon2)

---

## 🚨 Troubleshooting

### Scripts fail on Windows
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Linters not available
```bash
pip install black ruff pylint yamllint shellcheck-py
```

### Environment validation fails
```bash
cp .env.example .env
# Edit .env with correct values
python scripts/validate-env.py
```

### Docker issues
```bash
docker-compose config   # Validate compose file
docker-compose up --build  # Rebuild images
```

### SSH connection issues
See [scripts/harden-ssh-tunnel.sh](scripts/harden-ssh-tunnel.sh) for hardening steps.

---

## 📞 Support Resources

- **Module READMEs:** Read the README in each module's directory
- **Scripts Guide:** [scripts/README.md](scripts/README.md)
- **Security:** [WEB-SECURITY-BASELINE.md](docs/WEB-SECURITY-BASELINE.md)
- **Firebase:** [FIREBASE-SETUP.md](modules/dashboard/FIREBASE-SETUP.md)
- **Remote Access:** [REMOTE-ACCESS-GUIDE.md](modules/dashboard/REMOTE-ACCESS-GUIDE.md)

---

## 🔄 CI/CD Pipelines

Automated checks run on every push:

| Pipeline | Trigger | Checks |
|----------|---------|--------|
| **Lint & Test** | Push/PR | Linting, unit tests, security scans |
| **Deploy** | Push to `main` | Validation + deployment |

View workflows in [.github/workflows/](.github/workflows/)

---

## 📦 Dependencies

- **Python:** 3.9+ (see [requirements.txt](requirements.txt))
- **Node.js:** 16+ (for social module)
- **Docker:** 20.10+ (optional, for containerized deployments)
- **Git:** 2.25+ (for version control)

Install Python dependencies:
```bash
pip install -r requirements.txt
```

---

## 📝 Contributing

1. Create a branch: `git checkout -b feature/something`
2. Make changes and test locally
3. Run linters: `bash scripts/lint-all.sh --fix`
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/something`
6. Open a pull request

Pre-commit hooks will help catch issues before you commit.

---

## 📄 License

See LICENSE file (if available) or check with project owner.

---

**Last updated:** March 2026
**Version:** 1.0.0

For questions or issues, consult the relevant module README or security baseline document.
