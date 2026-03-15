#!/bin/bash
# Quick start script for Cooking AI Agent (Linux/Mac)

echo "🍳 Cooking AI Agent - Quick Start"
echo "=================================="

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 could not be found"
    exit 1
fi

# Run the python quickstart script
python3 quickstart.py
exit 0
