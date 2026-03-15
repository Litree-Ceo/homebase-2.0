#!/bin/bash
# Overlord AI Agent Launcher
# Starts the enhanced AI Agent server

PORT=8080
USE_AGENT_SERVER=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        --agent-server)
            USE_AGENT_SERVER=1
            shift
            ;;
        -h|--help)
            echo "Overlord AI Agent Launcher"
            echo ""
            echo "Usage: ./start-agent.sh [options]"
            echo ""
            echo "Options:"
            echo "    -p, --port <number>  Set the port (default: 8080)"
            echo "    --agent-server       Use agent_server.py instead of server.py"
            echo "    -h, --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "    ./start-agent.sh                    # Start on default port 8080"
            echo "    ./start-agent.sh -p 3000            # Start on port 3000"
            echo "    ./start-agent.sh --agent-server     # Use alternative server"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

clear
echo ""
echo "    ╔══════════════════════════════════════════════════════════════════╗"
echo "    ║           🤖 OVERLORD AI AGENT v2.0 - ENHANCED                   ║"
echo "    ║                                                                  ║"
echo "    ║  Starting server...                                              ║"
echo "    ╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Choose server file
if [ "$USE_AGENT_SERVER" -eq 1 ]; then
    SERVER_FILE="agent_server.py"
else
    SERVER_FILE="server.py"
fi

# Check if file exists
if [ ! -f "$SERVER_FILE" ]; then
    echo "❌ Error: $SERVER_FILE not found!"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python not found!"
    exit 1
fi

echo "✓ Using Python: $PYTHON_CMD"
echo "✓ Server file: $SERVER_FILE"
echo "✓ Port: $PORT"
echo ""

# Start server
export PORT=$PORT
$PYTHON_CMD "$SERVER_FILE"
