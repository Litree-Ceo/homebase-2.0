#!/bin/bash

# Overlord Monolith - Intelligent Startup Script
# Detects structure (Monolith vs Flat) and starts available services

ROOT_DIR="$(dirname "$(readlink -f "$0")")"
cd "$ROOT_DIR" || exit

echo "🚀 IGNITION SEQUENCE STARTED..."

# --- 1. DETECT ARCHITECTURE ---
if [ -d "modules/dashboard" ]; then
    echo "✅ Detected Monolith Structure (modules/ present)"
    DASHBOARD_DIR="modules/dashboard"
    SOCIAL_DIR="modules/social"
    GRID_DIR="modules/grid"
elif [ -f "server.py" ] && [ -f "requirements.txt" ]; then
    echo "⚠️ Detected Flat Structure (No modules folder)"
    # Assume we are in Dashboard root or a mixed flat repo
    DASHBOARD_DIR="."
    # Social might be in specific folder or missing
    if [ -d "social" ]; then SOCIAL_DIR="social"; else SOCIAL_DIR=""; fi
    if [ -d "grid" ]; then GRID_DIR="grid"; else GRID_DIR=""; fi
else
    echo "❌ ERROR: Could not detect valid Overlord structure!"
    echo "   Expected 'modules/' folder OR 'server.py' in root."
    ls
    exit 1
fi

# --- 2. KILL OLD PROCESSES ---
echo "🛑 Clearing old processes..."
pkill -f "python server.py" >/dev/null 2>&1
pkill -f "python -m http.server 3000" >/dev/null 2>&1
sleep 1

# --- 3. START SERVICES ---

# Function to start process in background (or tmux if needed, but background is simpler for basic usage)
start_service() {
    name=$1
    dir=$2
    cmd=$3
    port=$4
    
    if [ -z "$dir" ] || [ ! -d "$dir" ]; then
        if [ "$name" != "Dashboard" ]; then # Dashboard might be "."
             echo "⚠️  Skipping $name (folder not found)"
             return
        fi
    fi

    echo "🔌 Starting $name in $dir..."
    (
        cd "$dir" || return
        if [ -f ".venv/bin/activate" ]; then source .venv/bin/activate; fi
        nohup $cmd > "$name.log" 2>&1 &
        echo "   👉 $name started (Port $port) - Log: $dir/$name.log"
    )
}

# Start Dashboard
start_service "Dashboard" "$DASHBOARD_DIR" "python server.py" 8080

# Start Social
if [ -n "$SOCIAL_DIR" ]; then
    start_service "Social" "$SOCIAL_DIR" "python -m http.server 3000" 3000
fi

# Start Grid
if [ -n "$GRID_DIR" ]; then
    start_service "Grid" "$GRID_DIR" "python server.py" 5000
fi

echo "✅ STARTUP COMPLETE"
echo "   - Dashboard: http://localhost:8080"
echo "   - Social:    http://localhost:3000"
echo "   - Grid:      http://localhost:5000"
echo "   (Background processes running. Use 'pkill -f python' to stop)"
