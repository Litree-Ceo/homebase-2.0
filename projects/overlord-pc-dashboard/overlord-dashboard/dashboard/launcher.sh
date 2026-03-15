#!/usr/bin/env bash
# Module-level script wrapper for Unix systems
# Automatically finds and delegates to root scripts
# Usage: bash ../launcher.sh [command] [args...]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find root directory
find_root() {
    local current="$SCRIPT_DIR"
    while [ "$current" != "/" ]; do
        if [ -f "$current/.env.example" ] || [ -f "$current/pyproject.toml" ]; then
            if [ -f "$current/scripts/launcher.py" ]; then
                echo "$current"
                return 0
            fi
        fi
        current="$(dirname "$current")"
    done
    
    # Fallback: assume root is 2 levels up
    echo "$SCRIPT_DIR/../.."
}

ROOT_DIR="$(find_root)"
LAUNCHER="$ROOT_DIR/scripts/launcher.py"

if [ ! -f "$LAUNCHER" ]; then
    echo "ERROR: Root launcher not found at $LAUNCHER"
    echo "Searched from: $SCRIPT_DIR"
    echo "Root directory detected: $ROOT_DIR"
    exit 1
fi

cd "$ROOT_DIR"
python3 "$LAUNCHER" "$@"
