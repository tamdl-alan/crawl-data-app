import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import cors from "cors";
import { createProductRoutes } from './routes/productRoutes.js';
import { createCrawledDataRoutes } from './routes/crawledDataRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:admin-crawl@localhost:54325/crawl-data",
});

// Test API endpoint
app.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Product routes (old table)
app.use('/products', createProductRoutes(pool));

// Crawled data routes (new table)
app.use('/crawled-data', createCrawledDataRoutes(pool));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
