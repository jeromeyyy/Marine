# 🚀 Deployment Guide

## 1. Local Development
```bash
# Start Backend
cd backend && npm run dev

# Start Frontend
cd frontend && npm run dev
```

## 2. Docker Compose
```bash
docker-compose up -d --build
```

## 3. Cloud Deployment (Vercel & Render)
* **Frontend (Vercel)**:
  - Framework Preset: Next.js
  - Root Directory: `frontend`
  - Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com`
* **Backend (Render / Railway)**:
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Port: `3001`
* **ML Service (GCP Cloud Run / Fly.io)**:
  - Dockerfile: `ml-service/Dockerfile`
  - Port: `8000`
