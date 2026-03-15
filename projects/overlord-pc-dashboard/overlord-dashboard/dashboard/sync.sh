#!/usr/bin/env bash
# sync.sh — Push changes to GitHub and optionally restart Docker / server
# Usage:
#   ./sync.sh                          # auto-message commit + push
#   ./sync.sh "my commit message"      # custom message
#   ./sync.sh "" --restart             # commit + push + restart Docker

set -euo pipefail

MSG="${1:-}"
RESTART="${2:-}"

# ── Commit message ─────────────────────────────────────────────────────────────
if [ -z "$MSG" ]; then
    MSG="overlord: sync $(date '+%Y-%m-%d %H:%M')"
fi

# ── Git push ───────────────────────────────────────────────────────────────────
echo ""
echo "[SYNC] Staging all changes..."
git add -A

STATUS=$(git status --porcelain)
if [ -z "$STATUS" ]; then
    echo "[SYNC] Nothing to commit — already up to date."
else
    echo "[SYNC] Committing: $MSG"
    git commit -m "$MSG"
    echo "[SYNC] Pushing to origin/main..."
    git push origin main
    echo "[SYNC] Done! Changes live on GitHub."
fi

# ── Optional restart ───────────────────────────────────────────────────────────
if [ "$RESTART" = "--restart" ]; then
    if command -v docker &>/dev/null; then
        echo "[DOCKER] Rebuilding container..."
        docker compose up -d --build
        echo "[DOCKER] Container restarted."
    else
        # Termux / bare-metal — just restart the Python server
        echo "[SERVER] Restarting server process..."
        pkill -f "python.*server.py" 2>/dev/null || true
        nohup python server.py > overlord.log 2>&1 &
        echo "[SERVER] Server restarted (PID $!)."
    fi
fi

echo ""
