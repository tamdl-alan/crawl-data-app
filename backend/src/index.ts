import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import cors from "cors";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import axios from 'axios';
import cron from 'node-cron';

import { createProductRoutes } from './routes/productRoutes.js';
import { createCrawledDataRoutes } from './routes/crawledDataRoutes.js';
import type { ProductModel } from "./models/product.model.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
(puppeteer as any).use(StealthPlugin());
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

// -------------Crawl Data Start------------------
app.post("/crawl-data", async (req: Request, res: any) => {
  if (!req) {
    res.status(400).send({ message: 'Product ID is required' });
    return;
  }
  const { id, goat_url, goat_id, snkrdunk_api, type } = req.body as unknown as ProductModel;
  try {

    console.log(`------------Crawling data [${snkrdunk_api}] SNKRDUNK Start: [${getVietnamTime()}]------------`);
    const dataSnk = await crawlDataSnkrdunk(snkrdunk_api, type);
    console.log(`------------Crawling data [${snkrdunk_api}] SNKRDUNK End: [${getVietnamTime()}]------------`);

    console.log(`------------Crawling data [${goat_url}] GOAT Start: [${getVietnamTime()}]------------`);
    const dataGoat = await extractDetailsFromProductGoat(goat_url, goat_id, type);
    console.log(`------------Crawling data [${goat_url}] GOAT End: [${getVietnamTime()}]------------`);

    const mergedArr = mergeData(dataSnk, dataGoat);

    if (!mergedArr?.length) {
      console.warn(`⚠️ No data found for Product ID: ${goat_url}`);
      if (!res.headersSent) {
        res.status(200).send({ message: '⛔ No data found for the given Product ID' });  
      }
    } else {
      try {
        // Save data to database using crawled-data API
        const savedRecords = await saveCrawledDataToDatabase(mergedArr);
        console.log(`✅ Successfully saved ${savedRecords.length} records to database`);
        if (!res.headersSent) {
          res.status(200).send({ 
            message: `✅ Done crawling ${goat_url}`,
            savedRecords: savedRecords.length,
            totalRecords: mergedArr.length,
            completedAt: getVietnamTime()
          });
        }
      } catch (dbError: any) {
        console.error('❌ Error saving to database:', dbError.message);
        if (!res.headersSent) {
          res.status(500).send({ 
            message: `❌ Error saving data to database: ${dbError.message}`,
            crawledData: mergedArr // Return crawled data even if DB save fails
          });
        }
      }
    }
  } catch (error: any) {
    console.error(`❌ Error crawling ${id}:`, error.message);
    if (!res.headersSent) {
      res.status(500).send({ message: `❌ Error crawling ${id}: ${error.message}` });
    }
  }
});


// ========== Common Start ========== //
const PORT = process.env.PORT || 3000;

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const viewPortBrowser = { width: 1920, height: 1200 };
const extraHTTPHeaders = {
  'Accept-Language': 'ja,ja-JP;q=0.9,en;q=0.8'
}
const defaultBrowserArgs = {
  headless: 'true',
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
  args: [
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu,"
  ]
}

const PRODUCT_TYPE = {
  SHOE: 'SHOE',
  CLOTHES: 'CLOTHES'
}

// ========== Common End ========== //

// ========== Snkrdunk Start ========== //
const EMAIL_SNKRDUNK = process.env.EMAIL_SNKRDUNK || '';
const PASSWORD_SNKRDUNK = process.env.PASSWORD_SNKRDUNK || '';
const DOMAIN_SNKRDUNK = 'https://snkrdunk.com';
const LOGIN_PAGE_SNKRDUNK = `${DOMAIN_SNKRDUNK}/accounts/login`;
let cookieHeader = '';
let retryCount = 0; // Initialize retry count for login attempts
const RETRY_LIMIT = 3; // Retry limit for login attempts

// ========== Snkrdunk End========== //


// ========== Goal Start ========== //
const goalDomain = 'https://www.goat.com';
const sizeAndPriceGoatUrl = 'https://www.goat.com/web-api/v1/product_variants/buy_bar_data?productTemplateId'
// ========== Goal End ========== //

