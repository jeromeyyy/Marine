# 🏛️ Ratnakara Architecture Specification

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
