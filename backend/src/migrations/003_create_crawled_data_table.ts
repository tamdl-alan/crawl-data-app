import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Create crawled_data table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crawled_data (
      id SERIAL PRIMARY KEY,
      product_url VARCHAR(500) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      size_goat VARCHAR(50),
      price_goat DECIMAL(10,2),
      size_snkrdunk VARCHAR(50),
      price_snkrdunk DECIMAL(10,2),
      profit_amount DECIMAL(10,2),
      selling_price DECIMAL(10,2),
      image_url TEXT,
      note TEXT,
      del_flag INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh'),
      updated_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')
    );
  `);
  console.log('Migration 003_create_crawled_data_table.ts: Table "crawled_data" created.');
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS crawled_data;
  `);
  console.log('Migration 003_create_crawled_data_table.ts: Table "crawled_data" dropped.');
}
