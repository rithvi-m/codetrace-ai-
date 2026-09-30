# CodeTrace AI — Production Deployment Guide

This document details step-by-step instructions for deploying **CodeTrace AI** to production cloud platforms (Render, Railway, Fly.io, AWS, DigitalOcean) and Docker containers.

---

## 🐳 Option 1: Docker / Docker Compose Deployment (Recommended)

CodeTrace AI features a multi-stage Docker setup that compiles the React frontend and packages the FastAPI backend into a single container.

### Using Docker Compose (1-Command):
```bash
# Clone or navigate to project directory
cd codetrace-ai

# Build and start container on port 8000
docker-compose up -d --build
```
Your application will be live at `http://localhost:8000`.

### Using Docker CLI:
```bash
docker build -t codetrace-ai .
docker run -d -p 8000:8000 --name codetrace-ai codetrace-ai
```

---

## ☁️ Option 2: Deploy to Render.com (Free Cloud Hosting)

Render provides free hosting for Web Services and Docker containers.

1. Push your repository to GitHub / GitLab.
2. Go to **[https://dashboard.render.com](https://dashboard.render.com)**.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Select **Docker** as the Environment.
6. Set:
   - **Name**: `codetrace-ai`
   - **Region**: Select closest region
   - **Branch**: `main`
   - **Docker Command**: Leave default (`CMD` in Dockerfile)
7. Click **Create Web Service**.

Render will automatically build the Docker container and provide a live public URL (e.g. `https://codetrace-ai.onrender.com`).

---

## 🚂 Option 3: Deploy to Railway.app

1. Install Railway CLI or connect via dashboard: **[https://railway.app](https://railway.app)**
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `codetrace-ai` repository.
4. Railway will automatically detect `Dockerfile` and deploy the unified web app.
5. Under Settings, click **Generate Domain** to get a public URL.

---

## 🖥️ Option 4: Deploy to Ubuntu VPS (AWS EC2 / DigitalOcean)

### Step 1: SSH into your VPS
```bash
ssh ubuntu@your-server-ip
```

### Step 2: Install Docker & Git
```bash
sudo apt update && sudo apt install -y git docker.io docker-compose
sudo systemctl enable --now docker
```

### Step 3: Clone and Run
```bash
git clone https://github.com/your-username/codetrace-ai.git
cd codetrace-ai
sudo docker-compose up -d --build
```

### Step 4: Configure Nginx Reverse Proxy (Optional SSL / HTTPS)
```nginx
server {
    listen 80;
    server_name codetrace.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Obtain free SSL using Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d codetrace.yourdomain.com
```
