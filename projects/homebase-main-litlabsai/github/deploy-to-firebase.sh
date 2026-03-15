#!/bin/bash
# 🚀 One-click deploy script for Firebase
# Run this in Google Cloud Shell

set -e  # Exit on error

echo "🚀 Starting Firebase Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in Cloud Shell
if [ -z "$CLOUD_SHELL" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not in Cloud Shell. Some features may not work.${NC}"
fi

# Verify gcloud
echo -e "${YELLOW}📋 Checking gcloud...${NC}"
gcloud --version | head -1

# Set project
echo -e "${YELLOW}🔧 Setting project...${NC}"
gcloud config set project studio-6082148059-d1fec
firebase use studio-6082148059-d1fec 2>/dev/null || true

# Install deps
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd "$(dirname "$0")"
pnpm install

# Build
echo -e "${YELLOW}🔨 Building...${NC}"
pnpm build:web

# Deploy
echo -e "${YELLOW}🚀 Deploying to Firebase...${NC}"
firebase deploy --only hosting

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your site should be live at: https://studio-6082148059-d1fec.web.app${NC}"
