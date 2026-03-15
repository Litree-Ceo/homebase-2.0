#!/bin/bash
# Termux Setup Script for HomeBase Pro
# Run this in Termux to set up your development environment

set -e  # Exit on error
set -o pipefail  # Exit if pipe fails

echo "🚀 Setting up HomeBase Pro in Termux..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Error handler
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Update packages
echo -e "${YELLOW}📦 Updating packages...${NC}"
pkg update -y || handle_error "Failed to update packages"
pkg upgrade -y || handle_error "Failed to upgrade packages"

echo ""
echo -e "${YELLOW}📦 Installing essential packages...${NC}"
# Install essential packages
pkg install -y git nodejs-lts vim nano curl openssh || handle_error "Failed to install essential packages"

echo ""
echo -e "${YELLOW}🔍 Verifying Node.js installation...${NC}"
# Verify Node.js version
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    handle_error "Node.js 18+ required, but found $(node -v)"
fi
echo -e "${GREEN}✅ Node.js $(node -v) verified${NC}"
echo -e "${GREEN}✅ npm $(npm -v) verified${NC}"

echo ""
echo -e "${YELLOW}📦 Installing Firebase CLI globally...${NC}"
# Install Firebase CLI globally
npm install -g firebase-tools || handle_error "Failed to install Firebase CLI"

# Git configuration (you'll need to set these)
echo ""
echo -e "${YELLOW}⚠️  Configure Git with your credentials:${NC}"
echo "   git config --global user.name 'Your Name'"
echo "   git config --global user.email 'your@email.com'"

# Create projects directory
echo ""
echo -e "${YELLOW}📁 Creating projects directory...${NC}"
mkdir -p ~/projects || handle_error "Failed to create ~/projects directory"
cd ~/projects

echo ""
echo -e "${GREEN}✅ Setup complete! Next steps:${NC}"
echo ""
echo "1. Clone your repo:"
echo "   cd ~/projects"
echo "   git clone https://github.com/Litlabsai/homebase-portfolio.git"
echo "   cd homebase-portfolio"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start dev server:"
echo "   npm run dev"
echo ""
echo "4. Build for production:"
echo "   npm run build"
echo ""
echo -e "${GREEN}📱 Access your dev server at http://localhost:5173${NC}"
echo "   (Use 'ifconfig' to find your phone's IP for LAN access)"
echo ""
echo -e "${GREEN}Environment verification:${NC}"
echo "   Node: $(node -v)"
echo "   npm: $(npm -v)"
echo "   Git: $(git --version)"
echo ""
