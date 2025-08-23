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
);
