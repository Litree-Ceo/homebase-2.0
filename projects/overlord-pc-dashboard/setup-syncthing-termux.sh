#!/bin/bash
# 🔄 Setup Syncthing on Termux for Real-Time Sync with PC
# Syncthing = Dropbox-like automatic syncing between devices

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║        SYNCTHING SETUP FOR TERMUX            ║"
echo "║        Real-Time Sync PC ↔ Phone             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Install Syncthing
echo "📦 Installing Syncthing..."
pkg update
pkg install syncthing -y

echo "✓ Syncthing installed!"
echo ""

# Create projects directory if it doesn't exist
mkdir -p ~/projects

echo "🔧 Starting Syncthing for first-time setup..."
echo ""
echo "⚠️  IMPORTANT: Keep this terminal open!"
echo ""

# Start Syncthing in background
syncthing &
SYNCTHING_PID=$!

echo "Waiting for Syncthing to initialize (10 seconds)..."
sleep 10

# Get device ID
DEVICE_ID=$(syncthing --device-id 2>/dev/null | head -n 1)

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           SETUP INSTRUCTIONS                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "📱 Your Termux Device ID:"
echo "   $DEVICE_ID"
echo ""
echo "🌐 Web Interface:"
echo "   1. Open browser on your phone"
echo "   2. Go to: http://127.0.0.1:8384"
echo "   3. The Syncthing web UI should open"
echo ""
echo "💻 Connect to PC:"
echo "   1. Install Syncthing on PC (use setup-syncthing-pc.ps1)"
echo "   2. On phone: Open http://127.0.0.1:8384"
echo "   3. Click 'Actions' → 'Show ID' → Copy your Device ID"
echo "   4. On PC: Open Syncthing web UI (http://127.0.0.1:8384)"
echo "   5. Click '+ Add Remote Device'"
echo "   6. Paste your phone's Device ID"
echo "   7. Under 'Sharing' tab, select 'projects' folder"
echo "   8. Save"
echo ""
echo "📁 Sync Folder Setup:"
echo "   1. In Syncthing web UI, click '+ Add Folder'"
echo "   2. Folder Label: 'Overlord Projects'"
echo "   3. Folder Path: /data/data/com.termux/files/home/projects"
echo "   4. Click 'Sharing' tab → Select your PC"
echo "   5. Save"
echo ""
echo "⚡ Auto-Start on Boot:"
echo "   Run these commands:"
echo "   mkdir -p ~/.termux/boot"
echo "   echo 'termux-wake-lock' > ~/.termux/boot/01-wake-lock"
echo "   echo 'syncthing &' > ~/.termux/boot/02-syncthing"
echo "   chmod +x ~/.termux/boot/*"
echo ""
echo "Press Ctrl+C to stop Syncthing, or press Enter to keep it running..."
read -r

echo ""
echo "✅ Syncthing is running!"
echo ""
echo "📝 Useful Commands:"
echo "   Start:  syncthing &"
echo "   Stop:   killall syncthing"
echo "   Status: pgrep syncthing (shows PID if running)"
echo "   Logs:   ~/.local/state/syncthing/syncthing.log"
echo ""
