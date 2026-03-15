#!/bin/bash
pkill -f "server.py" 2>/dev/null && echo "✅ Dashboard stopped" || echo "No running dashboard found"
rm -f dashboard.pid 2>/dev/null
