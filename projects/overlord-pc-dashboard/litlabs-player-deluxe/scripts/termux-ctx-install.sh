#!/data/data/com.termux/files/usr/bin/bash
# termux-ctx-install.sh
# Run once on Termux to install the `ctx` command globally
# Usage: bash ~/projects/Overlord-Monolith/scripts/termux-ctx-install.sh

REPO="$HOME/projects/litlabs-player-deluxe/scripts"
INSTALL_DIR="$HOME/.local/bin"

echo "Installing Termux commands..."

# Create bin dir if needed
mkdir -p "$INSTALL_DIR"

# ctx — paste project context into Gemini
cp "$REPO/ctx.sh" "$INSTALL_DIR/ctx"
chmod +x "$INSTALL_DIR/ctx"
echo "  ✅ ctx"

# overlord — control PC from Termux
cp "$REPO/overlord.sh" "$INSTALL_DIR/overlord"
chmod +x "$INSTALL_DIR/overlord"
echo "  ✅ overlord"

# Add to PATH if not already there
SHELL_RC="$HOME/.bashrc"
if ! grep -q "$INSTALL_DIR" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Overlord ctx command" >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo "Added $INSTALL_DIR to PATH in $SHELL_RC"
fi

echo ""
echo "✅ Done! Restart Termux or run:  source ~/.bashrc"
echo ""
echo "Usage:"
echo "  ctx           → print project context to terminal"
echo "  ctx --copy    → also copy to clipboard (requires Termux:API)"
