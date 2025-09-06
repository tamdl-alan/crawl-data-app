# Multi-stage build for Vue.js frontend with Nginx

# Stage 1: Build Vue.js application
FROM node:18-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build Vue.js application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production-stage

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Vue.js application from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Set proper permissions for nginx user (already exists in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://13.215.70.39:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
