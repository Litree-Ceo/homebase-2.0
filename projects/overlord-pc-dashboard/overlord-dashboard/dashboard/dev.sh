#!/usr/bin/env bash
# Run the Dashboard service in development mode

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Starting Dashboard in development mode..." >&2
echo "ROOT_DIR: $ROOT_DIR" >&2

cd "$ROOT_DIR"
export LOG_LEVEL=debug
docker-compose up dashboard
echo "✓ Dashboard development service stopped" >&2
