#!/bin/bash
# ============================================
# LiTreeLabStudio SOCIAL - Live Development Mode
# ============================================

set -e

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  LiTreeLabStudio SOCIAL — Live Development Mode      ║"
echo "╔═══════════════════════════════════════════════╗"
echo ""
echo "  Watching for changes to:"
echo "    • index.html"
echo "    • style.css"
echo "    • app.js"
echo ""
echo -e "\033[1;33m  Server: http://localhost:3000\033[0m"
echo -e "\033[0;37m  Press Ctrl+C to stop\033[0m"
echo ""

FILES=("index.html" "style.css" "app.js")
PORT=3000
SERVER_PID=""

# Start server function
start_server() {
    echo -e "\033[1;33m→ Starting server...\033[0m"
    
    # Kill any process on port 3000
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 0.5
    
    # Start Python HTTP server
    python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
    SERVER_PID=$!
    sleep 0.5
    
    echo -e "\033[1;32m✓ Server running (PID: $SERVER_PID)\033[0m"
    echo ""
}

# Stop server function
stop_server() {
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        sleep 0.2
    fi
}

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "\033[1;33m✓ Dev watch stopped\033[0m"
    stop_server
    exit 0
}

trap cleanup INT TERM

# Initial server start
start_server

# Open browser (if on Linux with GUI)
if command -v xdg-open >/dev/null 2>&1; then
    sleep 1
    xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
fi

# Check if inotifywait is available
if command -v inotifywait >/dev/null 2>&1; then
    # Use inotifywait for efficient file watching
    echo -e "\033[1;36m👁️  Watching for file changes...\033[0m"
    echo ""
    
    while true; do
        CHANGED=$(inotifywait -q -e modify --format "%f" "${FILES[@]}" 2>/dev/null)
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "\033[1;33m🔄 CHANGE DETECTED: $CHANGED\033[0m"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        stop_server
        start_server
        
        echo -e "\033[1;32m✓ Changes applied - refresh browser\033[0m"
        echo ""
    done
else
    # Fallback to polling if inotifywait not available
    echo -e "\033[1;36m👁️  Watching for file changes (polling mode)...\033[0m"
    echo ""
    
    declare -A LAST_MODIFIED
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            LAST_MODIFIED[$file]=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file")
        fi
    done
    
    while true; do
        sleep 0.5
        
        for file in "${FILES[@]}"; do
            if [ -f "$file" ]; then
                CURRENT=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file")
                
                if [ "${LAST_MODIFIED[$file]}" != "$CURRENT" ]; then
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo -e "\033[1;33m🔄 CHANGE DETECTED: $file\033[0m"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    
                    LAST_MODIFIED[$file]=$CURRENT
                    
                    stop_server
                    start_server
                    
                    echo -e "\033[1;32m✓ Changes applied - refresh browser\033[0m"
                    echo ""
                fi
            fi
        done
    done
fi
