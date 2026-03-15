#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
# OVERLORD SOCIAL HUB - UNIVERSAL MASTER LAUNCHER
# Cross-platform: WSL / Git Bash / native Linux / macOS
# Auto-detects PM2, falls back to nohup if needed
# ════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

PORT=3000
NAME="overlord-social"
LOGFILE="$PROJECT_DIR/social.log"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ════════════════════════════════════════════════════════════
# Header
# ════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}┌──────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│   OVERLORD SOCIAL HUB - MASTER LAUNCHER      │${NC}"
echo -e "${CYAN}└──────────────────────────────────────────────┘${NC}"
echo ""

# ════════════════════════════════════════════════════════════
# Auto-detect IP
# ════════════════════════════════════════════════════════════
if command -v ip >/dev/null 2>&1; then
    IP=$(ip addr show eth0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d/ -f1 || hostname -I | awk '{print $1}')
elif command -v ifconfig >/dev/null 2>&1; then
    IP=$(ifconfig | grep -A1 "broadcast\|inet addr" | awk '{print $2}' | head -1 | cut -d: -f2)
else
    IP="192.168.0.77"
fi

[[ -z "$IP" ]] && IP="192.168.0.77"

echo -e "${GREEN}🌐 Detected IP     : $IP${NC}"
echo -e "${GREEN}📱 Phone access    : http://$IP:$PORT${NC}"
echo -e "${GREEN}🖥️  Local access    : http://localhost:$PORT${NC}"
echo ""

# ════════════════════════════════════════════════════════════
# Check for PM2
# ════════════════════════════════════════════════════════════
if command -v pm2 >/dev/null 2>&1; then
    echo -e "${GREEN}🟢 PM2 detected — launching pro mode${NC}"
    echo ""
    
    # Delete old instance if exists
    pm2 delete "$NAME" 2>/dev/null || true
    sleep 1
    
    # Start with PM2
    echo -e "${CYAN}🚀 Starting Social Hub via PM2...${NC}"
    pm2 start npm --name "$NAME" -- start
    pm2 save
    
    sleep 3
    
    echo ""
    echo -e "${GREEN}✅ Launched via PM2${NC}"
    echo ""
    pm2 list | grep "$NAME" || echo "App registered in PM2"
    
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}PM2 Commands (same everywhere):${NC}"
    echo "   pm2 list                    → Status"
    echo "   pm2 logs $NAME               → Live logs"
    echo "   pm2 monit                   → Dashboard"
    echo "   pm2 restart $NAME    → Restart"
    echo "   pm2 stop $NAME              → Stop"
    echo "   pm2 delete $NAME   → Remove"
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    
else
    echo -e "${YELLOW}🟡 PM2 not found — using nohup fallback${NC}"
    echo "   (Install: npm install -g pm2)" 
    echo ""
    
    # Kill old instance
    pkill -f "node.*$PROJECT_DIR" 2>/dev/null || true
    pkill -f "npm.*start.*social" 2>/dev/null || true
    sleep 1
    
    echo -e "${CYAN}🚀 Starting Social Hub via nohup...${NC}"
    nohup npm start > "$LOGFILE" 2>&1 &
    PID=$!
    echo $PID > "$PROJECT_DIR/social.pid"
    
    echo -e "${GREEN}✅ Started (PID: $PID)${NC}"
    
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}Fallback Commands (nohup):${NC}"
    echo "   tail -f social.log          → Live logs"
    echo "   kill \$(cat social.pid)     → Stop"
    echo "   cat social.pid              → Get PID"
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
fi

# ════════════════════════════════════════════════════════════
# Verify startup
# ════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}⏳ Verifying server startup${NC} (waiting 5 seconds)..."
sleep 5

if curl -s --connect-timeout 5 "http://localhost:$PORT" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is LIVE on http://localhost:$PORT${NC}"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}📱 Open on phone: http://$IP:$PORT${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
else
    echo -e "${RED}⚠️  Server not responding — checking logs:${NC}"
    echo ""
    if [[ -f "$LOGFILE" ]]; then
        tail -n 20 "$LOGFILE"
    else
        pm2 logs "$NAME" --lines 20 2>/dev/null || echo "No logs found"
    fi
fi

echo ""
