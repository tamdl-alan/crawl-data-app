import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  // Check if columns need to be renamed
  const columnCheck = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name IN ('product_id', 'product_url', 'product_type')
  `);
  
  if (columnCheck.rows.length > 0) {
    // Rename columns only if they exist
    if (columnCheck.rows.some(row => row.column_name === 'product_id')) {
      await pool.query(`ALTER TABLE products RENAME COLUMN product_id TO goat_id`);
    }
    if (columnCheck.rows.some(row => row.column_name === 'product_url')) {
      await pool.query(`ALTER TABLE products RENAME COLUMN product_url TO goat_url`);
    }
    if (columnCheck.rows.some(row => row.column_name === 'product_type')) {
      await pool.query(`ALTER TABLE products RENAME COLUMN product_type TO type`);
    }
    console.log('Migration 002_rename_columns.ts: Columns renamed successfully.');
  } else {
    console.log('Migration 002_rename_columns.ts: Columns already renamed, skipping.');
  }
}

export async function down(pool: Pool): Promise<void> {
  // Revert column names
  await pool.query(`ALTER TABLE products RENAME COLUMN goat_id TO product_id`);
  await pool.query(`ALTER TABLE products RENAME COLUMN goat_url TO product_url`);
  await pool.query(`ALTER TABLE products RENAME COLUMN type TO product_type`);
  
  console.log('Migration 002_rename_columns.ts: Columns reverted successfully.');
}