function mergeData(dataSnk: any, dataGoal: any) {
  const priceMap = new Map(dataSnk?.map((p: any) => [String(p['sizeSnkrdunk']), p['priceSnkrdunk']]));
  const merged = dataGoal?.map((item: any) => {
    const sizeStr = item['size_goat'];
    const priceSnk = priceMap.get(sizeStr) as number;
    const priceGoat = parseFloat(item['price_goat']) || 0;

    const mergedItem = {
      ...item,
      price_goat: priceGoat,
      price_snkrdunk: priceSnk ?? 0,
      size_snkrdunk: sizeStr,
      profit_amount: priceSnk != null ? priceGoat - priceSnk : 0,
      selling_price: 0, // Default selling price same as GOAT price
      note: '',
    };
    return mergedItem;
  });
  return merged || [];
}




async function crawlDataSnkrdunk(apiUrl: string, type: string) {
  try {
    await snkrdunkLogin();
    const dataRes = await snkrdunkfetchData(apiUrl, type);
    const snkrMapped = getSizeAndPriceSnkrdunk(dataRes, type)
    console.log(`✅ Extracted Snkrdunk data!!!`);
    console.table(snkrMapped, ['sizeSnkrdunk', 'priceSnkrdunk']);
    return snkrMapped || [];
  } catch (err: any) {
    console.error('Error during Snkrdunk crawl:', err?.message);
    throw err;
  }
}

async function snkrdunkLogin() {
  const browser = await (puppeteer as any).launch(defaultBrowserArgs);
  let page = null;
  
  try {
    if (cookieHeader) {
      return;
    }
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(userAgent);
    await page.goto(LOGIN_PAGE_SNKRDUNK, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for form elements to be ready
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    
    // Clear fields first
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    });
    await page.type('input[name="email"]', EMAIL_SNKRDUNK, { delay: 100 });
    await page.type('input[name="password"]', PASSWORD_SNKRDUNK, { delay: 100 });
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
    } else {
      // Fallback to form submit
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.submit();
      });
    }
    const cookies = await page.cookies();
    cookieHeader = cookies.map((c: any) => `${c.name}=${c.value}`).join('; ');
    retryCount = 0;
  } catch (err: any) {
    console.error('❌ Snkrdunk login failed:', err?.message);
    
    // Retry login if it fails
    cookieHeader = '';
    retryCount++;
    if (retryCount < RETRY_LIMIT) {
      console.log(`🔄 Retrying login (${retryCount}/${RETRY_LIMIT})...`);
      await snkrdunkLogin();
    } else {
      throw err;
    }
  } finally {
    try {
      if (page) await page.close();
      await browser.close();
    } catch (closeError: any) {
      console.error('❌ Error closing browser:', closeError?.message);
    }
  }
}

