import { Pool } from 'pg';
import dotenv from 'dotenv';
import { up as createProductsTableUp, down as createProductsTableDown } from './migrations/001_create_products_table.js';
import { up as renameColumnsUp, down as renameColumnsDown } from './migrations/002_rename_columns.js';
import { up as createCrawledDataTableUp, down as createCrawledDataTableDown } from './migrations/003_create_crawled_data_table.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:admin-crawl@13.215.70.39:54321/crawl-data",
});

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await createProductsTableUp(pool);
    await renameColumnsUp(pool);
    await createCrawledDataTableUp(pool);
    
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function rollbackMigrations() {
  try {
    console.log('Rolling back migrations...');
    await createCrawledDataTableDown(pool);
    await renameColumnsDown(pool);
    await createProductsTableDown(pool);
    console.log('Rollback completed successfully.');
  } catch (error) {
    console.error('Error rolling back migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const command = process.argv[2];

if (command === 'up') {
  runMigrations();
} else if (command === 'down') {
  rollbackMigrations();
} else {
  console.log('Usage: tsx src/migrate.ts [up|down]');
  process.exit(1);
}
