#!/bin/bash
# Setup script for Overlord Dashboard with HTTPS
# This script configures Nginx with Let's Encrypt SSL certificates

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-}"
EMAIL="${2:-}"
OVERLORD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "Overlord Dashboard HTTPS Setup"
echo "=========================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

# Validate inputs
if [[ -z "$DOMAIN" ]]; then
    echo -e "${RED}Usage: $0 <domain> <email>${NC}"
    echo "Example: $0 overlord.example.com admin@example.com"
    exit 1
fi

if [[ -z "$EMAIL" ]]; then
    echo -e "${RED}Email is required for Let's Encrypt${NC}"
    exit 1
fi

echo -e "${GREEN}Setting up HTTPS for domain: $DOMAIN${NC}"

# Install dependencies
echo "[1/8] Installing dependencies..."
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Create webroot for Let's Encrypt
echo "[2/8] Setting up webroot..."
mkdir -p /var/www/certbot

# Copy and configure Nginx
echo "[3/8] Configuring Nginx..."
cp "$OVERLORD_DIR/nginx/nginx.conf" /etc/nginx/sites-available/overlord

# Update domain in config
sed -i "s/server_name _;/server_name $DOMAIN;/g" /etc/nginx/sites-available/overlord
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/overlord

# Enable site
ln -sf /etc/nginx/sites-available/overlord /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "[4/8] Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "[5/8] Reloading Nginx..."
systemctl reload nginx

# Obtain SSL certificate
echo "[6/8] Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --staging  # Remove this for production!

# Update Nginx config with SSL paths
sed -i "s|# SSL Configuration|SSL Configuration|g" /etc/nginx/sites-available/overlord

# Test final configuration
echo "[7/8] Testing final configuration..."
nginx -t

# Restart Nginx
echo "[8/8] Restarting Nginx..."
systemctl restart nginx

# Enable auto-renewal
echo "Setting up certificate auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Your Overlord Dashboard is now available at:"
echo "  HTTPS: https://$DOMAIN"
echo ""
echo "Test the configuration:"
echo "  curl -I https://$DOMAIN/api/health"
echo ""
echo "View logs:"
echo "  tail -f /var/log/nginx/overlord_access.log"
echo "  tail -f /var/log/nginx/overlord_error.log"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "1. Update your config.yaml to use host: 127.0.0.1"
echo "2. Change the API key before production use"
echo "3. Set up firewall rules: ufw allow 443/tcp"
echo "4. Remove --staging flag from certbot for production"
echo ""

# Create renewal hook for Nginx
cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# Test SSL
echo "Testing SSL configuration..."
sleep 2
curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" || echo -e "${YELLOW}Note: SSL test may fail until DNS propagates${NC}"
