#!/data/data/com.termux/files/usr/bin/bash
# One-Command Termux Setup for Overlord Dashboard
# Run this: curl -fsSL http://192.168.0.77:8888/setup-termux.sh | bash

echo "🚀 Overlord Dashboard - Termux Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install required packages
echo "📦 Installing packages..."
pkg update -y && pkg install -y openssh

# Generate SSH key if it doesn't exist
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "🔑 Generating SSH key..."
    ssh-keygen -t ed25519 -C "termux-overlord" -f ~/.ssh/id_ed25519 -N ""
fi

# Show the public key
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 YOUR SSH PUBLIC KEY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ~/.ssh/id_ed25519.pub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ NEXT STEP:"
echo "   1. Copy the key above (including 'ssh-ed25519')"
echo "   2. On PC, run: .\add-termux-key.ps1"
echo "   3. Paste the key when asked"
echo "   4. Back here, run: overlord-connect"
echo ""

# Create the connection script
mkdir -p ~/bin
cat > ~/bin/overlord-connect << 'SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
PC_USER="litre"
PC_IP="192.168.0.77"
PROJECT_DIR="${OVERLORD_PROJECT_DIR:-/c/Users/litre/Desktop/Overlord-Monolith}"

echo "🔗 Connecting to Overlord PC..."

# Kill existing connections
pkill -f "ssh.*$PC_USER@$PC_IP" 2>/dev/null

# Test connection
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $PC_USER@$PC_IP "exit" 2>/dev/null; then
    echo "❌ Cannot connect! Did you run .\add-termux-key.ps1 on PC?"
    exit 1
fi

echo "✅ Connected!"
echo ""
echo "Choose an option:"
echo "  1) Create tunnel (access dashboard & ports)"
echo "  2) SSH into PC (terminal access)"
echo "  3) Mount PC files (edit locally)"
read -p "Choice [1-3]: " choice

case $choice in
    1)
        echo "🔗 Creating tunnel..."
        ssh -f -N -L 3000:localhost:3000 -L 8080:localhost:8080 \
            -o ServerAliveInterval=30 $PC_USER@$PC_IP
        echo "✅ Tunnel active!"
        echo "   Dashboard: http://localhost:3000"
        echo "   Code-Server: http://localhost:8080"
        termux-open-url http://localhost:3000 2>/dev/null
        ;;
    2)
        echo "🖥️  SSHing into PC..."
        ssh $PC_USER@$PC_IP
        ;;
    3)
        if ! command -v sshfs &> /dev/null; then
            echo "Installing sshfs..."
            pkg install -y sshfs-ng
        fi
        mkdir -p ~/overlord
        sshfs $PC_USER@$PC_IP:"$PROJECT_DIR" ~/overlord
        echo "✅ Mounted to ~/overlord"
        echo "   cd ~/overlord && nano server.py"
        ;;
esac
SCRIPT

chmod +x ~/bin/overlord-connect

# Add to PATH
if ! grep -q 'export PATH=$PATH:~/bin' ~/.bashrc 2>/dev/null; then
    echo 'export PATH=$PATH:~/bin' >> ~/.bashrc
fi

echo "🎉 Setup complete!"
echo ""
echo "📱 You can now:"
echo "   • Run: overlord-connect"
echo "   • Or use browser: https://vscode.dev/tunnel/overlord-dashboard"
