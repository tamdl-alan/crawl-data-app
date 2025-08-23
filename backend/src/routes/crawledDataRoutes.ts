import { Router } from 'express';
import { CrawledDataController } from '../controllers/crawledDataController.js';
import { Pool } from 'pg';

export function createCrawledDataRoutes(pool: Pool): Router {
  const router = Router();
  const crawledDataController = new CrawledDataController(pool);

  // Create a new crawled data record
  router.post('/', (req, res) => crawledDataController.createCrawledData(req, res));

  // Get all crawled data
  router.get('/', (req, res) => crawledDataController.getAllCrawledData(req, res));

  // Get a single crawled data record by ID
  router.get('/:id', (req, res) => crawledDataController.getCrawledDataById(req, res));

  // Update a crawled data record by ID
  router.put('/:id', (req, res) => crawledDataController.updateCrawledData(req, res));

  // Delete a crawled data record by ID
  router.delete('/:id', (req, res) => crawledDataController.deleteCrawledData(req, res));

  return router;
}
