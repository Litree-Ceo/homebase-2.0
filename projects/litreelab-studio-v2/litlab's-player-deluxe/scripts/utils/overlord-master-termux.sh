#!/data/data/com.termux/files/usr/bin/bash

# Overlord Master Control - Termux/Android Version
# Pairs with Windows PC version for unified control

# ══════════════════════════════════════════════════════════════
#  CONFIGURATION
# ══════════════════════════════════════════════════════════════

# Projects configuration
declare -A PROJECTS=(
    ["vision"]="vision-board:3000:npm run dev:Vision Board Web App"
    ["web"]="web/frontend-new:3001:npm run dev:Web Frontend (React/Vite)"
    ["server"]="my-server:5000:npm start:API Backend Server"
    ["grid"]="L1T_GRID:5001:npm start:Torrent Streamer"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# ══════════════════════════════════════════════════════════════
#  FUNCTIONS
# ══════════════════════════════════════════════════════════════

get_ip() {
    # Get device IP
    ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 || echo "localhost"
}

LOCAL_IP=$(get_ip)

start_service() {
    local key=$1
    local project="${PROJECTS[$key]}"
    IFS=':' read -r path port cmd desc <<< "$project"
    
    echo -e "${CYAN}🚀 Starting $desc (Port $port)...${NC}"
    
    if [ -d "$HOME/projects/$path" ]; then
        cd "$HOME/projects/$path"
        eval "$cmd > /dev/null 2>&1 &"
        echo "   ✓ Started PID: $!"
    else
        echo -e "${YELLOW}   ⚠️  Path not found: ~/projects/$path${NC}"
    fi
}

start_all() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  🚀 STARTING OVERLORD SERVICES${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════\n${NC}"
    
    # Kill existing processes
    echo -e "${YELLOW}🛑 Stopping existing servers...${NC}"
    pkill -f "next dev" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "node.*server" 2>/dev/null
    sleep 2
    echo -e "${GREEN}   ✓ Clean slate\n${NC}"
    
    # Start each service
    for key in "${!PROJECTS[@]}"; do
        start_service "$key"
        sleep 1
    done
    
    echo -e "\n${YELLOW}⏳ Initializing servers...${NC}"
    sleep 3
    
    show_status
}

stop_all() {
    echo -e "\n${RED}🛑 Stopping all Overlord services...${NC}"
    pkill -f "next dev"
    pkill -f "vite"
    pkill -f "node.*server"
    echo -e "${GREEN}✓ All services stopped\n${NC}"
}

show_status() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  📡 SERVICE STATUS${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════\n${NC}"
    
    local all_running=true
    
    for key in "${!PROJECTS[@]}"; do
        local project="${PROJECTS[$key]}"
        IFS=':' read -r path port cmd desc <<< "$project"
        
        if lsof -i ":$port" >/dev/null 2>&1; then
            echo -e "${GREEN}   ✓ $desc - Running on port $port${NC}"
        else
            echo -e "${RED}   ✗ $desc - NOT RUNNING${NC}"
            all_running=false
        fi
    done
    
    echo ""
    
    if [ "$all_running" = true ]; then
        show_urls
    else
        echo -e "${YELLOW}⚠️  Some services failed. Check logs.${NC}"
    fi
}

show_urls() {
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ ALL SYSTEMS OPERATIONAL${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════\n${NC}"
    
    echo -e "${YELLOW}🏠 LOCAL ACCESS (This Phone):${NC}"
    echo -e "${GRAY}─────────────────────────────────${NC}"
    for key in "${!PROJECTS[@]}"; do
        local project="${PROJECTS[$key]}"
        IFS=':' read -r path port cmd desc <<< "$project"
        echo -e "   🌐 $desc: ${CYAN}http://localhost:$port${NC}"
    done
    
    echo -e "\n${YELLOW}📱 NETWORK ACCESS (From PC/Other Devices):${NC}"
    echo -e "${GRAY}─────────────────────────────────${NC}"
    for key in "${!PROJECTS[@]}"; do
        local project="${PROJECTS[$key]}"
        IFS=':' read -r path port cmd desc <<< "$project"
        echo -e "   🌐 $desc: ${MAGENTA}http://$LOCAL_IP:$port${NC}"
    done
    
    echo -e "\n${YELLOW}💡 Network IP: ${NC}$LOCAL_IP"
    echo -e "${GRAY}💡 Share these URLs with your PC's browser${NC}"
    echo -e "${GRAY}💡 To stop: ${NC}./overlord-master.sh stop\n"
}

sync_github() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  🔄 SYNCING WITH GITHUB${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════\n${NC}"
    
    for key in "${!PROJECTS[@]}"; do
        local project="${PROJECTS[$key]}"
        IFS=':' read -r path port cmd desc <<< "$project"
        
        if [ -d "$HOME/projects/$path/.git" ]; then
            echo -e "${CYAN}🔄 Syncing $desc...${NC}"
            cd "$HOME/projects/$path"
            
            # Pull latest
            git pull origin main >/dev/null 2>&1
            
            # Check for changes
            if [ -n "$(git status --porcelain)" ]; then
                echo -e "${YELLOW}   📝 Changes detected, committing...${NC}"
                git add .
                git commit -m "Auto-sync $(date '+%Y-%m-%d %H:%M')"
                git push origin main
                echo -e "${GREEN}   ✓ Pushed to GitHub${NC}"
            else
                echo -e "${GREEN}   ✓ Up to date${NC}"
            fi
        else
            echo -e "${GRAY}🔄 $desc - Not a git repo (skipped)${NC}"
        fi
    done
    
    echo -e "\n${GREEN}✅ GitHub sync complete\n${NC}"
}

show_help() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  🎮 OVERLORD MASTER CONTROL (Termux)${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════\n${NC}"
    
    echo -e "${YELLOW}USAGE:${NC}"
    echo -e "  ./overlord-master.sh [action] [service]\n"
    
    echo -e "${YELLOW}ACTIONS:${NC}"
    echo -e "  ${NC}start [service]  - Start services (default: all)"
    echo -e "  stop             - Stop all services"
    echo -e "  status           - Show running status"
    echo -e "  sync             - Sync all repos with GitHub"
    echo -e "  urls             - Show access URLs"
    echo -e "  help             - Show this help\n"
    
    echo -e "${YELLOW}SERVICES:${NC}"
    echo -e "  ${NC}all              - All services (default)"
    echo -e "  vision           - Vision Board (3000)"
    echo -e "  web              - Web Frontend (3001)"
    echo -e "  server           - API Server (5000)"
    echo -e "  grid             - L1T_GRID (5001)\n"
    
    echo -e "${YELLOW}EXAMPLES:${NC}"
    echo -e "  ${CYAN}./overlord-master.sh start"
    echo -e "  ./overlord-master.sh start vision"
    echo -e "  ./overlord-master.sh sync"
    echo -e "  ./overlord-master.sh stop${NC}\n"
}

# ══════════════════════════════════════════════════════════════
#  MAIN EXECUTION
# ══════════════════════════════════════════════════════════════

ACTION=${1:-help}
SERVICE=${2:-all}

case "$ACTION" in
    start)
        if [ "$SERVICE" = "all" ]; then
            start_all
        else
            start_service "$SERVICE"
            show_status
        fi
        ;;
    stop)
        stop_all
        ;;
    status)
        show_status
        ;;
    sync)
        sync_github
        ;;
    urls)
        show_urls
        ;;
    help|*)
        show_help
        ;;
esac
