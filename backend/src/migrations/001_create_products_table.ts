import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      product_url TEXT NOT NULL,
      product_id INTEGER UNIQUE NOT NULL,
      snkrdunk_api TEXT NOT NULL,
      product_type TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Migration 001_create_products_table.ts: Table "products" created.');
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS products;
  `);
  console.log('Migration 001_create_products_table.ts: Table "products" dropped.');
}
