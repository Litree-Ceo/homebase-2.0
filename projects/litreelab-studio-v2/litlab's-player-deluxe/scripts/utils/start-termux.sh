#!/bin/bash
# LIT-CMD Themed Startup for Overlord Monolith on Termux

# Colors
R='\033[0;31m'; G='\033[0;32m'; B='\033[0;34m'
P='\033[0;35m'; C='\033[0;36m'; W='\033[1;37m'; NC='\033[0m'

clear
echo -e "${R}O${G}V${B}E${P}R${C}L${R}O${G}R${B}D${NC} ${P}M${C}O${R}N${G}O${B}L${P}I${C}T${R}H${NC}"
echo -e "${P}~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~${NC}"

termux-wake-lock
cd ~/Overlord-Monolith

# Dashboard
echo -e "${C}[DASHBOARD]${NC} Starting Python server..."
cd modules/dashboard
pm2 delete overlord-dashboard 2>/dev/null || true
pm2 start python --name "overlord-dashboard" -- server.py

# Social
echo -e "${C}[SOCIAL]${NC} Starting Node.js server..."
cd ../social
pm2 delete overlord-social 2>/dev/null || true
pm2 start pnpm --name "overlord-social" -- run dev

pm2 save
sleep 3

echo -e "${G}✅ OVERLORD ONLINE${NC}"
echo -e "${W}Dashboard:${NC} http://localhost:5000"
echo -e "${W}Social:${NC} http://localhost:5001"
pm2 status
