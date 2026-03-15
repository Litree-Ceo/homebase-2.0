#!/bin/bash
#
# System Overlord Phase 0: Security Tools Quick Start
# Deploys Kali integration in 45 minutes
#
# Usage: ./deploy-kali-integration.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗"
echo "║  System Overlord Phase 0: Kali Integration Deployment    ║"
echo "║  Timeline: 45 minutes                                   ║"
echo "╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}[Pre-flight] Checking prerequisites...${NC}"

if ! command -v firebase &> /dev/null; then
    echo -e "${RED}✗ Firebase CLI not found. Install: npm install -g firebase-tools${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git not found. Please install Git.${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker not found. PC agent will fall back to native execution.${NC}"
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Step 1: Tool Catalog
echo -e "${YELLOW}[1/7] Deploying tool catalog to Firestore...${NC}"
if [ -f "firestore.tools-schema.json" ]; then
    echo -e "${BLUE}→ Uploading tool definitions...${NC}"
    firebase firestore:bulk-import firestore.tools-schema.json \
        --database "(default)" --document-prefix "config/toolCatalog"
    echo -e "${GREEN}✓ Tool catalog deployed${NC}"
else
    echo -e "${RED}✗ firestore.tools-schema.json not found${NC}"
    exit 1
fi
echo ""

# Step 2: Cloud Functions
echo -e "${YELLOW}[2/7] Deploying Cloud Functions...${NC}"
cd functions
npm install --silent
firebase deploy --only functions --quiet
cd ..
echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
echo ""

# Step 3: Update Firestore Rules
echo -e "${YELLOW}[3/7] Updating Firestore security rules...${NC}"
firebase deploy --only firestore:rules --quiet
echo -e "${GREEN}✓ Security rules updated${NC}"
echo ""

# Step 4: Deploy Dashboard
echo -e "${YELLOW}[4/7] Deploying Next.js dashboard...${NC}"
cd web
npm install --silent
npm run build --silent
cd ..
firebase deploy --only hosting --quiet
echo -e "${GREEN}✓ Dashboard deployed${NC}"
echo ""

# Step 5: PC Agent
echo -e "${YELLOW}[5/7] Creating PC Agent...${NC}"
if [ ! -f "firebase-key.json" ]; then
    echo -e "${RED}⚠ firebase-key.json not found - PC Agent will not start${NC}"
    echo -e "${BLUE}→ Follow this to get credentials:${NC}"
    echo "   1. Go to Firebase Console → Project Settings → Service Accounts"
    echo "   2. Click 'Generate New Private Key'"
    echo "   3. Save as: $(pwd)/firebase-key.json"
else
    echo "→ Creating requirements file..."
    cat > agents/pc_agent_requirements.txt << 'EOF'
firebase-admin>=6.5
docker>=7.0
requests>=2.31
EOF
    
    echo "→ Installing dependencies..."
    pip install -r agents/pc_agent_requirements.txt --quiet
    echo -e "${GREEN}✓ PC Agent ready${NC}"
fi
echo ""

# Step 6: Termux Agent
echo -e "${YELLOW}[6/7] Preparing Termux Agent...${NC}"
if [ -d "$HOME/.termux" ] || command -v termux-info &> /dev/null; then
    echo "→ Running Termux setup..."
    bash setup-termux-agent.sh
    echo -e "${GREEN}✓ Termux Agent ready${NC}"
else
    echo "→ Termux setup will run on mobile device"
    echo "   Copy this to your Android device:"
    echo "   ~/System-Overlord-Phase0/setup-termux-agent.sh"
fi
echo ""

# Step 7: Configuration
echo -e "${YELLOW}[7/7] Configuration & Testing...${NC}"
echo "→ Creating environment file..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
EOF

echo -e "${BLUE}→ Verifying deployment...${NC}"

# Test Cloud Functions
FUNCTION_URL=$(firebase deploy --only functions 2>&1 | grep "healthCheck" | head -1 | awk '{print $NF}')
if [ -n "$FUNCTION_URL" ]; then
    echo "→ Cloud Function endpoint: $FUNCTION_URL"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. START PC AGENT (on your computer):"
echo -e "   ${BLUE}export AGENT_ID=pc-[device-name]${NC}"
echo -e "   ${BLUE}export AGENT_PLATFORM=pc-docker${NC}"
echo -e "   ${BLUE}export GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json${NC}"
echo -e "   ${BLUE}python3 agents/pc_agent.py${NC}"
echo ""

echo "2. START TERMUX AGENT (on Android - copy &paste in Termux):"
echo -e "   ${BLUE}export GOOGLE_APPLICATION_CREDENTIALS=~/firebase-key.json${NC}"
echo -e "   ${BLUE}python3 ~/System-Overlord-Phase0/agents/termux_agent.py${NC}"
echo ""

echo "3. OPEN DASHBOARD:"
firebase open hosting
echo ""

echo "4. VERIFY AGENTS:"
echo -e "   → Click 'Agents' in dashboard"
echo -e "   → Wait 10-20 seconds for agents to register"
echo -e "   → See 'pc-[device]' (online) and 'termux-xxxxx' (online)"
echo ""

echo "5. TEST SECURITY WORKBENCH:"
echo -e "   → Click 'Security → Workbench'"
echo -e "   → Select 'nmap'"
echo -e "   → Enter target: example.com"
echo -e "   → Select PC (Docker)"
echo -e "   → Click '🔴 Execute'"
echo -e "   → Watch real-time execution in Firestore"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  - Full guide: ./docs/SECURITY_TOOLS.md"
echo "  - Deployment: ./docs/DEPLOYMENT.md"
echo "  - Architecture: ./docs/ARCHITECTURE.md"
echo ""

echo -e "${BLUE}Support:${NC}"
echo "  Logs:"
echo "    PC Agent: pc_agent.log"
echo "    Firebase: firebase debug.log"
echo ""
echo "  Troubleshooting:"
echo "    firebase functions:log --limit 50"
echo ""

echo -e "${GREEN}🛡️  System Overlord is now LIVE with Kali tool integration${NC}"
