#!/bin/bash
# ================================================
# OVERLORD SOCIAL HUB - CROSS-PLATFORM PRO LAUNCH
# PM2 for WSL/Linux/Bash • Works on Windows too
# ================================================

PROJECT_DIR="${PWD}"
[[ ! -f package.json ]] && PROJECT_DIR="/mnt/c/Users/litre/Desktop/Overlord-Monolith/modules/social"
cd "$PROJECT_DIR" || { echo "❌ Social Hub folder not found at $PROJECT_DIR!"; exit 1; }

PORT=3000
APP_NAME="overlord-social"

# ========================================
# Get IP Address
# ========================================
WSL_IP=$(ip addr show eth0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d/ -f1)
[[ -z "$WSL_IP" ]] && WSL_IP=$(hostname -I | awk '{print $1}')
[[ -z "$WSL_IP" ]] && WSL_IP="192.168.0.77"

echo ""
echo "════════════════════════════════════════"
echo "🚀 OVERLORD SOCIAL HUB PRO LAUNCH"
echo "════════════════════════════════════════"
echo ""
echo "📍 Project Dir : $PROJECT_DIR"
echo "🌐 WSL/Linux IP: $WSL_IP"
echo "📱 Phone URL   : http://$WSL_IP:$PORT"
echo "🖥️  Local URL   : http://localhost:$PORT"
echo ""

# ========================================
# Check for PM2
# ========================================
if command -v pm2 >/dev/null 2>&1; then
    echo "✅ PM2 found - using cross-platform pro mode"
    echo ""
    
    # Kill old PM2 instance
    pm2 delete "$APP_NAME" 2>/dev/null || true
    sleep 1
    
    # Start with PM2
    echo "🚀 Starting with PM2..."
    pm2 start npm --name "$APP_NAME" -- start
    pm2 save
    
    sleep 2
    
    echo ""
    echo "✅ Social Hub is LIVE via PM2!"
    echo ""
    echo "════════════════════════════════════════"
    echo "PM2 Commands:"
    echo "   pm2 status                    → See status"
    echo "   pm2 logs $APP_NAME             → Live logs"
    echo "   pm2 monit                     → Dashboard"
    echo "   pm2 restart $APP_NAME          → Restart"
    echo "   pm2 stop $APP_NAME             → Stop"
    echo "   pm2 delete $APP_NAME           → Remove"
    echo "════════════════════════════════════════"
    echo ""
    
else
    echo "⚠️  PM2 not found - falling back to nohup"
    echo "   (For best experience: npm i -g pm2)"
    echo ""
    
    # Kill old npm instance
    pkill -f "node.*dist/server.js" 2>/dev/null || true
    sleep 1
    
    # Fallback: nohup
    echo "🚀 Starting Social Hub server..."
    nohup npm start > social.log 2>&1 &
    echo $! > social.pid
    
    sleep 3
    
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" 2>/dev/null | grep -q "[23]."; then
        echo "✅ Social Hub is LIVE!"
    else
        echo "⚠️  Server may not have started. Check logs:"
        tail -n 5 social.log
    fi
    
    echo ""
    echo "════════════════════════════════════════"
    echo "Useful commands (nohup mode):"
    echo "   tail -f social.log              → Live logs"
    echo "   kill \$(cat social.pid)          → Stop"
    echo "════════════════════════════════════════"
    echo ""
fi
