#!/bin/bash
# Validation script for Litrelab Docker setup

echo "🔍 Validating Litrelab Docker Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Check if Docker is running
echo -n "Checking Docker... "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker is running"
else
    echo -e "${RED}✗${NC} Docker is not running! Start Docker Desktop first."
    ((errors++))
fi

# Check required files exist
echo ""
echo "Checking required files..."

files=(
    "litreelab-backend/Dockerfile.backend"
    "litreelab-backend/Dockerfile.backend.dev"
    "litreelab-backend/pyproject.toml"
    "litreelab-backend/uv.lock"
    "litreelab-backend/main.py"
    "litreelab-studio/Dockerfile.frontend"
    "litreelab-studio/Dockerfile.frontend.dev"
    "litreelab-studio/package.json"
    "docker-compose.litrelab.yml"
    "docker-compose.litrelab.dev.yml"
)

for file in "${files[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ Missing!${NC}"
        ((errors++))
    fi
done

# Check if ports are available
echo ""
echo "Checking ports..."

for port in 8000 4321; do
    echo -n "  Port $port... "
    if lsof -Pi :$port -sTCP:LISTEN -t > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} Already in use!"
        ((warnings++))
    else
        echo -e "${GREEN}✓${NC} Available"
    fi
done

# Check Python version in pyproject.toml
echo ""
echo -n "Checking Python version alignment... "
python_version=$(grep "requires-python" litreelab-backend/pyproject.toml | grep -o "[0-9]\+\.[0-9]\+")
if [ "$python_version" == "3.12" ]; then
    echo -e "${GREEN}✓${NC} Python $python_version"
else
    echo -e "${YELLOW}⚠${NC} Python $python_version (expected 3.12)"
    ((warnings++))
fi

# Check Node version in package.json
echo -n "Checking Node version alignment... "
if grep -q "node.*22" litreelab-studio/package.json; then
    echo -e "${GREEN}✓${NC} Node 22"
else
    echo -e "${YELLOW}⚠${NC} Node version mismatch"
    ((warnings++))
fi

# Summary
echo ""
echo "=========================================="
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "You can now run:"
    echo "  make up    # Production"
    echo "  make dev   # Development"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings warning(s) found${NC}"
    echo "You can still proceed, but review warnings above."
    exit 0
else
    echo -e "${RED}❌ $errors error(s) found${NC}"
    echo "Please fix errors before proceeding."
    exit 1
fi
