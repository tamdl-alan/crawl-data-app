import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:admin-crawl@localhost:54325/crawl-data",
});

const initCrawledDataTable = async () => {
  try {
    // Create new table with new schema
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created crawled_data table successfully");

    // Check if table is empty, then insert sample data
    const countResult = await pool.query("SELECT COUNT(*) FROM crawled_data");
    if (parseInt(countResult.rows[0].count) === 0) {
      // Insert sample data
      const sampleData = [
        {
          product_url: "https://www.goat.com/sneakers/air-jordan-1-retro-high-og-chicago-2022-DZ5485-612",
          product_name: "Air Jordan 1 Retro High OG Chicago 2022",
          size_goat: "US 9",
          price_goat: 299.99,
          size_snkrdunk: "US 9",
          price_snkrdunk: 250.00,
          profit_amount: 49.99,
          selling_price: 350.00,
          image_url: "https://example.com/jordan1.jpg",
          note: "Limited edition, high demand"
        },
        {
          product_url: "https://www.goat.com/sneakers/nike-dunk-low-retro-white-black-2021-DD1391-100",
          product_name: "Nike Dunk Low Retro White Black",
          size_goat: "US 10",
          price_goat: 150.00,
          size_snkrdunk: "US 10",
          price_snkrdunk: 120.00,
          profit_amount: 30.00,
          selling_price: 180.00,
          image_url: "https://example.com/dunk.jpg",
          note: "Classic colorway"
        }
      ];

      for (const data of sampleData) {
        await pool.query(`
          INSERT INTO crawled_data (
            product_url, product_name, size_goat, price_goat, 
            size_snkrdunk, price_snkrdunk, profit_amount, 
            selling_price, image_url, note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          data.product_url, data.product_name, data.size_goat, data.price_goat,
          data.size_snkrdunk, data.price_snkrdunk, data.profit_amount,
          data.selling_price, data.image_url, data.note
        ]);
      }

      console.log("Inserted sample crawled data");
    } else {
      console.log("crawled_data table already has data, skipping sample data insertion");
    }

    console.log("Crawled data table initialization completed successfully!");
  } catch (error) {
    console.error("Crawled data table initialization error:", error);
  } finally {
    await pool.end();
  }
};

initCrawledDataTable();
