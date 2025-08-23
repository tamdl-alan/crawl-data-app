import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Rename columns
  await pool.query(`ALTER TABLE products RENAME COLUMN product_id TO goat_id`);
  await pool.query(`ALTER TABLE products RENAME COLUMN product_url TO goat_url`);
  await pool.query(`ALTER TABLE products RENAME COLUMN product_type TO type`);
  
  console.log('Migration 002_rename_columns.ts: Columns renamed successfully.');
}

export async function down(pool: Pool): Promise<void> {
  // Revert column names
  await pool.query(`ALTER TABLE products RENAME COLUMN goat_id TO product_id`);
  await pool.query(`ALTER TABLE products RENAME COLUMN goat_url TO product_url`);
  await pool.query(`ALTER TABLE products RENAME COLUMN type TO product_type`);
  
  console.log('Migration 002_rename_columns.ts: Columns reverted successfully.');
}
