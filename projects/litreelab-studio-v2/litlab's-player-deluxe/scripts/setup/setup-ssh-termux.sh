#!/bin/bash
# 🔐 Setup SSH Server on Termux
# Allows you to access Termux files from PC via SFTP/SSH

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║      SSH SERVER SETUP FOR TERMUX             ║"
echo "║      Access Phone Files from PC              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Install OpenSSH
echo "📦 Installing OpenSSH..."
pkg update
pkg install openssh -y
echo "✓ OpenSSH installed!"

# Generate SSH keys if they don't exist
if [ ! -f ~/.ssh/id_rsa ]; then
    echo ""
    echo "🔑 Generating SSH key pair..."
    mkdir -p ~/.ssh
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo "✓ SSH keys generated!"
fi

# Set password for SSH
echo ""
echo "🔐 Set SSH password for user '$(whoami)':"
passwd

# Start SSH server
echo ""
echo "🚀 Starting SSH server..."
sshd

# Get IP address
IP_ADDRESS=$(ifconfig wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | head -n 1)
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS=$(ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
fi

# Default SSH port in Termux is 8022
SSH_PORT=8022

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           SSH SERVER RUNNING                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "📱 Connection Info:"
echo "   IP Address: $IP_ADDRESS"
echo "   Port:       $SSH_PORT"
echo "   Username:   $(whoami)"
echo "   Password:   (what you just set)"
echo ""
echo "💻 Connect from PC:"
echo ""
echo "   PowerShell/CMD:"
echo "   ssh $(whoami)@$IP_ADDRESS -p $SSH_PORT"
echo ""
echo "   FileZilla (GUI):"
echo "   Host: sftp://$IP_ADDRESS"
echo "   Port: $SSH_PORT"
echo "   Username: $(whoami)"
echo "   Password: (what you just set)"
echo ""
echo "   WinSCP (Windows):"
echo "   Download: https://winscp.net"
echo "   Protocol: SFTP"
echo "   Host: $IP_ADDRESS"
echo "   Port: $SSH_PORT"
echo ""
echo "📁 Access projects folder:"
echo "   Remote path: /data/data/com.termux/files/home/projects"
echo "   Or simply: ~/projects"
echo ""
echo "⚡ Auto-Start on Boot:"
echo "   mkdir -p ~/.termux/boot"
echo "   echo 'sshd' > ~/.termux/boot/03-sshd"
echo "   chmod +x ~/.termux/boot/03-sshd"
echo ""
echo "📝 Useful Commands:"
echo "   Start SSH:   sshd"
echo "   Stop SSH:    pkill sshd"
echo "   Check:       pgrep sshd (shows PID if running)"
echo "   Change pwd:  passwd"
echo ""
echo "🔒 Security Tips:"
echo "   1. Only start SSH when you need it"
echo "   2. Use a strong password"
echo "   3. Only connect on trusted networks (home WiFi)"
echo "   4. Stop SSH after use: pkill sshd"
echo ""

# Create auto-start script
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/03-sshd << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
# Auto-start SSH server on boot
sshd
EOF
chmod +x ~/.termux/boot/03-sshd

echo "✅ SSH server configured and running!"
echo ""
echo "🔗 Quick Test:"
echo "   From PC: ssh $(whoami)@$IP_ADDRESS -p $SSH_PORT"
echo ""
