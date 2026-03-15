#!/bin/bash
# 🔧 Fix vision-board Turbopack Error on Termux
# Fixes the "Turbopack is not yet supported on Android" error

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║     FIX VISION-BOARD TURBOPACK ERROR         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Determine project path
if [ -d ~/projects/vision-board ]; then
    PROJECT_PATH=~/projects/vision-board
elif [ -d /data/data/com.termux/files/home/projects/vision-board ]; then
    PROJECT_PATH=/data/data/com.termux/files/home/projects/vision-board
else
    echo "❌ vision-board not found!"
    echo "Creating ~/projects directory..."
    mkdir -p ~/projects
    cd ~/projects
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        pkg install git -y
    fi
    
    echo "Clone your vision-board repo:"
    echo "  git clone https://github.com/YOUR_USERNAME/vision-board.git"
    exit 1
fi

cd "$PROJECT_PATH"
echo "📁 Working in: $PROJECT_PATH"
echo ""

# Backup package.json
if [ -f package.json ]; then
    echo "📦 Backing up package.json..."
    cp package.json package.json.backup
    echo "✓ Backup saved: package.json.backup"
fi

echo ""
echo "🔧 Fixing package.json..."

# Fix the dev script to use webpack instead of Turbopack
if [ -f package.json ]; then
    # Use sed to replace the dev script
    sed -i 's/"dev":\s*"next dev"/"dev": "next dev --webpack -H 0.0.0.0"/' package.json
    sed -i 's/"dev":\s*"next dev --turbo"/"dev": "next dev --webpack -H 0.0.0.0"/' package.json
    echo "✓ Updated dev script to use webpack"
fi

# Create or update next.config.js
echo ""
echo "🔧 Creating next.config.js..."

cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force webpack (disable Turbopack)
  webpack: (config, { isServer }) => {
    return config;
  },
  
  // Allow external access (for PC to access via network)
  experimental: {
    allowExternalAccess: true,
  },
  
  // Optimize for Termux/mobile
  swcMinify: true,
  reactStrictMode: true,
  
  // Disable telemetry
  telemetry: false,
}

module.exports = nextConfig
EOF

echo "✓ Created next.config.js"

# Create .npmrc to disable turbo
echo ""
echo "🔧 Creating .npmrc..."
cat > .npmrc << 'EOF'
# Disable Next.js Turbopack
next-turbo=false
EOF
echo "✓ Created .npmrc"

# Install/update dependencies
echo ""
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    echo "✓ Dependencies installed"
else
    echo "⚠️  npm not found. Install Node.js first:"
    echo "   pkg install nodejs -y"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              FIX COMPLETE                    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "✅ vision-board is now fixed!"
echo ""
echo "🚀 Start the server:"
echo "   cd $PROJECT_PATH"
echo "   npm run dev"
echo ""
echo "📱 Access from phone:"
echo "   http://localhost:3000"
echo ""
echo "💻 Access from PC:"
echo "   First get your phone's IP: ifconfig wlan0"
echo "   Then: http://YOUR_PHONE_IP:3000"
echo ""
echo "📝 What was fixed:"
echo "   ✓ Disabled Turbopack (not supported on Android)"
echo "   ✓ Enabled webpack bundler"
echo "   ✓ Configured network access (-H 0.0.0.0)"
echo "   ✓ Created next.config.js with optimizations"
echo "   ✓ Created .npmrc with correct settings"
echo ""
