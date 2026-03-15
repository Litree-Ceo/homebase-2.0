#!/usr/bin/env bash
# Firebase Rules Validator
# Validates Firestore and Realtime Database rules for security issues
# Usage: ./scripts/validate-firebase-rules.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

echo "════════════════════════════════════════════════════"
echo "  Firebase Rules Security Audit"
echo "════════════════════════════════════════════════════"

# ── Check Firestore Rules ───────────────────────────────────────────────
echo ""
echo "Checking Firestore rules..."
FIRESTORE_RULES=$(find "$ROOT_DIR" -name "firestore.rules" -o -name "firestore.json" | head -5)

if [ -n "$FIRESTORE_RULES" ]; then
    while IFS= read -r rule_file; do
        echo "  ▶ Validating: $rule_file"
        
        # Check for wildcard match rules
        if grep -q 'match /.*/\|allow read, write\|== true' "$rule_file" 2>/dev/null; then
            echo -e "    ${RED}✗ CRITICAL: Permissive rules detected${NC}"
            echo "      - Wildcard matches or 'read, write: true' found"
            ISSUES=$((ISSUES + 1))
        fi
        
        # Check for authentication checks
        if grep -q 'request.auth' "$rule_file" 2>/dev/null; then
            echo -e "    ${GREEN}✓ Auth checks present${NC}"
        else
            echo -e "    ${YELLOW}⚠ No explicit auth checks found${NC}"
            ISSUES=$((ISSUES + 1))
        fi
    done <<< "$FIRESTORE_RULES"
else
    echo "  ℹ No Firestore rules found"
fi

# ── Check Realtime Database Rules ───────────────────────────────────────
echo ""
echo "Checking Realtime Database rules..."
RTDB_RULES=$(find "$ROOT_DIR" -name "database.rules.json" | head -5)

if [ -n "$RTDB_RULES" ]; then
    while IFS= read -r rule_file; do
        echo "  ▶ Validating: $rule_file"
        
        # Check for permissive rules
        if grep -q '".validate": true\|".write": true\|".read": true' "$rule_file" 2>/dev/null; then
            echo -e "    ${RED}✗ CRITICAL: Permissive rules detected${NC}"
            echo "      - .write: true or .read: true found"
            ISSUES=$((ISSUES + 1))
        fi
        
        # Check for auth validation
        if grep -q 'auth\|root.child' "$rule_file" 2>/dev/null; then
            echo -e "    ${GREEN}✓ Auth validation present${NC}"
        else
            echo -e "    ${YELLOW}⚠ No explicit auth checks${NC}"
        fi
        
        # Validate JSON structure
        if python3 -m json.tool "$rule_file" >/dev/null 2>&1; then
            echo -e "    ${GREEN}✓ Valid JSON${NC}"
        else
            echo -e "    ${RED}✗ Invalid JSON syntax${NC}"
            ISSUES=$((ISSUES + 1))
        fi
    done <<< "$RTDB_RULES"
else
    echo "  ℹ No Realtime Database rules found"
fi

# ── Summary ─────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All Firebase rules validated${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ISSUES security issue(s)${NC}"
    echo ""
    echo "Security Recommendations:"
    echo "  1. Require authentication for all data access"
    echo "  2. Use specific match rules, avoid wildcards"
    echo "  3. Validate user IDs match request.auth.uid"
    echo "  4. Test rules with Firebase Emulator"
    echo "  5. Enable Firebase Audit Logging"
    exit 1
fi
