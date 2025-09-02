# Railway Deployment Guide

## 🚀 Cách deploy lên Railway

### 1. **Cấu trúc Project**
Railway sẽ chỉ build và deploy **backend service** thay vì toàn bộ project.

### 2. **Files cần thiết**
- `railway.json` - Cấu hình Railway build
- `railway.toml` - Cấu hình deployment
- `.railwayignore` - Loại bỏ files không cần thiết
- `backend/Dockerfile` - Docker build cho backend

### 3. **Environment Variables cần set trong Railway**
```
DATABASE_URL=postgresql://username:password@host:port/database
EMAIL_SNKRDUNK=your_email@example.com
PASSWORD_SNKRDUNK=your_password
NODE_ENV=production
PORT=3000
```

### 4. **Database Setup**
- Tạo PostgreSQL service trong Railway
- Copy connection string vào `DATABASE_URL`
- Railway sẽ tự động inject vào container

### 5. **Deploy Steps**
1. Push code lên GitHub
2. Connect repository với Railway
3. Railway sẽ tự động build từ `backend/Dockerfile`
4. Set environment variables
5. Deploy

### 6. **Health Check**
Backend có endpoint `/health` để Railway kiểm tra service status.

### 7. **Lưu ý**
- Frontend sẽ được deploy riêng (nếu cần)
- Backend sẽ chạy trên port 3000
- Database migration sẽ tự động chạy khi container start
