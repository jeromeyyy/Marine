# -*- coding: utf-8 -*-
import os

docs = {
    "README.md": """# 🌊 Ratnakara Marine Data Platform

**AI-Driven Multimodal Oceanographic, Fisheries, Biodiversity, eDNA & Spatial Intelligence Platform**

The **Ratnakara Marine Data Platform** is an enterprise-grade, end-to-end marine scientific intelligence system focusing on the **Indian Ocean, Arabian Sea, Bay of Bengal, Lakshadweep, and Andaman & Nicobar** maritime ecosystems. It unifies physical oceanography, commercial fisheries catch records, WoRMS taxonomy, environmental DNA (eDNA) genomic sequences, deep convolutional otolith identification, satellite remote sensing, AIS vessel surveillance, and digital twin ecological simulations.

---

## ⚡ Quick Start

### Prerequisites
* **Node.js**: v18.0+ (v20+ recommended)
* **Python**: 3.9+ (for Python ML & FastAPI services)
* **npm** or **pnpm**

---

### 1-Click Launch (Windows)
Double-click [`start-app.bat`](./start-app.bat) to automatically start both the Backend (Port 3001) and Frontend (Port 3000).

---

### Manual Launch

#### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
```
* **Endpoint:** `http://localhost:3001`
* **Health Check:** `http://localhost:3001/health`

#### 2. Start Frontend UI
```bash
cd frontend
npm install
npm run dev
```
* **Dashboard & GIS:** `http://localhost:3000`

#### 3. Start Python ML & AI Microservice (Optional / Advanced AI)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
* **ML API:** `http://localhost:8000`
* **Swagger Docs:** `http://localhost:8000/docs`

---

## 🧭 Platform Modules & Routes

| Route | Module | Purpose |
| :--- | :--- | :--- |
| `/dashboard` | **Executive Overview** | Marine KPIs, active buoy status, temperature/salinity trends, alert banners. |
| `/ocean` | **Physical Oceanography** | SST, Salinity, pH, Dissolved Oxygen, Chlorophyll-a, Turbidity, Depth profiles. |
| `/fisheries` | **Fisheries & Catch** | Commercial catch records, biomass distributions, seasonal landing trends. |
| `/edna` | **eDNA Sequencing** | Environmental DNA assays, PCR concentrations, species detection confidence. |
| `/edna-shape-analyzer` | **DNA Physical Shape** | Sequence biophysical properties (Roll, Helical Twist, Propeller Twist, MGW). |
| `/correlations` | **Multivariate Analytics** | Pearson & Spearman correlation matrices, R² regression lines, scatter plots. |
| `/forecast` | **AI Biomass Forecasting** | 30/60/90-day LSTM population projections and Random Forest biomass estimations. |
| `/taxonomy` | **WoRMS Taxonomy Tree** | Hierarchical taxonomy (Kingdom ➔ Phylum ➔ Class ➔ Order ➔ Family ➔ Genus ➔ Species). |
| `/species-locations` | **Species Sightings** | Spatial coordinate mapping across Indian marine biodiversity zones. |
| `/dynamic-map` | **Dynamic GIS** | Layered GIS with SST heatmaps, MPAs, EEZ zones, and vessel AIS tracking. |
| `/digital-twin` | **Ecosystem Simulation** | Environmental shock simulator (ΔT, pH, hypoxia) computing trophic cascades. |
| `/biodiversity` | **Biodiversity Indices** | Shannon-Wiener, Simpson index, species richness, Pielou's evenness. |
| `/explorer` | **Unified Data Explorer** | Multi-domain filter engine with CSV, JSON, and PDF report export. |
| `/api-docs` | **API Reference** | Interactive OpenAPI / Swagger schema documentation. |

---

## 🧠 Machine Learning Capabilities
1. **LSTM Multi-Species Forecaster**: 30/60/90-day population and biomass trajectory modeling for commercial stocks (*Katsuwonus pelamis*, *Rastrelliger kanagurta*, *Sardinella longiceps*, *Scomberomorus guttatus*, *Thunnus albacares*).
2. **Random Forest Biomass Predictor**: Multi-parameter regression based on SST, Salinity, pH, DO, and Depth.
3. **Otolith CNN Deep Image Classifier**: Transfer-learning neural network identifying fish species from microscopic ear-stone morphology images across 38+ species.
4. **Deep eDNA Shape Biophysical Model**: Structural estimation of Helical Twist, Minor Groove Width, Roll, and Propeller Twist from nucleotide sequences.
5. **Sensor Stream Anomaly Engine**: Isolation forest algorithm detecting marine heatwaves, hypoxia events, and sensor drifts.
6. **GNN Trophic Food Web Cascades**: Ecological network simulation estimating predator-prey biomass redistribution.

---

## 🗺️ Spatial GIS & Remote Sensing
* **Oceanographic Heatmaps**: Interpolated surface gradients for Sea Surface Temperature, Salinity, and Dissolved Oxygen.
* **Marine Protected Areas (MPA)**: Sanctuary boundaries (e.g., Gulf of Mannar, Mahatma Gandhi MNP, Gahirmatha).
* **Exclusive Economic Zone (EEZ)**: Indian 200 NM maritime boundary sectors.
* **AIS Vessel Tracking**: Fishing vessel trajectories with real-time MPA violation alerts.
* **Satellite Remote Sensing**: Potential Fishing Zones (PFZ) and Harmful Algal Bloom (HAB) detection feeds.

---

## 🐳 Docker Deployment
```bash
docker-compose up -d --build
```

---

## 🧪 Testing
```bash
# Run Backend Integration Tests
cd backend && npm test

# Run ML Service Unit Tests
cd ml-service && python -m unittest discover -s tests -p "test_*.py"
```
""",

    "docs/ARCHITECTURE.md": """# 🏛️ Ratnakara Architecture Specification

## Monorepo Layout
```
Marine/
├── frontend/               # Next.js 14 + React 18 + Tailwind CSS + Leaflet + Plotly
├── backend/                # Express.js + TypeScript REST Engine (Dual In-Memory & Postgres/PostGIS)
├── ml-service/             # Python FastAPI + PyTorch/TensorFlow + Scikit-Learn Microservice
├── marine-pipeline-service/# Automated Data Ingestion & Transformation Pipeline
├── Taxonomyformatter/      # WoRMS / CMLRE / GBIF Taxonomy Tools & Datasets
├── scripts/                # Utility scripts, migrations, ETL, tests
└── data/                   # Real CMLRE CSVs, Otolith datasets, GeoJSON boundaries
```

## Data Flow
```
External Data / Sensors / Buoys
         │
         ▼
[marine-pipeline-service / ETL]
         │
         ▼
[PostgreSQL + PostGIS / In-Memory Store]
         │
         ▼
[Express.js TypeScript Backend API] ◄────► [FastAPI Python ML Microservice]
         │
         ▼
[Next.js 14 Frontend Web Application]
```
""",

    "docs/API.md": """# 📡 Ratnakara API Specification

All responses follow the standard envelope:
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## Main API Groups
* `GET /health` — Service health and operational mode
* `GET /api/ocean` — Physical ocean measurements (SST, Salinity, pH, DO)
* `GET /api/ocean/kpis` — Aggregate ocean metrics
* `GET /api/fisheries` — Commercial catch and landing records
* `GET /api/fisheries/metrics` — Fishery biomass & abundance metrics
* `GET /api/edna` — Environmental DNA detections & concentration assays
* `POST /api/edna-shape/predict` — Deep DNA shape physical parameters
* `POST /api/otolith/predict` — Fish ear-stone image CNN classification
* `GET /api/forecast` — Multi-species biomass and abundance projections
* `POST /api/digital-twin/simulate` — Environmental perturbation & trophic cascade simulator
* `GET /api/gis/layers` — MPAs, EEZ boundaries, and bathymetry depth strata
* `GET /api/vessels/tracking` — AIS fishing vessel positions with sanctuary breach alerts
* `GET /api/sensors/live` — Smart buoy telemetry with anomaly scores
* `GET /api/satellite/pfz` — Potential Fishing Zones (PFZ)
* `GET /api/explorer/query` — Unified multi-domain dataset explorer
* `POST /api/chatbot` — AI Marine domain research assistant
""",

    "docs/DEPLOYMENT.md": """# 🚀 Deployment Guide

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
"""
}

base_dir = r"C:\Users\alexl\OneDrive\Desktop\Marine"
for rel_path, content in docs.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {rel_path}")
