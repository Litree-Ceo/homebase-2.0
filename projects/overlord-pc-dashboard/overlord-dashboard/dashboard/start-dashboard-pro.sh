#!/bin/bash
# ================================================
# OVERLORD DASHBOARD - PRO STARTER (WSL + PHONE)
# ================================================

PROJECT_DIR="/mnt/c/Users/litre/Desktop/Overlord-Monolith/modules/dashboard"
LOGFILE="$PROJECT_DIR/server.log"
PORT=8080

cd "$PROJECT_DIR" || { echo "❌ Project folder not found!"; exit 1; }

# Activate venv
if [ -f .venv-wsl/bin/activate ]; then
    source .venv-wsl/bin/activate
else
    echo "❌ Virtual environment not found. Run: python3 -m venv .venv-wsl && source .venv-wsl/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Get fresh WSL IP
WSL_IP=$(ip addr show eth0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d/ -f1)
if [ -z "$WSL_IP" ]; then
    WSL_IP=$(hostname -I | awk '{print $1}')
fi

echo "=========================================="
echo "🚀 OVERLORD DASHBOARD PRO LAUNCH"
echo "=========================================="
echo "📍 Project : $PROJECT_DIR"
echo "🌐 WSL IP  : $WSL_IP"
echo "📱 Phone URL: http://$WSL_IP:$PORT"
echo "🖥️  Windows fallback: http://192.168.0.77:$PORT"
echo "=========================================="

# Patch server to 0.0.0.0 if needed
if grep -q "127.0.0.1" server.py; then
    echo "🔧 Patching server.py to allow external access..."
    sed -i 's/127.0.0.1/0.0.0.0/g' server.py
    sed -i 's/localhost/0.0.0.0/g' server.py
    echo "✅ Patched"
fi

# Kill old instance
pkill -f "server.py" 2>/dev/null || true
sleep 1

# Start fresh
echo "🚀 Starting server in background..."
nohup python server.py > "$LOGFILE" 2>&1 &
echo $! > dashboard.pid

sleep 2

if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|404"; then
    echo "✅ Dashboard is LIVE!"
else
    echo "⚠️  Server may not have started correctly. Check $LOGFILE"
    echo "Last 5 lines of log:"
    tail -n 5 "$LOGFILE"
fi

echo ""
echo "📋 Useful commands:"
echo "   ./stop-dashboard.sh     → Stop the dashboard"
echo "   ./status-dashboard.sh   → Quick status"
echo "   tail -f server.log      → Live logs"
