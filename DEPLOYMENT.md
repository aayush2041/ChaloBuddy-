# 🚀 ValorVault Deployment Guide

ValorVault is a unified full-stack Node.js + Express + React application. In production, the Express backend serves both the API endpoints (`/api/...`) and the pre-built React frontend (`/dist`) on a single port.

---

## ⚡ Option 1: Render.com (Recommended Free / Cloud)

Render is the simplest way to deploy ValorVault with zero server maintenance.

### Steps:
1. **Push your code to GitHub / GitLab**.
2. Go to **[Render.com](https://render.com/)** and log in.
3. Click **"New"** -> **"Web Service"**.
4. Connect your ValorVault repository.
5. Configure the service settings:
   - **Name**: `valorvault` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: `Yes`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
7. Click **"Create Web Service"**.

> Render will automatically build the frontend, start the server, and provide you with a live HTTPS URL (e.g., `https://valorvault.onrender.com`).

---

## 🚂 Option 2: Railway.app (Automatic SQLite Persistence)

Railway offers seamless deployment with automatic volume support for the SQLite database.

### Steps:
1. Sign in to **[Railway.app](https://railway.app/)**.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. Under **Settings**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Under **Variables**:
   - `NODE_ENV`: `production`
6. Under **Volumes**:
   - Click **"Add Volume"**
   - Mount Path: `/app/server` (this persists your database and customer payment receipts across restarts).
7. Under **Networking**: Click **"Generate Domain"** to get your public live URL.

---

## 🐳 Option 3: Docker & Docker Compose (Any Host / VPS)

If you have a VPS (DigitalOcean, Linode, AWS EC2, Hetzner, etc.) with Docker installed:

1. Clone your repository:
   ```bash
   git clone <your-repo-url>
   cd Antigravity
   ```
2. Run the application:
   ```bash
   docker compose up -d --build
   ```
3. The application will be live at `http://YOUR_SERVER_IP:5000`.

---

## 🖥️ Option 4: Linux VPS (Ubuntu / Debian with PM2 + Nginx)

### 1. Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
```

### 2. Clone & Build
```bash
git clone <your-repo-url> /var/www/valorvault
cd /var/www/valorvault
npm install
npm run build
```

### 3. Start with PM2
```bash
pm2 start server/server.js --name "valorvault"
pm2 save
pm2 startup
```

### 4. Configure Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/valorvault`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site & SSL:
```bash
sudo ln -s /etc/nginx/sites-available/valorvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ⚙️ Environment Variables Summary

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the application server |
| `NODE_ENV` | `production` | Enables production mode & caching |
