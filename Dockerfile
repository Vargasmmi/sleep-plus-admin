# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Install all dependencies (including json-server)
COPY package*.json ./
RUN npm ci --production

# Copy necessary files
COPY server ./server
COPY routes.json ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Create data directory for volume
RUN mkdir -p /app/data

# Copy initial database file
COPY db.json ./db.json

# Create startup script
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo '# Check if database exists in volume' >> /app/startup.sh && \
    echo 'if [ ! -f /app/data/db.json ]; then' >> /app/startup.sh && \
    echo '  echo "Copying initial database to volume..."' >> /app/startup.sh && \
    echo '  cp /app/db.json /app/data/db.json' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo '# Create symlink to ensure db.json is always available' >> /app/startup.sh && \
    echo 'ln -sf /app/data/db.json /app/db.json' >> /app/startup.sh && \
    echo '# Start the server' >> /app/startup.sh && \
    echo 'exec node server/production-server.js' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Create volume mount point for database
VOLUME ["/app/data"]

# Expose ports
EXPOSE 3001 5173

# Environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    FRONTEND_PORT=5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the production server
CMD ["/app/startup.sh"]
