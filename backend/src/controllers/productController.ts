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
      const { 
        sortBy = 'created_at', 
        sortOrder = 'desc', 
        page = 1, 
        limit = 10,
        search = '',
        filterBy = '',
        filterValue = ''
      } = req.query;
      
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const validSortFields = ['id', 'goat_url', 'goat_id', 'snkrdunk_api', 'type', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
      
      // Build WHERE conditions
      let whereConditions: string[] = [];
      let queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search condition
      if (search && search.toString().trim()) {
        whereConditions.push(`(
          goat_url ILIKE $${paramIndex} OR 
          goat_id::text ILIKE $${paramIndex} OR 
          snkrdunk_api ILIKE $${paramIndex} OR
          type ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search.toString().trim()}%`);
        paramIndex++;
      }
      
      // Add filter condition
      if (filterBy && filterValue && filterValue.toString().trim()) {
        const validFilterFields = ['goat_id', 'type'];
        if (validFilterFields.includes(filterBy as string)) {
          whereConditions.push(`${filterBy} = $${paramIndex}`);
          queryParams.push(filterValue.toString().trim());
          paramIndex++;
        }
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const query = `
        SELECT * FROM products 
        ${whereClause}
        ORDER BY ${sortField} ${order}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const countQuery = `
        SELECT COUNT(*) FROM products 
        ${whereClause}
      `;
      
      queryParams.push(parseInt(limit as string), offset);
      
      const [result, countResult] = await Promise.all([
        this.pool.query(query, queryParams),
        this.pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
      ]);
      
      res.json({
        data: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit as string)),
        search: search?.toString() || '',
        filterBy: filterBy?.toString() || '',
        filterValue: filterValue?.toString() || ''
      });
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
