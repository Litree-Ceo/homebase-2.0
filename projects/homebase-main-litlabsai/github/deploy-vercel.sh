#!/bin/bash
# 🚀 Deploy to Vercel (Easiest option for Next.js)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Build the project first
echo -e "${YELLOW}🔨 Building project...${NC}"
cd "$(dirname "$0")"
pnpm install
pnpm build:web

# Deploy
echo -e "${YELLOW}🚀 Deploying...${NC}"
cd apps/web
vercel --prod

echo -e "${GREEN}✅ Deployed!${NC}"
