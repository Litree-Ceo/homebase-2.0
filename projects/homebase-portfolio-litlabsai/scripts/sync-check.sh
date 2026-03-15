#!/bin/bash
#
# Synchronization Check Script
# Verifies data and configuration consistency across environments
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[PASS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[FAIL]${NC} $1"; }

ERRORS=0
WARNINGS=0

echo "====================================="
echo "HomeBase Pro Synchronization Check"
echo "====================================="
echo ""

# 1. Check environment files
echo "Checking environment files..."
if [ -f ".env.example" ]; then
    log_info ".env.example exists"
else
    log_error ".env.example missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".env.production" ]; then
    log_info ".env.production exists"
else
    log_error ".env.production missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".env.staging" ]; then
    log_info ".env.staging exists"
else
    log_error ".env.staging missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 2. Check CI/CD configuration
echo "Checking CI/CD configuration..."
if [ -d ".github/workflows" ]; then
    WORKFLOW_COUNT=$(ls .github/workflows/*.yml 2>/dev/null | wc -l)
    log_info "Found $WORKFLOW_COUNT workflow files"
    
    # Check specific workflows
    if [ -f ".github/workflows/ci.yml" ]; then
        log_info "CI workflow configured"
    else
        log_warn "CI workflow missing"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ -f ".github/workflows/deploy-production.yml" ]; then
        log_info "Production deploy workflow configured"
    else
        log_warn "Production deploy workflow missing"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    log_error ".github/workflows directory missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 3. Check Firebase configuration
echo "Checking Firebase configuration..."
if [ -f "firebase.json" ]; then
    log_info "firebase.json exists"
else
    log_error "firebase.json missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "firestore.rules" ]; then
    log_info "firestore.rules exists"
else
    log_warn "firestore.rules missing"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 4. Check dependency consistency
echo "Checking dependency consistency..."
if [ -f "package.json" ]; then
    log_info "package.json exists"
    
    # Check for outdated packages
    if command -v npm &> /dev/null; then
        OUTDATED_JSON=$(npm outdated --json 2>/dev/null || true)
        ACTIONABLE_OUTDATED=$(node -e '
const input = process.argv[1] || "{}";
let data;
try {
  data = JSON.parse(input || "{}");
} catch {
  console.log("0");
  process.exit(0);
}
const entries = Object.values(data || {});
const actionable = entries.filter((item) => item && item.current && item.wanted && item.current !== item.wanted);
console.log(String(actionable.length));
' "$OUTDATED_JSON")

        if [ "$ACTIONABLE_OUTDATED" -eq 0 ]; then
            log_info "Dependencies are current within configured version ranges"
        else
            log_warn "Some dependencies have pending in-range updates"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    log_error "package.json missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "functions/package.json" ]; then
    log_info "Functions package.json exists"
else
    log_warn "Functions package.json missing"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 5. Check source code consistency
echo "Checking source code..."
if [ -d "src" ]; then
    FILE_COUNT=$(find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | wc -l)
    log_info "Found $FILE_COUNT source files"
else
    log_error "src directory missing"
    ERRORS=$((ERRORS + 1))
fi

# Check for environment config
if [ -f "src/config/environment.js" ]; then
    log_info "Environment configuration module exists"
else
    log_warn "Environment configuration module missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for sync hook
if [ -f "src/hooks/useSync.js" ]; then
    log_info "Synchronization hook exists"
else
    log_warn "Synchronization hook missing"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 6. Check build artifacts
echo "Checking build configuration..."
if [ -d "dist" ]; then
    log_info "dist directory exists (previous build)"
else
    log_warn "No previous build found"
fi

echo ""

# 7. Check Git status
echo "Checking Git status..."
if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    log_info "On branch: $BRANCH"
    
    UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        log_info "Working directory clean"
    else
        log_warn "$UNCOMMITTED uncommitted changes"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if branch is synced with remote
    if git rev-parse --abbrev-ref --symbolic-full-name @{u} &> /dev/null; then
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u})
        BASE=$(git merge-base @ @{u})
        
        if [ "$LOCAL" = "$REMOTE" ]; then
            log_info "Branch is synchronized with remote"
        elif [ "$LOCAL" = "$BASE" ]; then
            log_warn "Branch is behind remote (needs pull)"
            WARNINGS=$((WARNINGS + 1))
        elif [ "$REMOTE" = "$BASE" ]; then
            log_warn "Branch is ahead of remote (needs push)"
            WARNINGS=$((WARNINGS + 1))
        else
            log_error "Branch has diverged from remote"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    log_warn "Not a Git repository"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "====================================="
echo "Synchronization Check Summary"
echo "====================================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Checks passed with warnings${NC}"
    exit 0
else
    echo -e "${RED}✗ Checks failed${NC}"
    exit 1
fi
