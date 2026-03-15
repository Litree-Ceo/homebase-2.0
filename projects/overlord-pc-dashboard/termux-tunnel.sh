#!/data/data/com.termux/files/usr/bin/bash
# Termux Script - Connect to Overlord-Monolith on your PC
# Save this to ~/bin/overlord and run: overlord

set -e

# ============ CONFIGURATION ============
# Your PC details (auto-configured):
PC_USER="litre"  # Your Windows username
PC_IP="192.168.0.77"  # Your PC's local IP
PROJECT_DIR="${OVERLORD_PROJECT_DIR:-/c/Users/litre/Desktop/Overlord-Monolith}"
# =======================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Overlord-Monolith Remote Access${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill existing tunnels
pkill -f "ssh.*$PC_USER@$PC_IP" 2>/dev/null && echo -e "${YELLOW}🔄 Killed existing tunnel${NC}"

# Test SSH connection first
echo -e "${CYAN}📡 Testing connection to PC...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $PC_USER@$PC_IP "exit" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to PC!${NC}"
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. Is your PC on and connected to WiFi?"
    echo "  2. Did you add your Termux SSH key to PC? Run on PC:"
    echo "     .\\add-termux-key.ps1"
    echo "  3. Is the IP correct? Current: $PC_IP"
    echo "  4. Test manually: ssh $PC_USER@$PC_IP"
    exit 1
fi

echo -e "${GREEN}✅ Connected to PC!${NC}"

# Create SSH tunnel for live file sync
echo -e "${CYAN}🔗 Creating SSH tunnel...${NC}"

# Option 1: Direct SSH with port forwarding for Python server
ssh -f -N -L 3000:localhost:3000 -L 8080:localhost:8080 \
    -o ServerAliveInterval=30 \
    -o ExitOnForwardFailure=yes \
    $PC_USER@$PC_IP

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tunnel established!${NC}"
    echo ""
    echo -e "${CYAN}📱 Access Options:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  ${GREEN}Dashboard:${NC} http://localhost:3000"
    echo -e "  ${GREEN}VS Code:${NC}   http://localhost:8080"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "  • Edit files in Termux - changes appear on PC instantly"
    echo "  • Mount PC folder: sshfs $PC_USER@$PC_IP:'$PROJECT_DIR' ~/overlord"
    echo "  • Kill tunnel: pkill -f 'ssh.*$PC_USER'"
    echo ""
    
    # Optional: Open dashboard in Termux browser
    if command -v termux-open-url &> /dev/null; then
        echo -e "${CYAN}🌐 Opening dashboard...${NC}"
        termux-open-url http://localhost:3000
    fi
else
    echo -e "${RED}❌ Tunnel failed!${NC}"
    exit 1
fi
