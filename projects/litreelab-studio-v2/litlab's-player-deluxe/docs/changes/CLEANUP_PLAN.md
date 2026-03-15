# Overlord Monolith: Cleanup Plan

To maintain a "Pro" environment, we should remove redundant files, temporary scripts, and unused dependencies.

## 1. Deprecated Scripts (Safe to Delete)

These scripts appear to be legacy or from previous mobile-first attempts (Termux) that are no longer relevant for a Windows Server setup.

- [ ] `setup-termux.sh`
- [ ] `termux-git-setup.sh`
- [ ] `termux-sync-master.sh`
- [ ] `termux-tunnel.sh`
- [ ] `setup-ssh-termux.sh`
- [ ] `setup-syncthing-termux.sh`

## 2. Redundant Setup Files

If `setup-overlord-pro.ps1` is the new master script, these can be archived or removed:

- [ ] `setup.sh` (Bash version)
- [ ] `start-all.sh` (Bash version)
- [ ] `sync.sh` (Bash version)
- [ ] `fix-tunnel.ps1` (If tunnels are managed elsewhere)

## 3. Node.js Cleanup (Social Module)

Since `modules/social` is now being served as static files by Nginx, the Node.js service is retired.

- [ ] **Delete** `modules/social/node_modules/` folder (Free up space!).
- [ ] **Keep** `modules/social/package.json` (Useful for tracking dev dependencies like Linters, but not needed for running the site).

## 4. Log Consolidation

The current logs are scattered. We should centralize them:

- [ ] **Dashboard Logs**: `modules/dashboard/logs/` (Keep)
- [ ] **Social Logs**: `modules/social/logs/` (Keep specific app logs, delete generic `Social.out.log`)
- [ ] **Nginx Logs**: `tools/nginx/logs/` (New central location for access/error logs)

## 5. Proposed Command to Execute Cleanup

Run this PowerShell command to clean up the workspace (Use with caution!):

```powershell
# Remove Node Modules (Heavy!)
Remove-Item -Path "modules/social/node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Remove Termux Scripts
Get-ChildItem -Path . -Filter "*termux*" -Recurse | Remove-Item -Force

# Create standard log directories
New-Item -ItemType Directory -Force "logs/nginx"
New-Item -ItemType Directory -Force "logs/app"
```

## 6. VS Code Optimizations

These are already applied in `.vscode/settings.json`, but for reference:
- **Hidden**: `__pycache__`, `.venv`, `node_modules`.
- **Formatting**: Auto-format on save enabled.
- **Python**: Default interpreter set to workspace virtual environment if available.
