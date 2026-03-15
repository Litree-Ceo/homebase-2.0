#!/bin/bash
# Microsoft 365 Local Testing Setup
# Run this to set up local development environment for testing

set -e

echo "🧪 Microsoft 365 Integration - Local Testing Setup"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "${YELLOW}ℹ️  .env.local not found. Creating from template...${NC}"
    cp .env.example .env.local
    echo "${GREEN}✓ .env.local created${NC}"
fi

echo ""
echo "${BLUE}📝 Configuration for Local Testing${NC}"
echo "================================="
echo ""
echo "To test Microsoft 365 OAuth locally, update .env.local with:"
echo ""
echo "  MICROSOFT_CLIENT_ID=your_client_id"
echo "  MICROSOFT_CLIENT_SECRET=your_client_secret"
echo "  MICROSOFT_TENANT_ID=your_tenant_id"
echo "  MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft"
echo ""

# Check if env vars are set
if grep -q "your_client_id_here\|your_client_secret_here" .env.local; then
    echo "${YELLOW}⚠️  Microsoft 365 environment variables not configured${NC}"
    echo ""
    echo "Steps to configure:"
    echo "  1. Go to https://portal.azure.com"
    echo "  2. Create app registration 'LitLabs AI Copilot'"
    echo "  3. Copy Client ID, Client Secret, Tenant ID"
    echo "  4. Edit .env.local and replace the values"
    echo "  5. Set redirect URI to: http://localhost:3000/api/auth/callback/microsoft"
    echo ""
else
    echo "${GREEN}✓ Microsoft 365 environment variables configured${NC}"
fi

echo ""
echo "${BLUE}🚀 Starting Local Development Server${NC}"
echo "======================================"
echo ""
echo "npm run dev"
echo ""
echo "Server will start on: http://localhost:3000"
echo "OAuth callback will be: http://localhost:3000/api/auth/callback/microsoft"
echo ""
echo "Test steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Try signing in with Microsoft"
echo "  3. You should be redirected to Microsoft login"
echo "  4. After login, you should be back on your site"
echo "  5. Check Firebase console for user data"
echo ""
echo "${GREEN}Ready to test? Run: npm run dev${NC}"
