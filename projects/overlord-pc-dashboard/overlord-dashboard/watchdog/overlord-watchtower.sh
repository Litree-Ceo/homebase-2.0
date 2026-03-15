#!/data/data/com.termux/files/usr/bin/bash
# Overlord Mobile Watchtower - Termux Failover Monitor

CONFIG_FILE="$HOME/.overlord-config"
LOG_FILE="$HOME/overlord-watchtower.log"
FIREBASE_URL="https://your-firebase-project-default-rtdb.firebaseio.com/overlord/status.json"
PC_IP="192.168.0.77"
CHECK_INTERVAL=60

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

notify() {
    local title="$1"
    local content="$2"
    local priority="$3" # low, high, max
    
    if command -v termux-notification >/dev/null 2>&1; then
        termux-notification --title "$title" --content "$content" --priority "$priority"
    fi
    
    if command -v termux-vibrate >/dev/null 2>&1 && [ "$priority" == "max" ]; then
        termux-vibrate -d 1000
        sleep 0.5
        termux-vibrate -d 1000
    fi
}

check_pc_online() {
    if ping -c 1 -W 3 "$PC_IP" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

fetch_status() {
    curl -s --max-time 10 "$FIREBASE_URL"
}

parse_status() {
    local json="$1"
    echo "$json" | jq -r '
        "\(.timestamp) \(.overallHealth) \(.host) \(.services | map(select(.status=="down")) | length)"
    ' 2>/dev/null
}

failover_mode() {
    log "${RED}PC OFFLINE - Activating Failover Mode${NC}"
    notify "🚨 OVERLORD FAILOVER" "PC at $PC_IP unreachable. Activating Termux services..." "max"
    
    # Start local services if not running
    if ! pgrep -f "node.*next" >/dev/null; then
        log "Starting Next.js dashboard on Termux..."
        cd ~/System-Overlord-Phase0/web && npm run dev &
    fi
    
    # Update Firebase with failover status
    curl -s -X PUT -d '{
        "timestamp": "'$(date -Iseconds)'",
        "host": "termux-failover",
        "ip": "127.0.0.1",
        "overallHealth": "failover",
        "note": "Primary PC unreachable, running on Termux"
    }' "$FIREBASE_URL" >/dev/null
}

main() {
    log "${GREEN}Overlord Watchtower Mobile Started${NC}"
    local last_status=""
    
    while true; do
        if check_pc_online; then
            STATUS=$(fetch_status)
            
            if [ -z "$STATUS" ] || [ "$STATUS" == "null" ]; then
                log "${YELLOW}PC online but no heartbeat data${NC}"
                notify "⚠️ Overlord Warning" "PC reachable but watchtower not reporting" "high"
            else
                # Parse JSON
                OVERALL=$(echo "$STATUS" | jq -r '.overallHealth')
                TIMESTAMP=$(echo "$STATUS" | jq -r '.timestamp')
                DOWN_COUNT=$(echo "$STATUS" | jq -r '[.services[] | select(.status=="down")] | length')
                
                if [ "$OVERALL" == "critical" ]; then
                    log "${RED}CRITICAL: All services down on PC${NC}"
                    notify "🔴 OVERLORD CRITICAL" "All services failed on $PC_IP" "max"
                    failover_mode
                elif [ "$OVERALL" == "degraded" ]; then
                    DOWN_SERVICES=$(echo "$STATUS" | jq -r '[.services[] | select(.status=="down") | .Name] | join(", ")')
                    log "${YELLOW}DEGRADED: $DOWN_SERVICES down${NC}"
                    notify "⚠️ Overlord Degraded" "$DOWN_SERVICES offline on PC" "high"
                elif [ "$OVERALL" == "healthy" ]; then
                    if [ "$last_status" != "healthy" ]; then
                        log "${GREEN}PC Healthy - All services operational${NC}"
                        notify "✅ Overlord Online" "All systems operational on $PC_IP" "low"
                    fi
                fi
                
                last_status="$OVERALL"
            fi
        else
            failover_mode
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# Ensure jq is installed
if ! command -v jq >/dev/null 2>&1; then
    pkg install jq -y
fi

# Run
main
