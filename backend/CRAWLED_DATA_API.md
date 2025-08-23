# Crawled Data API Documentation

## Table Schema

```sql
CREATE TABLE crawled_data (
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
);
```

## API Endpoints

### Base URL
```
http://localhost:3000/crawled-data
```

### 1. Get All Crawled Data
**GET** `/crawled-data`

**Query Parameters:**
- `sortBy` (optional): Field to sort by (id, product_name, price_goat, price_snkrdunk, profit_amount, selling_price, created_at)
- `sortOrder` (optional): Sort order (asc, desc) - default: desc
- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 10

**Note:** Only records with `del_flag = 0` (active records) are returned.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "product_url": "https://www.goat.com/sneakers/...",
      "product_name": "Air Jordan 1 Retro High OG Chicago 2022",
      "size_goat": "US 9",
      "price_goat": "299.99",
      "size_snkrdunk": "US 9",
      "price_snkrdunk": "250.00",
      "profit_amount": "49.99",
      "selling_price": "350.00",
      "image_url": "https://example.com/jordan1.jpg",
      "note": "Limited edition, high demand",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 2. Get Crawled Data by ID
**GET** `/crawled-data/:id`

**Response:**
```json
{
  "id": 1,
  "product_url": "https://www.goat.com/sneakers/...",
  "product_name": "Air Jordan 1 Retro High OG Chicago 2022",
  "size_goat": "US 9",
  "price_goat": "299.99",
  "size_snkrdunk": "US 9",
  "price_snkrdunk": "250.00",
  "profit_amount": "49.99",
  "selling_price": "350.00",
  "image_url": "https://example.com/jordan1.jpg",
  "note": "Limited edition, high demand",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 3. Create Crawled Data Record
**POST** `/crawled-data`

**Request Body:**
```json
{
  "product_url": "https://www.goat.com/sneakers/...",
  "product_name": "Nike Air Max 270",
  "size_goat": "US 10",
  "price_goat": 150.00,
  "size_snkrdunk": "US 10",
  "price_snkrdunk": 120.00,
  "profit_amount": 30.00,
  "selling_price": 180.00,
  "image_url": "https://example.com/airmax.jpg",
  "note": "Comfortable running shoes"
}
```

**Required Fields:**
- `product_url` (string)
- `product_name` (string)

**Optional Fields:**
- `size_goat` (string)
- `price_goat` (number)
- `size_snkrdunk` (string)
- `price_snkrdunk` (number)
- `profit_amount` (number)
- `selling_price` (number)
- `image_url` (string)
- `note` (string)

**Response:**
```json
{
  "id": 2,
  "product_url": "https://www.goat.com/sneakers/...",
  "product_name": "Nike Air Max 270",
  "size_goat": "US 10",
  "price_goat": "150.00",
  "size_snkrdunk": "US 10",
  "price_snkrdunk": "120.00",
  "profit_amount": "30.00",
  "selling_price": "180.00",
  "image_url": "https://example.com/airmax.jpg",
  "note": "Comfortable running shoes",
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### 4. Update Crawled Data Record
**PUT** `/crawled-data/:id`

**Request Body:** Same as Create

**Response:** Updated crawled data object

### 5. Soft Delete Crawled Data Record
**DELETE** `/crawled-data/:id`

**Response:** 200 OK
```json
{
  "message": "Crawled data deleted successfully"
}
```

**Note:** This is a soft delete operation. The record is not physically deleted from the database. Instead, the `del_flag` field is set to `2` to mark it as deleted. Records with `del_flag = 0` are considered active, while records with `del_flag = 2` are considered deleted.

## Del Flag Values

- `0`: Active record (default)
- `2`: Deleted record (soft deleted)

## Error Responses

### 400 Bad Request
```json
{
  "error": "Product URL and Product Name are required"
}
```

### 404 Not Found
```json
{
  "error": "Crawled data not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create crawled data"
}
```

## Setup Instructions

1. **Initialize the table:**
   ```bash
   npm run init-crawled-data
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Test the API:**
   ```bash
   # Get all crawled data
   curl http://localhost:3000/crawled-data
   
   # Create a crawled data record
   curl -X POST http://localhost:3000/crawled-data \
     -H "Content-Type: application/json" \
     -d '{
       "product_url": "https://example.com/product",
       "product_name": "Test Product",
       "price_goat": 100.00,
       "selling_price": 150.00
     }'
   ```

## Sample Data

The initialization script will create sample crawled data with:
- Air Jordan 1 Retro High OG Chicago 2022
- Nike Dunk Low Retro White Black

Each with complete pricing information including Goat prices, Snkrdunk prices, profit calculations, and selling prices.

## Purpose

This API is designed to store and manage data that has been crawled from various sources (Goat, Snkrdunk, etc.) for price comparison and profit analysis purposes.
