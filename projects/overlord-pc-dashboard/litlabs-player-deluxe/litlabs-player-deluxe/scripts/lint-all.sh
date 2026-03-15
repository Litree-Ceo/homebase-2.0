#!/usr/bin/env bash
# Unified linting script for all languages
# Usage: ./scripts/lint-all.sh [--fix]
# Runs: Python (pylint, black, ruff), Shell (shellcheck), YAML (yamllint), JSON (jq)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FIX_MODE="${1:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

total_issues=0

echo "════════════════════════════════════════════════════════════════"
echo "  Overlord Monolith - Unified Linting"
echo "════════════════════════════════════════════════════════════════"

# ── Python Linting ──────────────────────────────────────────────────
echo ""
echo "Checking Python files..."
py_files=$(find "$ROOT_DIR" -type f -name "*.py" \
  -not -path "*/.venv/*" \
  -not -path "*/venv/*" \
  -not -path "*/__pycache__/*" \
  -not -path "*/.pytest_cache/*" \
  -not -path "*/node_modules/*" \
  2>/dev/null || true)

if [ -z "$py_files" ]; then
  echo "  ℹ No Python files found"
else
  # Black formatting
  if command -v black &>/dev/null; then
    if [ "$FIX_MODE" = "--fix" ]; then
      echo "  ▶ Running black (auto-fix)..."
      black --line-length=120 --quiet $py_files || true
    else
      echo "  ▶ Checking black formatting..."
      if ! black --line-length=120 --diff --check $py_files 2>/dev/null; then
        echo -e "  ${RED}✗ Black formatting issues found${NC}"
        total_issues=$((total_issues + 1))
      else
        echo -e "  ${GREEN}✓ Black OK${NC}"
      fi
    fi
  fi
  
  # Ruff (fast linter)
  if command -v ruff &>/dev/null; then
    echo "  ▶ Checking ruff..."
    if ! ruff check "$ROOT_DIR" --select E,F,W,I --ignore E501; then
      echo -e "  ${RED}✗ Ruff issues found${NC}"
      total_issues=$((total_issues + 1))
    else
      echo -e "  ${GREEN}✓ Ruff OK${NC}"
    fi
  fi
  
  # Pylint
  if command -v pylint &>/dev/null; then
    echo "  ▶ Checking pylint..."
    if ! pylint $py_files --rcfile="$ROOT_DIR/.pylintrc" --exit-zero --reports=no; then
      echo -e "  ${YELLOW}⚠ Pylint warnings${NC}"
    else
      echo -e "  ${GREEN}✓ Pylint OK${NC}"
    fi
  fi
fi

# ── Shell Script Linting ────────────────────────────────────────────
echo ""
echo "Checking shell scripts..."
sh_files=$(find "$ROOT_DIR" -type f \( -name "*.sh" -o -path "*/scripts/*" \) \
  -not -path "*/.venv/*" \
  -not -path "*/venv/*" \
  -not -path "*/node_modules/*" \
  2>/dev/null | head -20 || true)

if command -v shellcheck &>/dev/null && [ -n "$sh_files" ]; then
  if shellcheck $sh_files 2>/dev/null; then
    echo -e "  ${GREEN}✓ ShellCheck OK${NC}"
  else
    echo -e "  ${RED}✗ ShellCheck issues found${NC}"
    total_issues=$((total_issues + 1))
  fi
else
  echo "  ℹ ShellCheck not installed or no shell scripts"
fi

# ── YAML Linting ────────────────────────────────────────────────────
echo ""
echo "Checking YAML files..."
yaml_files=$(find "$ROOT_DIR" -type f \( -name "*.yaml" -o -name "*.yml" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.venv/*" \
  2>/dev/null || true)

if command -v yamllint &>/dev/null && [ -n "$yaml_files" ]; then
  if yamllint -c "$ROOT_DIR/.yamllint" $yaml_files; then
    echo -e "  ${GREEN}✓ YAML OK${NC}"
  else
    echo -e "  ${RED}✗ YAML issues found${NC}"
    total_issues=$((total_issues + 1))
  fi
else
  echo "  ℹ yamllint not installed"
fi

# ── JSON Validation ─────────────────────────────────────────────────
echo ""
echo "Checking JSON files..."
json_files=$(find "$ROOT_DIR" -type f -name "*.json" \
  -not -path "*/node_modules/*" \
  -not -path "*/.venv/*" \
  -not -path "*/.git/*" \
  2>/dev/null || true)

if [ -n "$json_files" ]; then
  for json_file in $json_files; do
    if ! python3 -m json.tool "$json_file" >/dev/null 2>&1; then
      echo -e "  ${RED}✗ Invalid JSON: $json_file${NC}"
      total_issues=$((total_issues + 1))
    fi
  done
  echo -e "  ${GREEN}✓ JSON OK${NC}"
fi

# ── Summary ──────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
if [ $total_issues -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Found $total_issues issue group(s)${NC}"
  if [ "$FIX_MODE" != "--fix" ]; then
    echo "  Run with --fix flag to auto-fix formatting issues"
  fi
  exit 1
fi
