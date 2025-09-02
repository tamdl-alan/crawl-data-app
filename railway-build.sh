#!/bin/bash

# Railway Build Script
# Đảm bảo build context đúng cho backend

echo "🚀 Starting Railway build for backend..."

# Kiểm tra backend directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found!"
    exit 1
fi

# Kiểm tra package.json trong backend
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: backend/package.json not found!"
    exit 1
fi

# Kiểm tra Dockerfile trong backend
if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ Error: backend/Dockerfile not found!"
    exit 1
fi

echo "✅ Backend files found successfully"
echo "📦 Package.json: $(cat backend/package.json | grep '"name"' | head -1)"
echo "🐳 Dockerfile: $(wc -l < backend/Dockerfile) lines"

echo "🎯 Build context: backend/"
echo "🔨 Ready for Railway deployment!"
