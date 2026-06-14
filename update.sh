#!/bin/bash

# Nonsa Travels - Routine Update/Deploy Script for Hostinger VPS
# Run this from /var/www/nonsatravels after pushing changes to origin/main:
#   cd /var/www/nonsatravels && ./update.sh

set -e

APP_DIR="/var/www/nonsatravels"
APP_NAME="nonsatravels-api"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "${APP_DIR}"

echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd "${APP_DIR}/client"
npm install
npm run build

echo -e "${YELLOW}Step 3: Installing backend dependencies...${NC}"
cd "${APP_DIR}/server"
npm install --production

echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
npx prisma migrate deploy

echo -e "${YELLOW}Step 5: Reloading backend (zero downtime)...${NC}"
pm2 reload "${APP_NAME}"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Checking logs (Ctrl+C to exit)..."
pm2 logs "${APP_NAME}" --lines 20
