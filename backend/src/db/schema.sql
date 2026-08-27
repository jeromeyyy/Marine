-- Ratnakara Marine Data Platform Database Schema
-- Supports PostgreSQL with optional PostGIS extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Taxonomy & Species Catalog
CREATE TABLE IF NOT EXISTS taxonomy (
    id SERIAL PRIMARY KEY,
    kingdom VARCHAR(100) DEFAULT 'Animalia',
    phylum VARCHAR(100) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    order_name VARCHAR(100) NOT NULL,
    family VARCHAR(100) NOT NULL,
    genus VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(255) UNIQUE NOT NULL,
    common_name VARCHAR(255),
    worms_id INTEGER,
    cmlre_code VARCHAR(100),
    iucn_status VARCHAR(50) DEFAULT 'Least Concern',
    trophic_level NUMERIC(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS species (
    id SERIAL PRIMARY KEY,
    scientific_name VARCHAR(255) UNIQUE NOT NULL,
    common_name VARCHAR(255) NOT NULL,
    taxonomy_id INTEGER REFERENCES taxonomy(id) ON DELETE SET NULL,
    commercial_importance VARCHAR(50),
    habitat VARCHAR(100),
    depth_range_min_m NUMERIC(6, 2),
    depth_range_max_m NUMERIC(6, 2),
    thermal_tolerance_min_c NUMERIC(4, 2),
    thermal_tolerance_max_c NUMERIC(4, 2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Physical Oceanography & In-situ Stations
CREATE TABLE IF NOT EXISTS sampling_stations (
    id SERIAL PRIMARY KEY,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    depth_m NUMERIC(7, 2),
    station_type VARCHAR(50) DEFAULT 'Buoy',
    is_active BOOLEAN DEFAULT TRUE,
    geom geometry(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ocean_measurements (
    id BIGSERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES sampling_stations(id) ON DELETE SET NULL,
    region VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    depth_m NUMERIC(6, 2) DEFAULT 0.0,
    sea_surface_temperature NUMERIC(5, 2) NOT NULL,
    salinity_psu NUMERIC(5, 2) NOT NULL,
    ph_level NUMERIC(4, 2) NOT NULL,
    dissolved_oxygen_mg_l NUMERIC(5, 2) NOT NULL,
    chlorophyll_a_ug_l NUMERIC(5, 2),
    turbidity_ntu NUMERIC(5, 2),
    wave_height_m NUMERIC(4, 2),
    wind_speed_knots NUMERIC(5, 2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    geom geometry(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocean_recorded_at ON ocean_measurements(recorded_at);
CREATE INDEX IF NOT EXISTS idx_ocean_region ON ocean_measurements(region);

-- 3. Fisheries & Catch Records
CREATE TABLE IF NOT EXISTS fisheries_records (
    id BIGSERIAL PRIMARY KEY,
    species_id INTEGER REFERENCES species(id) ON DELETE CASCADE,
    species_scientific_name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    landing_site VARCHAR(255) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    catch_biomass_kg NUMERIC(10, 2) NOT NULL,
    abundance_count INTEGER NOT NULL,
    gear_type VARCHAR(100),
    effort_hours NUMERIC(6, 2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    geom geometry(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fisheries_species ON fisheries_records(species_scientific_name);
CREATE INDEX IF NOT EXISTS idx_fisheries_region ON fisheries_records(region);
CREATE INDEX IF NOT EXISTS idx_fisheries_recorded_at ON fisheries_records(recorded_at);

-- 4. eDNA Assays & Sequences
CREATE TABLE IF NOT EXISTS edna_samples (
    id BIGSERIAL PRIMARY KEY,
    sample_code VARCHAR(100) UNIQUE NOT NULL,
    station_id INTEGER REFERENCES sampling_stations(id) ON DELETE SET NULL,
    region VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    sampling_depth_m NUMERIC(6, 2) NOT NULL,
    water_volume_filtered_l NUMERIC(5, 2),
    filter_pore_size_um NUMERIC(4, 2),
    pcr_cycle_count INTEGER,
    dna_concentration_ng_ul NUMERIC(6, 3),
    shannon_diversity NUMERIC(5, 3),
    simpson_diversity NUMERIC(5, 3),
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    geom geometry(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edna_sequences (
    id BIGSERIAL PRIMARY KEY,
    sample_id BIGINT REFERENCES edna_samples(id) ON DELETE CASCADE,
    species_scientific_name VARCHAR(255) NOT NULL,
    read_count INTEGER NOT NULL,
    relative_abundance NUMERIC(6, 4) NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL,
    fasta_header TEXT,
    sequence_data TEXT,
    helical_twist_avg NUMERIC(5, 2),
    minor_groove_width_avg NUMERIC(5, 2),
    propeller_twist_avg NUMERIC(5, 2),
    roll_angle_avg NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Otolith Classifications & Human Review
CREATE TABLE IF NOT EXISTS otolith_predictions (
    id BIGSERIAL PRIMARY KEY,
    image_filename VARCHAR(255) NOT NULL,
    image_hash VARCHAR(64),
    top_predicted_species VARCHAR(255) NOT NULL,
    top_confidence NUMERIC(5, 4) NOT NULL,
    top_k_results JSONB NOT NULL,
    morphology_metadata JSONB,
    model_version VARCHAR(50) NOT NULL,
    human_verified BOOLEAN DEFAULT FALSE,
    verified_species VARCHAR(255),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ML Forecasts & Model Runs
CREATE TABLE IF NOT EXISTS forecasts (
    id BIGSERIAL PRIMARY KEY,
    species_scientific_name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    horizon_days INTEGER NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_biomass_kg NUMERIC(10, 2) NOT NULL,
    confidence_lower_kg NUMERIC(10, 2),
    confidence_upper_kg NUMERIC(10, 2),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    feature_importance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. GIS: Marine Protected Areas (MPA) & EEZ Boundaries
CREATE TABLE IF NOT EXISTS protected_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    area_sq_km NUMERIC(10, 2),
    restriction_level VARCHAR(50) DEFAULT 'No-Take',
    geojson_geometry JSONB,
    geom geometry(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eez_boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(100) DEFAULT 'Exclusive Economic Zone',
    geojson_geometry JSONB,
    geom geometry(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AIS Vessel Tracking & Sanctuaries
CREATE TABLE IF NOT EXISTS vessels (
    id SERIAL PRIMARY KEY,
    mmsi VARCHAR(50) UNIQUE NOT NULL,
    vessel_name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(100) NOT NULL,
    flag_country VARCHAR(100) NOT NULL,
    length_m NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vessel_tracks (
    id BIGSERIAL PRIMARY KEY,
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    speed_knots NUMERIC(4, 1) NOT NULL,
    heading_deg NUMERIC(5, 1),
    inside_mpa BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    geom geometry(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Ecosystem Digital Twin Simulations
CREATE TABLE IF NOT EXISTS simulations (
    id BIGSERIAL PRIMARY KEY,
    simulation_name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    scenario_parameters JSONB NOT NULL,
    biomass_impact_delta NUMERIC(6, 2) NOT NULL,
    biodiversity_impact_delta NUMERIC(6, 2) NOT NULL,
    ecological_risk_score NUMERIC(5, 2) NOT NULL,
    trophic_cascade_metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Real-time Environmental Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    performed_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
