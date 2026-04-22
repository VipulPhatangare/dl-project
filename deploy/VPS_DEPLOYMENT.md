# VPS Deployment Guide (Port 6161 + Domain)

This guide deploys your project to:
- **Domain:** `aichatbot.vipulphatangare.site`
- **Backend port:** `6161`
- **Frontend:** static build served by Nginx
- **Backend process manager:** PM2
- **SSL:** Let's Encrypt (Certbot)

## 1) DNS setup

In your domain DNS panel:
1. Create an **A record**
   - Host: `aichatbot`
   - Value: `YOUR_VPS_PUBLIC_IP`
2. Wait for DNS propagation.

Verify from local machine:
- `nslookup aichatbot.vipulphatangare.site`

## 2) Prepare VPS

Assuming Ubuntu 22.04+.

1. SSH into VPS:
- `ssh <user>@<vps-ip>`

2. Install system packages:
- `sudo apt update`
- `sudo apt install -y nginx git curl ufw`

3. Install Node.js 22 LTS:
- `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -`
- `sudo apt install -y nodejs`

4. Install PM2 globally:
- `sudo npm install -g pm2`

5. Open firewall ports:
- `sudo ufw allow OpenSSH`
- `sudo ufw allow 'Nginx Full'`
- `sudo ufw enable`

## 3) Clone project and install dependencies

1. Create app directory:
- `sudo mkdir -p /var/www/aichatbot`
- `sudo chown -R $USER:$USER /var/www/aichatbot`
- `cd /var/www/aichatbot`

2. Clone repo:
- `git clone https://github.com/VipulPhatangare/dl-project.git .`

3. Install server dependencies:
- `cd /var/www/aichatbot/server`
- `npm install`

4. Install client dependencies and build frontend:
- `cd /var/www/aichatbot/client`
- `npm install`
- `npm run build`

## 4) Configure environment

Create `/var/www/aichatbot/.env` with production values.

Required values (already aligned in your project):
- `PORT=6161`
- `CLIENT_URL=https://aichatbot.vipulphatangare.site`
- `VITE_API_BASE_URL=https://aichatbot.vipulphatangare.site/api`
- `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `GEMINI_API_KEY`

> Important: keep `.env` private and never commit it.

## 5) Start backend with PM2

1. Go to server folder:
- `cd /var/www/aichatbot/server`

2. Start app:
- `pm2 start ecosystem.config.cjs`

3. Save PM2 process list:
- `pm2 save`

4. Enable startup on reboot:
- `pm2 startup`
- Run the command printed by PM2 (it requires sudo)

5. Check logs/status:
- `pm2 status`
- `pm2 logs aichatbot-server`

## 6) Configure Nginx

1. Copy provided config:
- `sudo cp /var/www/aichatbot/deploy/nginx/aichatbot.vipulphatangare.site.conf /etc/nginx/sites-available/aichatbot.vipulphatangare.site`

2. Enable site:
- `sudo ln -s /etc/nginx/sites-available/aichatbot.vipulphatangare.site /etc/nginx/sites-enabled/`

3. Remove default site (optional):
- `sudo rm -f /etc/nginx/sites-enabled/default`

4. Test and reload:
- `sudo nginx -t`
- `sudo systemctl reload nginx`

At this point HTTP should work.

## 7) Enable HTTPS (SSL)

1. Install certbot:
- `sudo apt install -y certbot python3-certbot-nginx`

2. Request certificate and auto-configure Nginx:
- `sudo certbot --nginx -d aichatbot.vipulphatangare.site`

3. Test renewal:
- `sudo certbot renew --dry-run`

## 8) Verify deployment

1. API health:
- `curl https://aichatbot.vipulphatangare.site/api/health`

2. Open in browser:
- `https://aichatbot.vipulphatangare.site`

3. Admin login route:
- `https://aichatbot.vipulphatangare.site/admin/login`

## 9) Update workflow (future deployments)

From `/var/www/aichatbot`:
1. `git pull origin main`
2. `cd client && npm install && npm run build`
3. `cd ../server && npm install`
4. `pm2 restart aichatbot-server`
5. `sudo systemctl reload nginx`

## 10) Recommended hardening

- Rotate exposed API keys immediately.
- Use strong `JWT_SECRET` (long random string).
- Restrict MongoDB Atlas IP access to VPS IP.
- Back up `.env` securely.
- Monitor logs with:
  - `pm2 logs`
  - `/var/log/nginx/error.log`
