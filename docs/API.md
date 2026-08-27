# 📡 Ratnakara API Specification

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