async function snkrdunkfetchData(api: string, type: string) {
  const apiUrl = `${DOMAIN_SNKRDUNK}/v1/${api}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Cookie': cookieHeader,
        'Referer': DOMAIN_SNKRDUNK,
        'Origin': DOMAIN_SNKRDUNK
      },
      timeout: 60000 // 60 second timeout
    });
    if (type === PRODUCT_TYPE.SHOE) {
      return response?.data?.data || [];
    }
    return response?.data || [];
  } catch (err: any) {
    console.error('API [' + api + '] call failed:', err?.message);
    throw err;
  }
}

function getSizeAndPriceSnkrdunk(data: any, type: string) {
  if (type === PRODUCT_TYPE.SHOE) {
    return data?.minPriceOfSizeList?.map((item: any) => {
      const size = convertCmToUs(item.size);
      if (size == null) {
        return null;
      }
      return {
        sizeSnkrdunk: size.toString()?.trim(),
        priceSnkrdunk: item.price
      };
    }).filter((item: any) => item);
  }
  return data?.sizePrices?.map((item: any) => {
    return {
      sizeSnkrdunk: convertSizeClothes(item.size.localizedName?.toString()?.trim()),
      priceSnkrdunk: item.minListingPrice
    };
  });
}

function convertCmToUs(cm: number) {
  if (cm < 20 || cm > 32) {
    return null;
  }

  const sizeMap = {
    20: 6,
    21: 6.5,
    22: 7,
    23: 7.5,
    24: 8,
    25: 8.5,
    26: 9,
    27: 9.5,
    28: 10,
    29: 10.5,
    30: 11,
    31: 11.5,
    32: 12,
  };

  return sizeMap[cm as keyof typeof sizeMap] ?? null;
}

function convertSizeClothes(size: string) {
  if (!size) {
    return null;
  }

  if (size === 'XXL') {
    return '2XL'
  } else if (size === 'XXXL') {
    return '3XL'
  } else if (size === 'XXXXL') {
    return '4XL'
  }
  return size
}
// ========== Snkrdunk End ========== //

// ========== Goat Start ========== //

async function extractDetailsFromProductGoat(goatUrl: string, goatId: number, type: string) {
  if (!goatId || !goatUrl) {
    console.error(`❌ Invalid goat data: goatId: ${goatId}, goatUrl: ${goatUrl}`);
    return [];
  }

  let browserChild = null;
  let page = null;
  
  try {
    browserChild = await (puppeteer as any).launch(defaultBrowserArgs);
    page = await browserChild.newPage();
    page.setDefaultTimeout(60000); // 60 seconds timeout
    
    await page.setViewport(viewPortBrowser);
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders(extraHTTPHeaders);

    // Set cookies
    await page.setCookie(
      { name: 'currency', value: 'JPY', domain: 'www.goat.com', path: '/', secure: true },
      { name: 'country', value: 'JP', domain: 'www.goat.com', path: '/', secure: true },
    );

    await page.goto(goalDomain + '/' + goatUrl, { waitUntil: 'networkidle2' });

    const goatSearchResponse = await page.evaluate(async (goatId: string, sizeAndPriceGoatUrl: string) => {
      const url = `${sizeAndPriceGoatUrl}=${goatId}`;
      try {
        const res = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'application/json',
            'Referer': 'https://www.goat.com',
            'Origin': 'https://www.goat.com',
          }
        });
        return await res.json();
      } catch (error) {
        console.error('API fetch error:', error);
      }
    }, goatId, sizeAndPriceGoatUrl);

    if (!goatSearchResponse) {
      console.error('❌ Failed to fetch product data from API');
      return [];
    }

    // Get page content for image extraction
    const html = await page.content();
    const $ = cheerio.load(html);

    let imgSrc = '';
    let imgAlt = '';

    // Wait for image selector and extract
    try {
      await page.waitForSelector('div.swiper-slide-active', { timeout: 30000 });
      $('div.swiper-slide-active').each((i: any, el: any) => {
        const img = $(el).find('img');
        if (img && !imgSrc && !imgAlt) {
          imgSrc = img.attr('src') || '';
          imgAlt = img.attr('alt') || '';
        }
      });
    } catch (error) {
      console.log('⚠️ Image selector not found, continuing without image...');
    }

    const dataFiltered = getSizeAndPriceGoat(goatSearchResponse, type);
    const products = dataFiltered?.map((item: any) => {
      return {
        product_url: goatUrl,
        product_name: imgAlt,
        image: [{ url: imgSrc }],
        size_goat: item['size_goat'],
        price_goat: item['price_goat']
      }
    });

    console.log(`✅ Extracted Goat data!!!`);
    console.table(products, ['product_url', 'product_name', 'size_goat', 'price_goat']);
    return products;
  } catch (err: any) {
    console.error(`❌ Error extract product:`, err?.message);
    throw err;
  } finally {
    try {
      if (page) await page.close();
      if (browserChild) await browserChild.close();
    } catch (closeError: any) {
      console.error('❌ Error closing browser child:', closeError?.message);
    }
  }
}

function getSizeAndPriceGoat(data: any, type: string) {
  const dataMap = data?.map((item: any) => {
    if (item.shoeCondition === "new_no_defects" && item.stockStatus !== "not_in_stock") {
      const sizeGoat = item.sizeOption.presentation?.toString()?.trim();
      return {
        size_goat: type === PRODUCT_TYPE.SHOE ? sizeGoat : convertSizeClothes(sizeGoat?.toUpperCase()),
        price_goat: item?.lowestPriceCents?.amount / 100 // Convert cents to yen
      };
    }
    return null;
  }).filter((item: any) => item !== null);
  if (type === PRODUCT_TYPE.SHOE) {
    return dataMap?.filter((item: any) => {
      const sizeGoat = Number(item.size_goat);
      const priceGoat = Number(item.price_goat);
      return conditionCheckSize(sizeGoat, priceGoat, type)
    });
  }
  return dataMap || [];
}

function conditionCheckSize(sizeItem: number, nameItem: number, type: string) {
  if (sizeItem && nameItem) {
    if (type === PRODUCT_TYPE.SHOE) {
      if (sizeItem >= 6 && sizeItem <= 12) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
}








// -------------Crawl Data End--------------------

// Helper function to get current time in Vietnam timezone
function getVietnamTime(): string {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  
  const year = vietnamTime.getUTCFullYear();
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getUTCDate()).padStart(2, '0');
  const hours = String(vietnamTime.getUTCHours()).padStart(2, '0');
  const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to save crawled data to database using internal API
async function saveCrawledDataToDatabase(crawledData: any[]) {
  if (!Array.isArray(crawledData) || crawledData.length === 0) {
    console.warn('⚠️ No data to save to database');
    return [];
  }

  console.log(`📊 Starting to save ${crawledData.length} records to database...`);
  const savedRecords = [];
  const failedRecords = [];
  
  for (let i = 0; i < crawledData.length; i++) {
    const data = crawledData[i];
    try {
      // Validate required fields
      if (!data.product_url || !data.product_name) {
        console.warn(`⚠️ Skipping record ${i + 1}: Missing required fields (product_url or product_name)`);
        failedRecords.push({ index: i, data, reason: 'Missing required fields' });
        continue;
      }

      // Prepare data for database insertion
      const dbData = {
        product_url: data.product_url || '',
        product_name: data.product_name || '',
        size_goat: data.size_goat || null,
        price_goat: data.price_goat || null,
        size_snkrdunk: data.size_snkrdunk || null,
        price_snkrdunk: data.price_snkrdunk || null,
        profit_amount: data.profit_amount || null,
        selling_price: data.selling_price || null,
        image_url: data.image?.[0]?.url || null,
        note: data.note || ''
      };

      console.log(`📝 Saving record ${i + 1}/${crawledData.length}: ${dbData.product_name} - Size: ${dbData.size_goat}`);

      // Get current time in Vietnam timezone (UTC+7)
      const vietnamTime = getVietnamTime();

      // Check if record already exists (same product_url and size_goat)
      const existingRecord = await pool.query(
        `SELECT id FROM crawled_data 
         WHERE product_url = $1 AND size_goat = $2 AND del_flag = 0`,
        [dbData.product_url, dbData.size_goat]
      );

      let result;
      if (existingRecord.rows.length > 0) {
        // Update existing record
        console.log(`🔄 Updating existing record for ${dbData.product_name} - Size: ${dbData.size_goat}`);
        result = await pool.query(
          `UPDATE crawled_data 
           SET product_name = $1, price_goat = $2, size_snkrdunk = $3, 
               price_snkrdunk = $4, profit_amount = $5, selling_price = $6, 
               image_url = $7, note = $8, updated_at = $9
           WHERE product_url = $10 AND size_goat = $11 AND del_flag = 0
           RETURNING *`,
          [
            dbData.product_name, dbData.price_goat, dbData.size_snkrdunk,
            dbData.price_snkrdunk, dbData.profit_amount, dbData.selling_price,
            dbData.image_url, dbData.note, vietnamTime, dbData.product_url, dbData.size_goat
          ]
        );
      } else {
        // Insert new record
        result = await pool.query(
          `INSERT INTO crawled_data (
            product_url, product_name, size_goat, price_goat, 
            size_snkrdunk, price_snkrdunk, profit_amount, 
            selling_price, image_url, note, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
          [
            dbData.product_url, dbData.product_name, dbData.size_goat, dbData.price_goat,
            dbData.size_snkrdunk, dbData.price_snkrdunk, dbData.profit_amount,
            dbData.selling_price, dbData.image_url, dbData.note, vietnamTime, vietnamTime
          ]
        );
      }
      
      savedRecords.push(result.rows[0]);
      console.log(`✅ Successfully saved record ${i + 1}: ${dbData.product_name} - Size: ${dbData.size_goat}`);
      
    } catch (error: any) {
      console.error(`❌ Error saving record ${i + 1}:`, error.message);
      console.error(`❌ Failed data:`, data);
      failedRecords.push({ index: i, data, reason: error.message });
      // Continue with next record even if one fails
    }
  }
  
  console.log(`📊 Database save completed at ${getVietnamTime()}:`);
  console.log(`✅ Successfully saved: ${savedRecords.length} records`);
  console.log(`❌ Failed to save: ${failedRecords.length} records`);
  
  if (failedRecords.length > 0) {
    console.log(`⚠️ Failed records details:`, failedRecords);
  }
  
  return savedRecords;
}

// Product routes (old table)
app.use('/products', createProductRoutes(pool));

// Crawled data routes (new table)
app.use('/crawled-data', createCrawledDataRoutes(pool));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
