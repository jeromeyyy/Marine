import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPostgresPool } from './postgres.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('--- Starting Ratnakara Database Migration ---');
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL configured. Running in local in-memory fallback mode.');
    return;
  }

  try {
    const pool = getPostgresPool();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema migrations to PostgreSQL...');
    await pool.query(sql);
    console.log('✓ Migration executed successfully!');
  } catch (error: any) {
    console.error('Migration error:', error.message || error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
