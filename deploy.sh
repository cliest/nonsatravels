#!/bin/bash

# Nonsa Travels - Quick Deploy Script for Hostinger VPS
# Run this script after uploading files to /var/www/nonsatravels

set -e

echo "🚀 Starting Nonsa Travels Deployment..."

# Variables - UPDATE THESE
DOMAIN="yourdomain.com"
APP_DIR="/var/www/nonsatravels"
NODE_VERSION="20"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Step 2: Installing Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}Node.js $(node -v) installed${NC}"

echo -e "${YELLOW}Step 3: Installing PM2...${NC}"
npm install -g pm2

echo -e "${YELLOW}Step 4: Installing Nginx...${NC}"
apt install -y nginx

echo -e "${YELLOW}Step 5: Setting up application directory...${NC}"
mkdir -p ${APP_DIR}/logs
cd ${APP_DIR}

echo -e "${YELLOW}Step 6: Installing backend dependencies...${NC}"
cd ${APP_DIR}/server
npm install --production

echo -e "${YELLOW}Step 7: Building frontend...${NC}"
cd ${APP_DIR}/client
npm install
npm run build

echo -e "${YELLOW}Step 8: Configuring Nginx...${NC}"
# Copy nginx config
cp ${APP_DIR}/nginx.conf /etc/nginx/sites-available/nonsatravels

# Update domain in nginx config
sed -i "s/yourdomain.com/${DOMAIN}/g" /etc/nginx/sites-available/nonsatravels

# Enable site
ln -sf /etc/nginx/sites-available/nonsatravels /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

echo -e "${YELLOW}Step 9: Starting services...${NC}"
# Start/restart nginx
systemctl restart nginx
systemctl enable nginx

# Start Node.js app with PM2
cd ${APP_DIR}
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${YELLOW}Step 10: Setting up firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Update ${APP_DIR}/server/.env with your credentials"
echo -e "2. Update ${APP_DIR}/client/.env.production with VITE_API_URL=https://${DOMAIN}/api"
echo -e "3. Rebuild frontend: cd ${APP_DIR}/client && npm run build"
echo -e "4. Restart backend: pm2 restart all"
echo -e "5. Setup SSL: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo -e "Useful commands:"
echo -e "  pm2 status        - Check app status"
echo -e "  pm2 logs          - View logs"
echo -e "  pm2 restart all   - Restart app"
echo ""
echo -e "${GREEN}Your site will be available at: http://${DOMAIN}${NC}"
