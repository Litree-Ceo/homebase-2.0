#!/bin/bash
# 📁 Setup Shared Storage in Termux
# Access Termux files from PC via USB cable

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║      SHARED STORAGE SETUP FOR TERMUX         ║"
echo "║      Access Files via USB Cable              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Request storage permissions
echo "📱 Requesting storage permissions..."
echo "   Please grant storage access when prompted!"
echo ""

termux-setup-storage

echo ""
echo "⏳ Waiting for permission grant (check your phone)..."
sleep 5

# Check if storage was granted
if [ -d ~/storage ]; then
    echo "✓ Storage access granted!"
else
    echo "❌ Storage access denied or timeout"
    echo "   Run this script again and approve the prompt"
    exit 1
fi

echo ""
echo "📁 Creating symlinks for easy access..."

# Create projects shortcut in shared storage
# The original method of creating a symlink directly into ~/storage/shared is not supported.
# Instead, we will move projects TO shared storage and symlink FROM shared storage TO ~/projects.

# Create shared project directory if it doesn't exist
mkdir -p ~/storage/shared/Termux-Projects-Actual

# Move existing ~/projects content to shared storage
# Only if ~/projects is a directory and not empty
if [ -d ~/projects ] && [ "$(ls -A ~/projects)" ]; then
    echo "Moving existing projects from ~/projects to shared storage..."
    mv ~/projects/* ~/storage/shared/Termux-Projects-Actual/
    rmdir ~/projects
fi

# Create symlink from ~/projects to the shared storage location
if [ ! -L ~/projects ]; then
    ln -s ~/storage/shared/Termux-Projects-Actual ~/projects
    echo "✓ Created symlink: ~/projects -> ~/storage/shared/Termux-Projects-Actual"
fi

echo ""
echo "💡 Your projects are now physically located in:"
echo "   ~/storage/shared/Termux-Projects-Actual"
echo "   But you can continue to access them in Termux via: ~/projects"
echo ""
echo "💻 When connecting via USB to PC, look for 'Termux-Projects-Actual'"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        SHARED STORAGE READY                  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "📱 Access from Phone (File Manager):"
echo "   1. Open any file manager app"
echo "   2. Look for 'Internal Storage' or 'Phone Storage'"
echo "   3. Navigate to: Termux-Projects"
echo "   4. You'll see your projects folder!"
echo ""
echo "💻 Access from PC via USB:"
echo ""
echo "   Windows:"
echo "   1. Connect phone to PC with USB cable"
echo "   2. Unlock phone and select 'File Transfer' mode"
echo "   3. Open 'This PC' → Your phone name"
echo "   4. Navigate to: Internal Storage/Termux-Projects"
echo "   5. You can now drag/drop files!"
echo ""
echo "   Mac:"
echo "   1. Install Android File Transfer:"
echo "      https://www.android.com/filetransfer/"
echo "   2. Connect phone via USB"
echo "   3. Navigate to Termux-Projects"
echo ""
echo "   Linux:"
echo "   1. Install mtp tools: sudo apt install mtp-tools"
echo "   2. Connect phone"
echo "   3. Mount with: sudo mtpfs /mnt/phone"
echo ""
echo "📂 Available Shortcuts:"
echo "   ~/storage/shared/Termux-Projects → ~/projects"
echo "   ~/storage/shared → Phone's internal storage"
echo "   ~/storage/downloads → Phone's Downloads folder"
echo "   ~/storage/dcim → Phone's Camera folder"
echo ""
echo "💡 Tips:"
echo "   - Edit files directly from PC (works great with VS Code!)"
echo "   - No network needed - works offline"
echo "   - Changes are instant (no sync delay)"
echo "   - Great for large file transfers"
echo ""
echo "⚠️  Note: Termux must be running for files to be accessible"
echo ""
echo "✅ Shared storage setup complete!"
echo ""
