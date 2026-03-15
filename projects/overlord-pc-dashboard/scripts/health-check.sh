#!/bin/bash
# Overlord Dashboard Health Check Script
# Monitors server health and sends alerts if needed

set -e

SERVER_URL="${SERVER_URL:-http://localhost:8999}"
LOG_FILE="${LOG_FILE:-../health-check.log}"
TIMEOUT="${TIMEOUT:-10}"
ALERT_ON_FAILURE="${ALERT_ON_FAILURE:-false}"

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    local entry="[$timestamp] $level - $message"
    echo "$entry"
    echo "$entry" >> "$LOG_FILE" 2>/dev/null || true
}

# Check if server is responding
if ! response=$(curl -s -f -m "$TIMEOUT" "$SERVER_URL/api/health" 2>&1); then
    log "ERROR" "✗ Health check failed: Server not responding"
    if [ "$ALERT_ON_FAILURE" = "true" ]; then
        log "ERROR" "Alert: Server may be down!"
    fi
    exit 1
fi

# Parse JSON response
if echo "$response" | grep -q '"status":"healthy"'; then
    version=$(echo "$response" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    log "INFO" "✓ Server is healthy (version: $version)"
    
    # Check system stats (if authenticated)
    if [ -n "$API_KEY" ]; then
        if stats=$(curl -s -f -m "$TIMEOUT" -H "X-API-Key: $API_KEY" "$SERVER_URL/api/stats" 2>&1); then
            cpu=$(echo "$stats" | grep -o '"percent":[0-9.]*' | head -1 | cut -d':' -f2)
            ram=$(echo "$stats" | grep -o '"percent":[0-9.]*' | sed -n '2p' | cut -d':' -f2)
            
            if [ -n "$cpu" ] && [ -n "$ram" ]; then
                log "INFO" "  CPU: ${cpu}%, RAM: ${ram}%"
                
                # Alert on high resource usage
                if (( $(echo "$cpu > 90" | bc -l) )); then
                    log "WARN" "⚠ HIGH CPU USAGE: ${cpu}%"
                fi
                if (( $(echo "$ram > 90" | bc -l) )); then
                    log "WARN" "⚠ HIGH RAM USAGE: ${ram}%"
                fi
            fi
        fi
    fi
    
    exit 0
else
    log "ERROR" "✗ Server reported unhealthy status"
    exit 1
fi
