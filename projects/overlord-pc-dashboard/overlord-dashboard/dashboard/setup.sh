#!/usr/bin/env bash
# setup.sh — First-time setup and launcher for Overlord Dashboard
# Works on: Linux, macOS, WSL, Termux, Git Bash (Windows)
# Usage:
#   ./setup.sh          # install deps + start server
#   ./setup.sh --key    # also generate a fresh API key and write to config.yaml
#   ./setup.sh --test   # install deps + run tests (no server start)

set -euo pipefail

GENKEY="${1:-}"

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║   OVERLORD DASHBOARD — SETUP v4.0   ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# ── Python check ──────────────────────────────────────────────────────────────
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        VER=$("$cmd" -c "import sys; print(sys.version_info[:2])" 2>/dev/null || echo "(0, 0)")
        MAJOR=$(echo "$VER" | tr -d '()' | cut -d',' -f1 | tr -d ' ')
        MINOR=$(echo "$VER" | tr -d '()' | cut -d',' -f2 | tr -d ' ')
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 10 ]; then
            PYTHON="$cmd"
            break
        fi
    fi
done

if [ -z "$PYTHON" ]; then
    echo "  [ERROR] Python 3.10+ is required but not found."
    echo "  Install it from https://python.org or via your package manager."
    exit 1
fi

echo "  [OK] Python : $($PYTHON --version)"

# ── Install dependencies ───────────────────────────────────────────────────────
echo "  [..] Installing dependencies..."
"$PYTHON" -m pip install -r requirements.txt --quiet
echo "  [OK] Dependencies installed."

# ── Optional: generate + write a new API key ──────────────────────────────────
if [ "$GENKEY" = "--key" ]; then
    NEW_KEY=$("$PYTHON" -c "import secrets; print(secrets.token_urlsafe(32))")
    # Replace the api_key line in config.yaml in place
    if command -v sed &>/dev/null; then
        sed -i.bak "s|api_key:.*|api_key: \"$NEW_KEY\"|" config.yaml
        echo "  [OK] New API key written to config.yaml: $NEW_KEY"
    else
        echo "  [!!] Could not auto-write key. Add manually to config.yaml:"
        echo "       api_key: \"$NEW_KEY\""
    fi
fi

# ── Tests only mode ───────────────────────────────────────────────────────────
if [ "$GENKEY" = "--test" ]; then
    echo "  [..] Running test suite..."
    "$PYTHON" -m pytest tests/ -v --tb=short
    echo ""
    exit 0
fi

# ── Check for default API key ─────────────────────────────────────────────────
if grep -q 'overlord-change-me-please' config.yaml 2>/dev/null; then
    echo ""
    echo "  ╔══════════════════════════════════════════════════╗"
    echo "  ║  WARNING: Default API key detected in config.yaml ║"
    echo "  ║  Run:  ./setup.sh --key  to auto-generate one.    ║"
    echo "  ╚══════════════════════════════════════════════════╝"
    echo ""
fi

# ── Start server ───────────────────────────────────────────────────────────────
echo "  [..] Starting server..."
echo ""
exec "$PYTHON" server.py
