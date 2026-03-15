# OVERLORD MONOLITH — AI Context Primer
> Paste this at the start of every Gemini/AI session. Keep it short on purpose.

## INSTRUCTIONS FOR AI (READ FIRST)
You are working on MY existing project. Do NOT ask me to clarify what a file is — all docs and blueprints listed below are already written and in the repo. When I reference a filename, assume it exists and you know its contents from this primer. Skip questions like "what would you like to do?" and just act on the request. If context is missing, infer from what's here or ask a single, specific, targeted question.

## What This Project Is
Personal monorepo: PC system monitor + web platform. Python backend, vanilla JS/Node frontend.
GitHub: Litree-Ceo/Overlord-Pc-Dashboard | Branch: main

## Environment
- **Windows username**: `litre`
- **Windows PC IP (LAN)**: `192.168.0.77`
- **Windows PC repo**: `C:\Users\litre\Desktop\Overlord-Monolith`
- **Termux repo**: `~/projects/Overlord-Monolith` (synced via git/Syncthing)
- **SSH alias**: `ssh overlord` → connects to `litre@192.168.0.77` using `~/.ssh/overlord_key`

## Module Map
| Module | Port | Tech | Entry |
|--------|------|------|-------|
| dashboard | 5000 | Python HTTP | `modules/dashboard/server.py` |
| social | 5001 | Node/Express/Firebase | `modules/social/app.js` |
| grid | 5002 | Python HTTP | `modules/grid/server.py` |

## Key Files
- `config/services.yaml` — single source of truth for all services
- `config.yaml` — global config (ports, API keys, logging)
- `modules/*/config.yaml` — per-module overrides
- `scripts/generate-services.py` — regenerates systemd/NSSM service files
- `MASTER_DETAIL_BLUEPRINT.md` — consolidated 2026 blueprint covering system overview, runtime topology, repo layout, security baseline, dev workflow, deployment paths, observability, and maintenance standards. This is the primary reference doc.
- `GEMINI_BLUEPRINT.md` — older deep-dive architecture reference (patterns, coding standards, API conventions)
- `PROJECT_BLUEPRINT.md` — original project blueprint
- `ARCHITECTURE.md` — architecture overview

## Termux Commands (phone → PC control)
```bash
ctx           # Print this context file (paste into AI)
ctx --copy    # Also copy to clipboard (needs Termux:API)
overlord      # SSH into PC PowerShell directly
overlord status   # Services + Docker + RAM summary
overlord restart  # Restart dashboard service
overlord pull     # Git pull latest on PC
overlord logs     # Tail dashboard logs
overlord ps       # Top RAM processes on PC
overlord cmd <ps> # Run any PowerShell command remotely
```

## Common Commands
```bash
# Start everything (Linux/Termux)
./start-all.sh

# Start everything (Windows)
.\start-all.ps1

# Run dashboard only
cd modules/dashboard && python server.py

# Run social only
cd modules/social && node app.js

# Lint & test (Python)
black . --line-length 120 && ruff check . && pytest tests/ -v

# Generate API key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Regenerate service files after config changes
python scripts/generate-services.py
```

## API Pattern
```
GET /api/health          → public, no auth
GET /api/stats           → requires X-API-Key header
GET /api/history         → requires X-API-Key header
```

## Rules I Follow
1. No hardcoded values — everything in config.yaml or env vars
2. Graceful degradation for optional deps (try/except imports)
3. Python: snake_case, 120 char lines, Black + Ruff + MyPy
4. JS: camelCase, ESModules, Prettier + ESLint
5. auth + rate limiting ON by default (token-bucket, 5 req/s/IP)
6. Cross-platform: scripts exist for both Windows (.ps1) and Linux (.sh)

## Current Status / What I Was Last Working On
<!-- UPDATE THIS manually before committing so future-you remembers -->
Last session: 2026-03-04 — System cleanup (killed IIS, RustDesk, telemetry, print spooler, NC Talk/Whiteboard/Collabora). WSL capped at 2GB. SSH fixed for admin user (administrators_authorized_keys). Added ctx + overlord Termux commands.
