#!/usr/bin/env bash
# Start the Dashboard service using Docker Compose

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Starting Dashboard service..." >&2
echo "Root directory: $ROOT_DIR" >&2

cd "$ROOT_DIR"
docker-compose up -d dashboard
echo "✓ Dashboard service started" >&2
echo "  View logs: docker-compose logs -f dashboard" >&2
