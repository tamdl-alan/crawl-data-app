# Railway Deployment - Đơn giản với Docker Compose

## 🚀 Cách deploy lên Railway

### 1. **Sử dụng Docker Compose có sẵn**
Railway có thể deploy trực tiếp từ `docker-compose.yml` mà không cần file cấu hình phức tạp.

### 2. **Cách deploy:**

#### **Option 1: Deploy toàn bộ stack (3 services)**
- Sử dụng `docker-compose.yml` gốc
- Railway sẽ deploy cả db, backend, frontend
- Cần set environment variables cho database

#### **Option 2: Deploy chỉ backend (khuyến nghị)**
- Sử dụng `docker-compose.railway.yml`
- Chỉ deploy backend service
- Tạo PostgreSQL service riêng trong Railway
- Set `DATABASE_URL` từ Railway PostgreSQL service

### 3. **Environment Variables cần set:**
```
DATABASE_URL=postgresql://username:password@host:port/database
EMAIL_SNKRDUNK=your_email@example.com
PASSWORD_SNKRDUNK=your_password
```

### 4. **Deploy Steps:**
1. Push code lên GitHub
2. Connect repository với Railway
3. Railway sẽ tự động detect `docker-compose.yml`
4. Set environment variables
5. Deploy!

### 5. **Lưu ý:**
- **Local development**: Sử dụng `docker-compose.yml` gốc
- **Railway production**: Sử dụng `docker-compose.railway.yml` hoặc `docker-compose.yml` gốc
- Backend có endpoint `/health` để Railway health check
- Database migration tự động chạy khi container start
