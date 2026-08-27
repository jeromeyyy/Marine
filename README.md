# 🌊 Ratnakara Marine Data Platform

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
