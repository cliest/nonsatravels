# Hostinger VPS Deployment Guide — Nonsa Travels

**Stack:** React (Vite) + Node.js (Express) + PostgreSQL + Prisma + Nginx + PM2

---

## Prerequisites

- Hostinger VPS (KVM 1 or higher — 1 vCPU / 2GB RAM minimum)
- Domain name pointed at your VPS IP (A record)
- SSH access to your VPS

---

## Step 1: Initial VPS Setup

### 1.1 Connect via SSH

```bash
ssh root@your-vps-ip
```

### 1.2 Update system and install Node.js 20

```bash
apt update && apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verify
node -v && npm -v

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx
```

### 1.3 Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE nonsatravels;
CREATE USER nonsauser WITH ENCRYPTED PASSWORD 'choose-a-strong-password';
GRANT ALL PRIVILEGES ON DATABASE nonsatravels TO nonsauser;
\q
EOF
```

Your `DATABASE_URL` will be:
```
postgresql://nonsauser:choose-a-strong-password@localhost:5432/nonsatravels
```

---

## Step 2: Upload Your Code

### 2.1 Create application directory

```bash
mkdir -p /var/www/nonsatravels
cd /var/www/nonsatravels
```

### 2.2 Upload via Git (recommended)

```bash
git clone https://github.com/yourusername/nonsatravels.git .
```

Or upload via SFTP (FileZilla → connect with your VPS IP + root credentials → upload to `/var/www/nonsatravels`).

---

## Step 3: Configure the Server (Backend)

### 3.1 Create server environment file

```bash
cd /var/www/nonsatravels/server
nano .env
```

Paste and fill in your values:

```env
PORT=5000
NODE_ENV=production

# PostgreSQL
DATABASE_URL=postgresql://nonsauser:choose-a-strong-password@localhost:5432/nonsatravels

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-64-character-random-string-here

# Your domain
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Resend email (https://resend.com)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=Nonsa Travels <bookings@yourdomain.com>
REPLY_TO_EMAIL=support@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### 3.2 Install dependencies and run migrations

```bash
cd /var/www/nonsatravels/server

# Install production dependencies
npm install --production

# Install Prisma CLI (dev dep needed for migration commands)
npm install

# Run database migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed initial data (first time only)
node src/seed.js
```

---

## Step 4: Build the Frontend

### 4.1 Create frontend production environment

```bash
cd /var/www/nonsatravels/client
nano .env.production
```

```env
VITE_API_URL=https://yourdomain.com/api

# Google OAuth (optional — add your own Client ID)
# VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4.2 Build

```bash
npm install
npm run build
```

The built files will be at `/var/www/nonsatravels/client/dist`.

---

## Step 5: Start the Backend with PM2

### 5.1 Create logs directory

```bash
mkdir -p /var/www/nonsatravels/logs
```

### 5.2 Start with PM2

The `ecosystem.config.cjs` is already in the project root. Start it from the project root:

```bash
cd /var/www/nonsatravels
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list
pm2 save

# Configure PM2 to restart on server reboot
pm2 startup
# Run the command it prints (it'll look like: sudo env PATH=... pm2 startup ...)
```

### 5.3 Verify the server is running

```bash
pm2 status
curl http://localhost:5000/api/health
```

You should see `{"success":true,"message":"Server is running",...}`.

---

## Step 6: Configure Nginx

### 6.1 Create site config

```bash
nano /etc/nginx/sites-available/nonsatravels
```

Paste this — replace `yourdomain.com` with your actual domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve React frontend
    location / {
        root /var/www/nonsatravels/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache static assets aggressively
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Proxy Socket.IO for real-time chat
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 6.2 Enable site and test

```bash
# Enable the site
ln -s /etc/nginx/sites-available/nonsatravels /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 7: Enable HTTPS (Free SSL)

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx config to redirect HTTP → HTTPS.

Test auto-renewal:
```bash
certbot renew --dry-run
```

---

## Step 8: Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

ufw status
```

---

## Step 9: DNS Setup (Hostinger hPanel)

Go to **hPanel → Domains → DNS Zone** and set:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | Your VPS IP | 14400 |
| A | www | Your VPS IP | 14400 |

DNS propagation takes up to 24 hours (usually 5–30 min).

---

## Updating the Deployment

When you push new code:

```bash
cd /var/www/nonsatravels

# Pull latest code
git pull origin main

# Rebuild frontend
cd client
npm install
npm run build

# Update backend
cd ../server
npm install

# Run any new migrations
npx prisma migrate deploy

# Restart backend (zero downtime)
pm2 reload nonsatravels-api
```

---

## Useful Commands

```bash
# PM2
pm2 status                    # App status
pm2 logs nonsatravels-api     # Live logs
pm2 reload nonsatravels-api   # Zero-downtime restart
pm2 monit                     # CPU/memory monitor

# PostgreSQL
sudo -u postgres psql nonsatravels   # Connect to DB
\dt                                  # List tables
\q                                   # Quit

# Nginx
nginx -t                      # Test config
systemctl reload nginx        # Reload config
tail -f /var/log/nginx/error.log

# Check API health
curl https://yourdomain.com/api/health
```

---

## Troubleshooting

**Backend won't start:**
```bash
pm2 logs nonsatravels-api --lines 50
```

**Database connection error:**
```bash
# Verify PostgreSQL is running
systemctl status postgresql

# Test connection
sudo -u postgres psql -c "SELECT 1;"

# Check DATABASE_URL in server/.env is correct
```

**502 Bad Gateway from Nginx:**
```bash
# Backend probably isn't running
pm2 status
pm2 start ecosystem.config.cjs --env production
```

**Migrations fail:**
```bash
cd /var/www/nonsatravels/server
npx prisma migrate status
npx prisma migrate deploy
```

---

## Cost Summary

| Service | Cost |
|---------|------|
| Hostinger VPS KVM 1 | ~$5.99/month |
| PostgreSQL (local on VPS) | Free |
| Let's Encrypt SSL | Free |
| **Total** | **~$6/month** |
