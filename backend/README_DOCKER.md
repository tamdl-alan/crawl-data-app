# 🐳 Docker Compose Setup - Crawl Data App

## 📋 Tổng quan

Docker Compose này bao gồm:
- ✅ **PostgreSQL Database** (Port 54325)
- ✅ **Backend API** với Chrome (Port 3000)
- ✅ **Development Environment** với hot reload (Port 3001)
- ✅ **Health checks** tự động
- ✅ **Volume persistence** cho data và cache

## 🚀 Quick Start

### 1. Tạo file .env
```bash
# Tạo file .env trong thư mục backend
cp .env.example .env

# Hoặc tạo thủ công
cat > .env << EOF
DATABASE_URL=postgresql://postgres:admin-crawl@13.215.70.39:54325/crawl-data
EMAIL_SNKRDUNK=your_email@example.com
PASSWORD_SNKRDUNK=your_password
NODE_ENV=production
PORT=3000
EOF
```

### 2. Chạy Production Environment
```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 3. Chạy Development Environment
```bash
# Chạy development với hot reload
docker-compose --profile dev up -d

# Hoặc chạy chỉ development service
docker-compose up backend-dev db
```

## 📊 Services

### Database (PostgreSQL)
- **Container**: `crawl-data-db`
- **Port**: `54325:5432`
- **Database**: `crawl-data`
- **User**: `postgres`
- **Password**: `admin-crawl`
- **Volume**: `postgres_data`

### Backend Production
- **Container**: `crawl-data-backend`
- **Port**: `3000:3000`
- **Environment**: Production
- **Chrome**: Pre-installed
- **Volume**: `chrome_cache`, `./logs`

### Backend Development
- **Container**: `crawl-data-backend-dev`
- **Port**: `3001:3000`
- **Environment**: Development
- **Hot Reload**: Enabled
- **Volume**: Source code mounted

## 🔧 Các lệnh hữu ích

### Start/Stop Services
```bash
# Start tất cả services
docker-compose up -d

# Stop tất cả services
docker-compose down

# Restart services
docker-compose restart

# Start với logs
docker-compose up
```

### Development Commands
```bash
# Chạy development environment
docker-compose --profile dev up -d

# Chạy chỉ backend-dev và database
docker-compose up backend-dev db

# Xem logs development
docker-compose logs -f backend-dev
```

### Build Commands
```bash
# Build images
docker-compose build

# Build với no-cache
docker-compose build --no-cache

# Build chỉ backend
docker-compose build backend
```

### Logs & Monitoring
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs chỉ backend
docker-compose logs -f backend

# Xem logs chỉ database
docker-compose logs -f db

# Kiểm tra status
docker-compose ps
```

### Database Commands
```bash
# Connect vào database
docker exec -it crawl-data-db psql -U postgres -d crawl-data

# Backup database
docker exec crawl-data-db pg_dump -U postgres crawl-data > backup.sql

# Restore database
docker exec -i crawl-data-db psql -U postgres -d crawl-data < backup.sql
```

### Cleanup Commands
```bash
# Dừng và xóa containers
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Xóa images
docker-compose down --rmi all

# Cleanup tất cả
docker system prune -a
```

## 🌐 Access URLs

### API Endpoints
- **Production**: http://13.215.70.39:3000
- **Development**: http://13.215.70.39:3001
- **Health Check**: http://13.215.70.39:3000/ (hoặc 3001)

### Database
- **Host**: 13.215.70.39
- **Port**: 54325
- **Database**: crawl-data
- **User**: postgres
- **Password**: admin-crawl

## 🔍 Health Checks

### Database Health
```bash
# Kiểm tra database
docker-compose exec db pg_isready -U postgres

# Hoặc
curl -f http://13.215.70.39:3000/
```

### Backend Health
```bash
# Kiểm tra backend
curl http://13.215.70.39:3000/

# Xem container status
docker-compose ps
```

## 📁 Volumes

### Persistent Data
- `postgres_data`: Database data
- `chrome_cache`: Chrome browser cache
- `./logs`: Application logs

### Development Volumes
- `.:/app`: Source code (development only)
- `/app/node_modules`: Node modules (development only)

## 🔒 Environment Variables

### Required
```env
DATABASE_URL=postgresql://postgres:admin-crawl@db:5432/crawl-data
EMAIL_SNKRDUNK=your_email@example.com
PASSWORD_SNKRDUNK=your_password
```

### Optional
```env
NODE_ENV=production
PORT=3000
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## 🚨 Troubleshooting

### Container không start
```bash
# Xem logs
docker-compose logs backend

# Kiểm tra health check
curl http://13.215.70.39:3000/

# Restart service
docker-compose restart backend
```

### Database connection issues
```bash
# Kiểm tra database
docker-compose logs db

# Connect trực tiếp
docker exec -it crawl-data-db psql -U postgres -d crawl-data

# Restart database
docker-compose restart db
```

### Chrome/Puppeteer issues
```bash
# Kiểm tra Chrome
docker exec -it crawl-data-backend google-chrome --version

# Rebuild backend
docker-compose build --no-cache backend
```

### Memory issues
```bash
# Kiểm tra memory usage
docker stats

# Tăng memory limit trong docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

## 📊 Performance

### Resource Usage
- **Database**: ~100MB RAM
- **Backend**: ~500MB-1GB RAM
- **Chrome**: ~200-500MB RAM
- **Total**: ~1-2GB RAM

### Startup Time
- **Database**: ~10-15s
- **Backend**: ~30-60s
- **Total**: ~40-75s

## 🎯 Best Practices

### Development
```bash
# Sử dụng development profile
docker-compose --profile dev up -d

# Hot reload với volume mount
docker-compose up backend-dev db
```

### Production
```bash
# Build optimized images
docker-compose build

# Run detached
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

### Maintenance
```bash
# Regular cleanup
docker-compose down -v
docker system prune -f

# Update images
docker-compose pull
docker-compose build --no-cache
```

## 🎉 Kết luận

Với setup này bạn có thể:
- ✅ Chạy tất cả với 1 lệnh: `docker-compose up -d`
- ✅ Chrome và Database sẵn sàng
- ✅ Development với hot reload
- ✅ Health checks tự động
- ✅ Logs real-time
- ✅ Easy maintenance và scaling
