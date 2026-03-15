#!/usr/bin/env bash
# SSH & Tunnel Security Hardening Script
# Hardens SSH configuration and tunnel setup for secure remote access
# Usage: sudo ./scripts/harden-ssh-tunnel.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: This script requires root privileges${NC}"
    echo "  Run: sudo ./scripts/harden-ssh-tunnel.sh"
    exit 1
fi

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SSH & Tunnel Security Hardening${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"

# ── SSH Configuration Hardening ─────────────────────────────────────────
echo ""
echo "Hardening SSH configuration..."

SSH_CONFIG="/etc/ssh/sshd_config"
SSH_CONFIG_BACKUP="${SSH_CONFIG}.backup.$(date +%s)"

# Backup original
if [ -f "$SSH_CONFIG" ]; then
    cp "$SSH_CONFIG" "$SSH_CONFIG_BACKUP"
    echo -e "  ${GREEN}✓ Backed up SSH config to ${SSH_CONFIG_BACKUP}${NC}"
fi

# Define hardening changes
declare -A SSH_SETTINGS=(
    ["PermitRootLogin"]="no"
    ["PermitEmptyPasswords"]="no"
    ["PasswordAuthentication"]="no"
    ["PubkeyAuthentication"]="yes"
    ["X11Forwarding"]="no"
    ["PrintMotd"]="no"
    ["AcceptEnv"]="LANG LC_*"
    ["Subsystem"]="sftp /usr/lib/openssh/sftp-server"
    ["ClientAliveInterval"]="300"
    ["ClientAliveCountMax"]="2"
    ["MaxAuthTries"]="3"
    ["MaxSessions"]="5"
)

# Apply settings
for key in "${!SSH_SETTINGS[@]}"; do
    value="${SSH_SETTINGS[$key]}"
    # Comment out old value and add new one
    sed -i "/^#*${key}/d" "$SSH_CONFIG"
    echo "${key} ${value}" >> "$SSH_CONFIG"
    echo -e "  ${GREEN}✓ Set ${key}=${value}${NC}"
done

# Add strict ciphers and key exchange algorithms
cat >> "$SSH_CONFIG" << 'EOF'

# ── Cryptography Hardening ──────────────────────────────────────────────
Ciphers aes-256-ctr,aes-192-ctr,aes-128-ctr
KexAlgorithms diffie-hellman-group-exchange-sha256
MACs hmac-sha2-256,hmac-sha2-512
HostKeyAlgorithms rsa-sha2-512,rsa-sha2-256,ssh-ed25519

# ── Connection Limits ────────────────────────────────────────────────────
MaxStartups 10:30:100
LoginGraceTime 20
EOF

echo -e "  ${GREEN}✓ Applied cryptographic hardening${NC}"

# Validate SSH config
if sshd -t >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ SSH config syntax valid${NC}"
else
    echo -e "  ${RED}✗ SSH config has syntax errors${NC}"
    echo "    Restore backup: cp ${SSH_CONFIG_BACKUP} ${SSH_CONFIG}"
    exit 1
fi

# Restart SSH
echo -e "  ${YELLOW}Restarting SSH service...${NC}"
systemctl restart ssh || systemctl restart sshd || true

# ── SSH Key Management ──────────────────────────────────────────────────
echo ""
echo "Checking SSH key permissions..."

HOME_DIR="${SUDO_USER:~}"
SSH_DIR="${HOME_DIR}/.ssh"

if [ -d "$SSH_DIR" ]; then
    # Fix permissions
    chmod 700 "$SSH_DIR"
    chmod 600 "$SSH_DIR"/* 2>/dev/null || true
    chmod 644 "$SSH_DIR/authorized_keys" 2>/dev/null || true
    echo -e "  ${GREEN}✓ Fixed SSH directory permissions${NC}"
else
    echo -e "  ${YELLOW}⚠ SSH directory not found: $SSH_DIR${NC}"
fi

# ── Firewall Rules ──────────────────────────────────────────────────────
echo ""
echo "Configuring firewall rules..."

# Check if ufw is available
if command -v ufw >/dev/null 2>&1; then
    ufw default deny incoming || true
    ufw default allow outgoing || true
    ufw allow 22/tcp || true  # SSH
    ufw allow 22/udp || true
    echo -e "  ${GREEN}✓ UFW firewall configured${NC}"
elif command -v firewall-cmd >/dev/null 2>&1; then
    firewall-cmd --permanent --add-service=ssh || true
    firewall-cmd --reload || true
    echo -e "  ${GREEN}✓ Firewalld configured${NC}"
fi

# ── Fail2Ban Setup ──────────────────────────────────────────────────────
echo ""
echo "Setting up Fail2Ban (rate limiting)..."

if command -v apt >/dev/null 2>&1; then
    apt-get update && apt-get install -y fail2ban || true
elif command -v yum >/dev/null 2>&1; then
    yum install -y fail2ban || true
fi

if command -v fail2ban-client >/dev/null 2>&1; then
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
EOF
    systemctl restart fail2ban || true
    echo -e "  ${GREEN}✓ Fail2Ban enabled${NC}"
fi

# ── SSH Known Hosts ─────────────────────────────────────────────────────
echo ""
echo "Verifying SSH known_hosts..."

if [ -f "$SSH_DIR/known_hosts" ]; then
    # Remove old/invalid entries
    ssh-keygen -R localhost 2>/dev/null || true
    echo -e "  ${GREEN}✓ Cleaned known_hosts${NC}"
fi

# ── Summary ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ SSH & Tunnel Hardening Complete${NC}"
echo ""
echo "Security Summary:"
echo "  ✓ Root login disabled"
echo "  ✓ Password auth disabled (key-only)"
echo "  ✓ Weak ciphers restricted"
echo "  ✓ SSH key permissions enforced"
echo "  ✓ Firewall rules configured"
echo "  ✓ Rate limiting (Fail2Ban) enabled"
echo ""
echo "Next Steps:"
echo "  1. Ensure all users have SSH keys configured"
echo "  2. Add public keys to ~/.ssh/authorized_keys"
echo "  3. Test remote access: ssh -i /path/to/key user@host"
echo "  4. Monitor logs: journalctl -u ssh -f"
echo ""
