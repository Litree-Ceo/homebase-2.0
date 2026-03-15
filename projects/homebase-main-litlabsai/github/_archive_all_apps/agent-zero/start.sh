#!/bin/bash
# Agent Zero Enhanced - Easy launcher script

echo "🚀 Agent Zero Enhanced Launcher"
echo "==============================="

# Check if we're in Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Running inside Docker container"
    python main_enhanced.py
else
    echo "💻 Running on host system"
    
    # Check if Docker is available
    if command -v docker &> /dev/null; then
        echo "🐳 Docker detected - would you like to run in container? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "🏃 Starting Docker container..."
            docker-compose down && docker-compose up --build
        else
            echo "🚀 Running directly with Python..."
            python main_enhanced.py
        fi
    else
        echo "🚀 Running directly with Python..."
        python main_enhanced.py
    fi
fi