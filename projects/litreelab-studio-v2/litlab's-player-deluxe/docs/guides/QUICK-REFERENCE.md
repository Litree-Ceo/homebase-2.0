# Quick Reference - Essential Commands

Save this for quick access. Print it or bookmark it!

## 🚀 Getting Started

```bash
# From ROOT directory (recommended)
cd c:\Users\litre\Desktop\Overlord-Monolith

# Copy environment template
cp .env.example .env
# Edit with your values (use notepad .env or your editor)

# Validate environment
python scripts/validate-env.py

# Generate service files
python scripts/generate-services.py

# Install pre-commit hooks
cp scripts/pre-commit.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit  # (on Linux/macOS only)
```

**Working from a module directory?** Use the module wrapper:
```bash
# From modules/social (or any module)
cd c:\Users\litre\Desktop\Overlord-Monolith\modules\social

# PowerShell
.\launcher.ps1 dashboard start
.\launcher.ps1 social dev
.\launcher.ps1 --help

# Bash (Linux/macOS)
bash launcher.sh dashboard start
bash launcher.sh social dev
```

## 🏃 Running Services

```bash
# From ROOT directory (recommended)
cd c:\Users\litre\Desktop\Overlord-Monolith

# Using launcher
python launcher.py dashboard start     # Start dashboard
python launcher.py social dev          # Start social in dev mode
python launcher.py grid start          # Start grid module
python launcher.py --help              # See all options

# From MODULE directory, use wrapper
cd modules/social
python launcher.py social dev          # Works from any module!

# Using Docker Compose (from root)
docker-compose up                      # Start all core services
doFrom ROOT directory
cd c:\Users\litre\Desktop\Overlord-Monolith

# Check all code (lint + format + security)
bash scripts/lint-all.sh

# Auto-fix formatting issues
bash scripts/lint-all.sh --fix

# Only Python checks
python -m black --check --line-length=120 modules/
python -m ruff check .
python -m pylint modules/ --rcfile=.pylintrc

# Shell script checks (requires shellcheck)
shellcheck scripts/*.sh

# JSON validation
for f in *.json; do python
pylint modules/ --rcfile=.pylintrc

# Shell script checks
shellcheck scripts/*.sh

# JSON validation
for f in *.json; do python3 -m json.tool "$f" > /dev/null; done
```

## rom ROOT directory
cd c:\Users\litre\Desktop\Overlord-Monolith

# F🔒 Security Checks

```bash
# Firebase rules audit
bash scripts/validate-firebase-rules.sh

# Dependency vulnerability scan
pip audit

# Check for hardcoded secrets
git diff --cached -S 'password\|api.key\|secret'

# SSH hardening (Linux, requires root)
suOpen documentation (Windows PowerShell)
Start-Process notepad docs\INDEX.md
Start-Process notepad scripts\README.md
Start-Process notepad docs\WEB-SECURITY-BASELINE.md
Start-Process notepad docs\SECURITY-CHECKLIST.md

# View in terminal
cat docs/INDEX.md                    # Master guide
cat scripts/README.md                # Scripts guide
cat docs/WEB-SECURITY-BASELINE.md   # Security baseline
cat docs/SECURITY-CHECKLIST.md      # Pre-launch checklist

# Or use your editor
code docs/INDEX.md
# or
notepad QUICK-REFERENCE

# Web security baseline (API endpoints)
open docs/WEB-SECURITY-BASELINE.md
From ROOT directory
cd c:\Users\litre\Desktop\Overlord-Monolith

# Run Python tests
pytest tests/ -v

# Validate environment
python scripts/validate-env.py --strict

# Test launcher (from root)
python launcher.py --help

# Test module launcher (from module)
cd modules/social
```bash
# Run Python tests
pytest tests/ -v

# Validate environment
python scripts/validate-env.py --strict

# Test launcher
pyFrom ROOT directory
cd c:\Users\litre\Desktop\Overlord-Monolith

# Edit environment variables (Windows)
notepad .env
# or
code .env

# Edit on Linux/macOS
nano .env
vim .env

# View current config
type config/services.yaml             # Windows
cat config/services.yaml              # Unix

# View environment schema
type env.schema.json                  # Windows
cat env.schema.json                   # Unix

## 🔧 Configuration

```bash
# Edit environment variables
nano .env

# View current config
cat config/services.yaml

# View environment schema
cat env.schema.json

# View service definitions
less config/services.yaml
```

