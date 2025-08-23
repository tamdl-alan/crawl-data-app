import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { createProductRoutes } from './routes/productRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

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

// Product routes
app.use('/products', createProductRoutes(pool));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
