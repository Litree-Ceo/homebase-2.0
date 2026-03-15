#!/bin/bash
# HomeBase 2.0 Setup Script (Linux/Bash)

echo "🚀 Setting up HomeBase 2.0..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20.x"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9.15.4
else
    echo "✅ pnpm found: $(pnpm --version)"
fi

# Navigate to github directory
cd github || exit

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check Azure Functions
if ! command -v func &> /dev/null; then
    echo "⚠️  Azure Functions Core Tools not found. Install with: npm install -g azure-functions-core-tools@4 --unsafe-perm true"
else
    echo "✅ Azure Functions Core Tools found: $(func --version)"
fi

echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm dev        - Start all services in development mode"
echo "  pnpm dev:web    - Start web app only"
echo "  pnpm dev:api    - Start API only"
echo "  pnpm build      - Build all packages"
echo "  pnpm lint       - Run linting"
echo ""
echo "🎯 Run 'pnpm dev' to start development!"
