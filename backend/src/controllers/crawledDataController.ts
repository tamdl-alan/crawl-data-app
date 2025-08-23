import type { Request, Response } from 'express';
import { Pool } from 'pg';

export class CrawledDataController {
  constructor(private pool: Pool) {}

  // Create a new crawled data record
  async createCrawledData(req: Request, res: Response) {
    const { 
      product_url, 
      product_name, 
      size_goat, 
      price_goat, 
      size_snkrdunk, 
      price_snkrdunk, 
      profit_amount, 
      selling_price, 
      image_url, 
      note 
    } = req.body;
    
    // Validate required fields
    if (!product_url || !product_name) {
      return res.status(400).json({ 
        error: "Product URL and Product Name are required" 
      });
    }

    try {
      const result = await this.pool.query(
        `INSERT INTO crawled_data (
          product_url, product_name, size_goat, price_goat, 
          size_snkrdunk, price_snkrdunk, profit_amount, 
          selling_price, image_url, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [product_url, product_name, size_goat, price_goat, size_snkrdunk, 
         price_snkrdunk, profit_amount, selling_price, image_url, note]
      );
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("Error creating crawled data:", error);
      res.status(500).json({ error: "Failed to create crawled data" });
    }
  }

  // Get all crawled data
  async getAllCrawledData(req: Request, res: Response) {
    try {
      const { sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const validSortFields = ['id', 'product_name', 'price_goat', 'price_snkrdunk', 'profit_amount', 'selling_price', 'created_at'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
      
      const query = `
        SELECT * FROM crawled_data 
        WHERE del_flag = 0
        ORDER BY ${sortField} ${order}
        LIMIT $1 OFFSET $2
      `;
      
      const countQuery = "SELECT COUNT(*) FROM crawled_data WHERE del_flag = 0";
      
      const [result, countResult] = await Promise.all([
        this.pool.query(query, [parseInt(limit as string), offset]),
        this.pool.query(countQuery)
      ]);
      
      res.json({
        data: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit as string))
      });
    } catch (error) {
      console.error("Error fetching crawled data:", error);
      res.status(500).json({ error: "Failed to fetch crawled data" });
    }
  }

  // Get a single crawled data record by ID
  async getCrawledDataById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await this.pool.query("SELECT * FROM crawled_data WHERE id = $1 AND del_flag = 0", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Crawled data not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching crawled data:", error);
      res.status(500).json({ error: "Failed to fetch crawled data" });
    }
  }

  // Update a crawled data record by ID
  async updateCrawledData(req: Request, res: Response) {
    const { id } = req.params;
    const { 
      product_url, 
      product_name, 
      size_goat, 
      price_goat, 
      size_snkrdunk, 
      price_snkrdunk, 
      profit_amount, 
      selling_price, 
      image_url, 
      note 
    } = req.body;
    
    // Validate required fields
    if (!product_url || !product_name) {
      return res.status(400).json({ 
        error: "Product URL and Product Name are required" 
      });
    }

    try {
      const result = await this.pool.query(
        `UPDATE crawled_data 
         SET product_url = $1, product_name = $2, size_goat = $3, price_goat = $4,
             size_snkrdunk = $5, price_snkrdunk = $6, profit_amount = $7,
             selling_price = $8, image_url = $9, note = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 AND del_flag = 0
         RETURNING *`,
        [product_url, product_name, size_goat, price_goat, size_snkrdunk, 
         price_snkrdunk, profit_amount, selling_price, image_url, note, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Crawled data not found" });
      }
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error updating crawled data:", error);
      res.status(500).json({ error: "Failed to update crawled data" });
    }
  }

  // Soft delete a crawled data record by ID
  async deleteCrawledData(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await this.pool.query(
        "UPDATE crawled_data SET del_flag = 2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND del_flag = 0 RETURNING *", 
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Crawled data not found" });
      }
      res.status(200).json({ message: "Crawled data deleted successfully" });
    } catch (error) {
      console.error("Error deleting crawled data:", error);
      res.status(500).json({ error: "Failed to delete crawled data" });
    }
  }
}
