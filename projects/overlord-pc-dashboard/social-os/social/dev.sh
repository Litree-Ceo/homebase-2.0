#!/usr/bin/env bash
# Run the Social service in development mode

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Starting Social in development mode..." >&2
echo "Root directory: $ROOT_DIR" >&2

cd "$ROOT_DIR"
export LOG_LEVEL=debug
docker-compose up social
echo "✓ Social development service stopped" >&2
