#!/bin/bash
# One-command deploy script for Termux

echo "🚀 Deploying HomeBase Pro..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Run this script from the homebase-portfolio directory"
    exit 1
fi

# Pull latest
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Failed to pull from main branch${NC}"
    exit 1
}

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install || {
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
}

# Build
echo -e "${YELLOW}🔨 Building...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

# Verify dist folder
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ folder not found after build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""
echo "Build output in 'dist/' folder ($(du -sh dist | cut -f1))"
echo ""
echo "Deploy options:"
echo "  1. Firebase: firebase deploy"
echo "  2. GitHub Pages: git add dist && git commit -m 'deploy' && git push"
echo "  3. Manual: Upload dist/ folder to your host"
