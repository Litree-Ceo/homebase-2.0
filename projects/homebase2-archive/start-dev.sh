#!/bin/bash
# HomeBase 2.0 Development Startup Script

echo "?? Starting HomeBase 2.0 Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "? Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Azure Functions Core Tools is installed
if ! command -v func &> /dev/null; then
    echo "??  Azure Functions Core Tools not found."
    echo "Install with: npm install -g azure-functions-core-tools@4 --unsafe-perm true"
fi

# Install client dependencies
echo "?? Installing client dependencies..."
cd client
npm install

# Install API dependencies
echo "?? Installing API dependencies..."
cd ../api
npm install

# Start both services
echo "?? Starting development servers..."
cd ..

# Start API in background
echo "Starting API on http://localhost:7071..."
cd api && func start &
API_PID=$!

# Start client
echo "Starting client on http://localhost:3000..."
cd ../client && npm run dev

# Cleanup on exit
trap "kill $API_PID" EXIT