## 📊 Monitoring & Logs
From ROOT directory
cd c:\Users\litre\Desktop\Overlord-Monolith

# 
```bash
# View logs from all services
docker-compose logs -f

# View specific service logs
docker-compose logs -f dashboard
docker-compose logs -f social
docker-compose logs -f grid

# View file-based logs
tail -f logs/dashboard.log
tail -f logs/social.log
tail -f logs/grid.log

# Search logs
grep "ERROR" logs/*.log
grep "1.2.3.4" logs/*.log  # Search by IP
```

## 🚀 Deployment

```bash
# Pre-flight checks
python scripts/validate-env.py --strict
bash scripts/lint-all.sh
bash scripts/validate-firebase-rules.sh
pytest tests/

# Generate services (if needed)
python scripts/generate-services.py

# Build images
docker-compose build

# Push to registry (example)
docker tag overlord (from ROOT)
cd c:\Users\litre\Desktop\Overlord-Monolith
rm .env
cp .env.example .env

# Re-generate services
rm -r generated/services/
python scripts/generate-services.py

# Check Python syntax
python -m py_compile scripts/*.py

# Find open ports
netstat -tulpn | grep LISTEN  # Linux
netstat -ano | findstr LISTENING  # Windows

# Test launcher from module directory
cd modules/social
python launcher.py --help  # Should work anywhere!
docker-compose down -v
docker system prune -a

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Reset environment
rm .env
cp .env.example .env

# From ROOT directory
cp .env.example .env
# Edit .env with your values
notepad .env          # Windows
nano .env             # Linux/macOS

python scripts/validate-env.py
docker-compose up
```

### Daily Development (From any directory!)
```bash
# Morning: sync and lint (works from root or any module)
git pull
bash scripts/lint-all.sh --fix

# Work on feature
git checkout -b feature/my-feature

# From module directory, use wrapper launcher
cd modules/social
python launcher.py social dev

# ... make changes ...

# Before commit (from root)
cd ../..
bash scripts/lint-all.sh
pytest tests/
bash scripts/validate-firebase-rules.sh

# Commit
git add .
git commit -m "feat: description"

# Push
git push origin feature/my-feature
```

### Pre-production Deploy
```bash
# From ROOT directory
cd c:\Users\litre\Desktop\Overlord-Monolith

# Full audit
python scripts/validate-env.py --strict
bash scripts/lint-all.sh
bash scripts/validate-firebase-rules.sh
pytest tests/ -v
pip audit
docker-compose build

# Review checklist
notepadmmit
git add .
git commit -m "feat: description"

# Push to create PR
git push origin feature/my-feature
```

### Pre-production Deploy
```bash
# Full audit
python scripts/validate-env.py --strict
bash scripts/lint-all.sh
bash scripts/validate-firebase-rules.sh
pytest tests/ -v
pip audit
docker-compose build

# Review checklist
open docs/SECURITY-CHECKLIST.md

# Deploy
git push origin main  # CI/CD takes over
```

## 🆘 Quick Help

```bash
# Get help on any script
python launcher.py --help
python scripts/validate-env.py --help
python scripts/generate-services.py --help
bash scripts/lint-all.sh --help

# List all scripts
ls -la scripts/

# Find which script does what
grep -r "description" scripts/ | grep -i "usage\|purpose"
```

## 💾 File Locations

```
.env                          # Your environment (DO NOT COMMIT)
.env.example                  # Template (committed)
config/services.yaml          # Service definitions
env.schema.json              # Environment schema
requirements.txt             # Python deps (pinned)
docker-compose.yml           # Docker config
docker-compose.override.yml  # Local overrides

scripts/launcher.py          # Entry point
scripts/validate-env.py      # Env validation
scripts/lint-all.sh          # Linting

configs/                     # Service configs
logs/                        # Runtime logs
generated/services/          # Generated service files

docs/
  ├── INDEX.md              # Start here!
  ├── IMPLEMENTATION-SUMMARY.md
  ├── WEB-SECURITY-BASELINE.md
  └── SECURITY-CHECKLIST.md
```

## 🔑 Important URLs

- **Dashboard:** http://localhost:5000
- **Social:** http://localhost:5001
- **Grid:** http://localhost:5002
- **Firebase Emulator UI:** http://localhost:4000

---

**Last Updated:** March 3, 2026

For detailed documentation, see `docs/INDEX.md`
