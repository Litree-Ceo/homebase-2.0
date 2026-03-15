# Overlord Monolith — Master Detail Blueprint (2026)

This is the consolidated blueprint for the full workspace: architecture, modules, operations, deployment, and maintenance.

## 1) System Overview

Overlord Monolith is a multi-module local-first platform that combines:

- A Python-based real-time system dashboard
- A social/web experience module
- A grid module and related static assets
- Automation and setup scripts for Windows, Linux, and Termux
- Optional integrations (Firebase, tunnels, remote access, Docker-based services)

The repository is organized as a monolith for fast local iteration while keeping modules independently runnable.

## 2) Core Runtime Topology

### Primary components

- `server.py` and `modules/dashboard/server.py`
  - Real-time telemetry APIs (`/api/health`, `/api/config`, `/api/stats`, `/api/history`)
  - API-key auth and rate limiting
  - System collectors (CPU, RAM, disk, network, processes, optional GPU)

- `index.html` + `style.css` (root and module variants)
  - Dashboard frontend/PWA shell
  - Polling-based UI updates

- `modules/social/`
  - Social UI app with multi-section interactions, auth UX, and Firebase-ready assets

- `modules/grid/`
  - Grid-specific visual/application module

### Request/data flow (dashboard)

1. Browser loads dashboard UI.
2. UI reads/requests API key.
3. UI polls backend endpoints on refresh interval.
4. Backend gathers host metrics and returns JSON snapshots.
5. UI renders cards, bars, sparklines, and status indicators.

## 3) Repository Blueprint

### Root-level platform files

- Architecture and planning: `ARCHITECTURE.md`, `PROJECT_BLUEPRINT.md`, `GEMINI_BLUEPRINT.md`, `CLEANUP_PLAN.md`
- Deployment and operations: `DEPLOYMENT.md`, `INTEGRATION_GUIDE.md`, `OPTIMIZATION-GUIDE.md`, `QUICK-START.md`
- Main runtime/config: `server.py`, `overlord-engine.py`, `config.yaml`, `requirements.txt`, `pyproject.toml`
- Frontend shell: `index.html`, `style.css`, `manifest.json`

### Key directories

- `modules/dashboard/` — production dashboard module with tests, scripts, and deployment helpers
- `modules/social/` — social app module with JS app code, styles, and package-based tooling
- `modules/grid/` — grid module
- `docs/` — security baseline/checklist and implementation summary
- `config/` — service/config descriptors
- `tests/` — repo-level tests
- `scripts/` — utilities and automation helpers
- `tools/` — support tooling
- `repos/` — nested/related project worktrees or references

## 4) Security and Reliability Baseline

- API key protection enabled by default for sensitive endpoints
- Per-IP rate limiting
- Rotating logs and health endpoint checks
- Local-first deployment with optional controlled remote access scripts
- Scripted startup/shutdown for predictable service lifecycle

Operational recommendations:

- Keep `auth.api_key` non-default in `config.yaml`
- Restrict host binding when remote access is not required
- Validate firewall exposure before opening ports externally
- Review `docs/SECURITY-CHECKLIST.md` and `docs/WEB-SECURITY-BASELINE.md` regularly

## 5) Development Workflow

1. Use module-local virtual environments where available (`modules/dashboard/.venv`).
2. Start target module (`start*.ps1` / `dev-watch*.ps1` / shell scripts).
3. Validate API health and UI updates.
4. Run tests (`pytest` in module/root based on scope).
5. Deploy with documented scripts when stable.

## 6) Deployment Paths

Supported operational paths in this repo include:

- Local host only (default)
- LAN/mobile access
- Tunnel-based remote access
- Firebase-backed integrations
- Docker-based supporting services

Use the existing deployment docs and scripts rather than ad hoc commands for repeatability.

## 7) Observability and Troubleshooting

- Health endpoint checks for liveness
- Runtime and rotating logs
- Troubleshooting guides per module and remote-access docs
- Scripted restart flows for fast recovery

## 8) Maintenance Standards

- Keep docs synchronized with script changes
- Avoid duplicated config defaults across files
- Prefer external CSS classes over inline styles
- Keep links with `target="_blank"` protected via `rel="noopener noreferrer"`
- Keep browser-compat CSS prefixes where needed (`-webkit-backdrop-filter`)

## 9) Immediate Action Checklist

- [ ] Keep one authoritative config per runtime path
- [ ] Periodically prune stale scripts/logs/backups
- [ ] Verify module READMEs match root README operational behavior
- [ ] Run tests before deployment changes
- [ ] Review remote-access/tunnel setup for least-privilege exposure

---

Owner context: Litree-Ceo / Overlord-Pc-Dashboard
Branch context: `main`