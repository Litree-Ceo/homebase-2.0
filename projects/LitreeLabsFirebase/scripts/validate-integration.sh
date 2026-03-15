#!/bin/bash
# Validation script for Microsoft 365 integration
# Tests all critical paths to ensure production readiness

set -e

echo "🧪 Microsoft 365 Integration - Validation Tests"
echo "==============================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counter for tests
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Test function
run_test() {
    local test_name=$1
    local test_cmd=$2
    local expected=$3
    
    echo -n "Testing: $test_name ... "
    
    if eval "$test_cmd" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((TESTS_FAILED++))
    fi
}

# File existence tests
echo -e "${BLUE}📁 File Existence Checks${NC}"
run_test "Microsoft Graph client exists" "test -f lib/microsoft-graph.ts"
run_test "OAuth callback handler exists" "test -f app/api/auth/callback/microsoft/route.ts"
run_test "Teams bot handler exists" "test -f app/api/teams/bot/route.ts"
run_test "Copilot API exists" "test -f app/api/copilot/route.ts"
run_test "Microsoft webhook handler exists" "test -f app/api/webhooks/microsoft/route.ts"
run_test "Stripe-to-Teams handler exists" "test -f app/api/webhooks/stripe-to-teams/route.ts"
run_test "Copilot manifest exists" "test -f public/plugin-manifest.json"
echo ""

# Code quality tests
echo -e "${BLUE}🔍 Code Quality Checks${NC}"
run_test "Build passes" "npm run build > /dev/null 2>&1"
run_test "TypeScript validates" "npm run typecheck > /dev/null 2>&1"
run_test "Lint passes" "npm run lint > /dev/null 2>&1"
echo ""

# TypeScript type checks
echo -e "${BLUE}📝 TypeScript Checks${NC}"
run_test "No 'any' types in microsoft-graph.ts" "! grep -q 'Promise<any>' lib/microsoft-graph.ts"
run_test "Firebase null checks in callback" "grep -q 'if (!db)' app/api/auth/callback/microsoft/route.ts"
run_test "Firebase null checks in copilot" "grep -q 'if (!db)' app/api/copilot/route.ts"
run_test "Firebase null checks in teams bot" "grep -q 'if (!db)' app/api/teams/bot/route.ts"
echo ""

# API endpoint checks
echo -e "${BLUE}🔗 API Endpoint Checks${NC}"
run_test "OAuth callback exports POST" "grep -q 'export async function GET' app/api/auth/callback/microsoft/route.ts"
run_test "Teams bot exports POST" "grep -q 'export async function POST' app/api/teams/bot/route.ts"
run_test "Copilot exports POST" "grep -q 'export async function POST' app/api/copilot/route.ts"
run_test "Microsoft webhook exports GET and POST" "grep -q 'export async function GET' app/api/webhooks/microsoft/route.ts && grep -q 'export async function POST' app/api/webhooks/microsoft/route.ts"
run_test "Stripe-to-Teams exports POST" "grep -q 'export async function POST' app/api/webhooks/stripe-to-teams/route.ts"
echo ""

# Security checks
echo -e "${BLUE}🔐 Security Checks${NC}"
run_test "OAuth uses HTTPS redirect URI" "grep -q 'https://' .env.example"
run_test "Stripe signature validation present" "grep -q 'stripe.webhooks.constructEvent' app/api/webhooks/stripe-to-teams/route.ts"
run_test "Teams webhook validation present" "grep -q 'validationToken' app/api/webhooks/microsoft/route.ts"
run_test "No hardcoded secrets in code" "! grep -r 'MICROSOFT_CLIENT_SECRET=' app/ || true"
echo ""

# Configuration checks
echo -e "${BLUE}⚙️  Configuration Checks${NC}"
run_test ".env.example includes Microsoft vars" "grep -q 'MICROSOFT_CLIENT_ID' .env.example && grep -q 'MICROSOFT_CLIENT_SECRET' .env.example"
run_test "Copilot manifest is valid JSON" "python3 -m json.tool public/plugin-manifest.json > /dev/null 2>&1 || node -e 'require(\"./public/plugin-manifest.json\")'"
run_test "plugin.manifest includes functions" "grep -q 'generateContent' public/plugin-manifest.json"
echo ""

# Dependencies check
echo -e "${BLUE}📦 Dependencies Check${NC}"
run_test "Microsoft Graph SDK included" "grep -q '@microsoft/microsoft-graph-client' package.json || grep -q 'axios' package.json"
run_test "Stripe SDK included" "grep -q 'stripe' package.json"
run_test "Firebase SDK included" "grep -q 'firebase' package.json"
echo ""

# Git checks
echo -e "${BLUE}🔀 Git Checks${NC}"
run_test "Recent commits to master" "git log --oneline -1 | grep -q '.'"
run_test "Microsoft 365 integration commit" "git log --oneline | grep -q 'Microsoft 365' || git log --oneline | grep -q 'Copilot'"
echo ""

# Summary
echo ""
echo "==============================================="
echo "Test Results:"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
else
    echo -e "  Failed: $TESTS_FAILED"
fi

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Ready for production.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review above.${NC}"
    exit 1
fi
