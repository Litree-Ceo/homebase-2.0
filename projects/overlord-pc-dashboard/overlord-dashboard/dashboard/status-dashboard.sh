#!/bin/bash
if pgrep -f "server.py" > /dev/null; then
    echo "✅ Dashboard is RUNNING"
    WSL_IP=$(ip addr show eth0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d/ -f1 || hostname -I | awk '{print $1}')
    echo "📱 Phone: http://$WSL_IP:8080"
else
    echo "❌ Dashboard is NOT running"
fi
curl -s -o /dev/null -w "Server response: %{http_code}\n" http://localhost:8080 || echo "Server not responding"
