#!/usr/bin/env bash
# dev-watch.sh — Auto-restart server on file changes (Termux/Linux/Mac)
# Usage: ./dev-watch.sh

set -euo pipefail

PORT=8080

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  OVERLORD — Live Development Mode             ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "  Watching for changes to:"
echo "    • server.py"
echo "    • index.html"
echo "    • style.css"
echo "    • config.yaml"
echo ""
echo "  Server: http://localhost:$PORT"
echo "  Press Ctrl+C to stop"
echo ""

# Find Python command
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        PYTHON="$cmd"
        break
    fi
done

if [ -z "$PYTHON" ]; then
    echo "Error: Python not found"
    exit 1
fi

# Open browser (try common commands)
for browser in xdg-open termux-open-url open; do
    if command -v "$browser" &>/dev/null; then
        $browser "http://localhost:$PORT" 2>/dev/null &
        break
    fi
done

SERVER_PID=""

start_server() {
    # Kill old server
    if [ -n "$SERVER_PID" ]; then
        echo "→ Stopping old server..."
        kill "$SERVER_PID" 2>/dev/null || true
        sleep 0.5
    fi

    echo "→ Starting server..."
    "$PYTHON" server.py &
    SERVER_PID=$!
    echo "✓ Server running (PID: $SERVER_PID)"
    echo ""
}

# Cleanup on exit
cleanup() {
    echo ""
    if [ -n "$SERVER_PID" ]; then
        echo "→ Stopping server..."
        kill "$SERVER_PID" 2>/dev/null || true
    fi
    echo "✓ Dev watch stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Initial start
start_server

echo "👁️  Watching for file changes..."
echo ""

# Watch loop using inotifywait if available, otherwise fallback to polling
if command -v inotifywait &>/dev/null; then
    # Efficient watching with inotify
    while true; do
        inotifywait -e modify server.py index.html style.css config.yaml 2>/dev/null && {
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🔄 CHANGE DETECTED"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            start_server
        }
    done
else
    # Fallback: polling (works everywhere)
    declare -A last_mod
    for file in server.py index.html style.css config.yaml; do
        if [ -f "$file" ]; then
            last_mod[$file]=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null || echo "0")
        fi
    done

    while true; do
        sleep 1
        for file in server.py index.html style.css config.yaml; do
            if [ -f "$file" ]; then
                current=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null || echo "0")
                if [ "$current" != "${last_mod[$file]}" ]; then
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🔄 CHANGE DETECTED: $file"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    last_mod[$file]=$current
                    start_server
                    break
                fi
            fi
        done
    done
fi
