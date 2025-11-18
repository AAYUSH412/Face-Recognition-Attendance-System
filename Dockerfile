# Multi-stage Dockerfile for Face Recognition Attendance System
# Created by Aayush Vaghela (https://github.com/AAYUSH412)

# Stage 1: Build the client application
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Build the admin application
FROM node:18-alpine AS admin-builder
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci --only=production
COPY admin/ ./
RUN npm run build

# Stage 3: Setup the server
FROM node:18-alpine AS server
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Stage 4: Final production image
FROM node:18-alpine
LABEL maintainer="Aayush Vaghela <https://github.com/AAYUSH412>"
LABEL description="Face Recognition Attendance System - AI-powered contactless attendance management"
LABEL version="1.0.0"

# Install necessary packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy server files
COPY --from=server /app ./server

# Copy built client and admin applications
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=admin-builder /app/admin/dist ./admin/dist

# Create nginx configuration
RUN mkdir -p /etc/nginx/conf.d
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Create nginx directories
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp/client_body /var/lib/nginx/tmp/proxy /var/lib/nginx/tmp/fastcgi /var/lib/nginx/tmp/uwsgi /var/lib/nginx/tmp/scgi

# Expose ports
EXPOSE 80 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Set working directory to server
WORKDIR /app/server

# Start supervisor
CMD ["/usr/local/bin/startup.sh"]
