import type { Request, Response } from 'express';
import { Pool } from 'pg';

export class ProductController {
  constructor(private pool: Pool) {}

  // Create a new product
  async createProduct(req: Request, res: Response) {
    const { goat_url, goat_id, snkrdunk_api, type } = req.body;
    
    // Validate required fields
    if (!goat_url || !goat_id || !snkrdunk_api || !type) {
      return res.status(400).json({ 
        error: "All fields are required: goat_url, goat_id, snkrdunk_api, type" 
      });
    }

    try {
      const result = await this.pool.query(
        "INSERT INTO products (goat_url, goat_id, snkrdunk_api, type) VALUES ($1, $2, $3, $4) RETURNING *",
        [goat_url, goat_id, snkrdunk_api, type]
      );
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("Error creating product:", error);
      // Check for duplicate goat_id error
      if (error.code === '23505' && error.constraint === 'products_goat_id_key') {
        return res.status(409).json({ error: "Product with this goat_id already exists" });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  }

  // Get all products
  async getAllProducts(req: Request, res: Response) {
    try {
      const result = await this.pool.query("SELECT * FROM products ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  // Get a single product by ID
  async getProductById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await this.pool.query("SELECT * FROM products WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  // Update a product by ID
  async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { goat_url, goat_id, snkrdunk_api, type } = req.body;
    
    // Validate required fields
    if (!goat_url || !goat_id || !snkrdunk_api || !type) {
      return res.status(400).json({ 
        error: "All fields are required: goat_url, goat_id, snkrdunk_api, type" 
      });
    }

    try {
      const result = await this.pool.query(
        "UPDATE products SET goat_url = $1, goat_id = $2, snkrdunk_api = $3, type = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
        [goat_url, goat_id, snkrdunk_api, type, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error updating product:", error);
      // Check for duplicate goat_id error
      if (error.code === '23505' && error.constraint === 'products_goat_id_key') {
        return res.status(409).json({ error: "Another product with this goat_id already exists" });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  }

  // Delete a product by ID
  async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await this.pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
}
