#!/data/data/com.termux/files/usr/bin/bash
# termux-ctx-install.sh
# Run once on Termux to install the `ctx` command globally
# Usage: bash ~/projects/Litlab-Player/scripts/termux-ctx-install.sh

REPO="$HOME/projects/Litlab-Player/scripts"
INSTALL_DIR="$HOME/.local/bin"

echo "Installing Termux commands..."

# Create bin dir if needed
mkdir -p "$INSTALL_DIR"

# ctx — paste project context into Gemini
cp "$REPO/ctx.sh" "$INSTALL_DIR/ctx"
chmod +x "$INSTALL_DIR/ctx"
echo "  ✅ ctx"

# litlab — control PC from Termux
cp "$REPO/litlabs.sh" "$INSTALL_DIR/litlab"
chmod +x "$INSTALL_DIR/litlab"
echo "  ✅ litlab"

# Add to PATH if not already there
SHELL_RC="$HOME/.bashrc"
if ! grep -q "$INSTALL_DIR" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Litlab Player ctx command" >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo "Added $INSTALL_DIR to PATH in $SHELL_RC"
fi

echo ""
echo "✅ Done! Restart Termux or run:  source ~/.bashrc"
echo ""
echo "Usage:"
echo "  ctx           → print project context to terminal"
echo "  ctx --copy    → also copy to clipboard (requires Termux:API)"
