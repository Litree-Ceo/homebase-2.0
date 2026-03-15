#!/data/data/com.termux/files/usr/bin/bash
# ctx — Dump Overlord project context for pasting into Gemini/AI
# Install: bash ~/projects/Overlord-Monolith/scripts/termux-ctx-install.sh
# Usage:   ctx          → print context
#          ctx --copy   → print + copy to clipboard

CONTEXT_FILE="$HOME/projects/Overlord-Monolith/GEMINI_CONTEXT.md"

if [ ! -f "$CONTEXT_FILE" ]; then
    echo "❌ Context file not found: $CONTEXT_FILE"
    echo "   Make sure the repo is cloned to ~/projects/Overlord-Monolith"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " OVERLORD CONTEXT — copy everything below this line"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat "$CONTEXT_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$1" == "--copy" ]]; then
    if command -v termux-clipboard-set &>/dev/null; then
        cat "$CONTEXT_FILE" | termux-clipboard-set
        echo "✅ Copied to clipboard — paste into Gemini"
    else
        echo "⚠️  termux-clipboard-set not found."
        echo "   Install: pkg install termux-api"
        echo "   Then enable Termux:API app in settings"
    fi
fi
