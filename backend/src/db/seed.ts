import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPostgresPool } from './postgres.js';

dotenv.config();

export async function runSeed() {
  console.log('--- Starting Ratnakara Marine Database Seeding ---');
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL configured. Local in-memory seed generator is active.');
    return;
  }

  const pool = getPostgresPool();
  try {
    console.log('Seeding baseline taxonomy and species...');
    await pool.query(`
      INSERT INTO taxonomy (kingdom, phylum, class_name, order_name, family, genus, scientific_name, common_name, worms_id, iucn_status, trophic_level)
      VALUES 
        ('Animalia', 'Chordata', 'Actinopterygii', 'Scombriformes', 'Scombridae', 'Katsuwonus', 'Katsuwonus pelamis', 'Skipjack Tuna', 127021, 'Least Concern', 4.10),
        ('Animalia', 'Chordata', 'Actinopterygii', 'Scombriformes', 'Scombridae', 'Rastrelliger', 'Rastrelliger kanagurta', 'Indian Mackerel', 219712, 'Least Concern', 3.20),
        ('Animalia', 'Chordata', 'Actinopterygii', 'Clupeiformes', 'Clupeidae', 'Sardinella', 'Sardinella longiceps', 'Indian Oil Sardine', 217684, 'Least Concern', 2.30),
        ('Animalia', 'Chordata', 'Actinopterygii', 'Scombriformes', 'Scombridae', 'Scomberomorus', 'Scomberomorus guttatus', 'Indo-Pacific King Mackerel', 219725, 'Data Deficient', 4.30),
        ('Animalia', 'Chordata', 'Actinopterygii', 'Scombriformes', 'Scombridae', 'Thunnus', 'Thunnus albacares', 'Yellowfin Tuna', 127028, 'Near Threatened', 4.40)
      ON CONFLICT (scientific_name) DO NOTHING;
    `);

    console.log('Seeding sampling stations...');
    await pool.query(`
      INSERT INTO sampling_stations (station_code, station_name, region, latitude, longitude, depth_m, station_type)
      VALUES
        ('IN-AS-01', 'Arabian Sea Deep Buoy 1', 'Arabian Sea', 15.2500, 70.1500, 2400.0, 'Moored Buoy'),
        ('IN-AS-02', 'Kochi Coastal Observatory', 'Arabian Sea', 9.9312, 76.2673, 45.0, 'Coastal Station'),
        ('IN-BOB-01', 'Bay of Bengal Central Mooring', 'Bay of Bengal', 14.8200, 86.4000, 3100.0, 'Moored Buoy'),
        ('IN-BOB-02', 'Visakhapatnam Shelf Station', 'Bay of Bengal', 17.6868, 83.2185, 95.0, 'Coastal Station'),
        ('IN-LAK-01', 'Kavaratti Reef Station', 'Lakshadweep', 10.5667, 72.6417, 28.0, 'Reef Sensor Array'),
        ('IN-AND-01', 'Port Blair Marine Station', 'Andaman & Nicobar', 11.6234, 92.7265, 80.0, 'Island Observatory')
      ON CONFLICT (station_code) DO NOTHING;
    `);

    console.log('✓ Seeding completed successfully!');
  } catch (error: any) {
    console.error('Seeding error:', error.message || error);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
