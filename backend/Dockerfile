# Sử dụng image Node chính thức
FROM node:20-slim

# Cài các dependencies cần thiết
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg2 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Cài Google Chrome Stable
RUN wget -q -O google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get update && \
    apt-get install -y ./google-chrome.deb && \
    rm google-chrome.deb

# Tạo thư mục app
WORKDIR /app

# Copy package files trước để tận dụng Docker cache
COPY package*.json ./

# Cài thư viện node (bao gồm cả dev dependencies cho tsx)
RUN npm install

# Copy source code
COPY . .

# Cài đặt tsx globally để có thể chạy TypeScript
RUN npm install -g tsx

# Đặt biến môi trường trỏ đến Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

CMD ["sh", "-c", "npm run migrate:up && npm start"]
