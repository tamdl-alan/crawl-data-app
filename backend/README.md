# Crawl Data Backend

## Cài đặt và chạy project

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi động database (PostgreSQL)
```bash
docker-compose up -d
```

### 3. Tạo file .env (nếu chưa có)
Tạo file `.env` trong thư mục `backend` với nội dung:
```
DATABASE_URL=postgresql://postgres:postgres@13.215.70.39:54325/postgres
PORT=3000
NODE_ENV=development
```

### 4. Chạy project

**Development mode (với hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm run serve
```

**Hoặc chạy trực tiếp:**
```bash
npm start
```

### 5. Kiểm tra API
Sau khi chạy thành công, truy cập: http://13.215.70.39:3000

## Cấu trúc project
- `src/index.ts` - Entry point của ứng dụng
- `docker-compose.yml` - Cấu hình PostgreSQL database
- `tsconfig.json` - Cấu hình TypeScript

## Lưu ý
- Database PostgreSQL chạy trên port 54325
- Server chạy trên port 3000 (có thể thay đổi qua biến môi trường PORT)
- Project sử dụng TypeScript với ES modules
