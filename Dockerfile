# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy necessary files from project
COPY server ./server
COPY routes.json ./
COPY db.json ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Create data directory for volume
RUN mkdir -p /app/data

# Create startup script
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo '# Ensure db.json exists' >> /app/startup.sh && \
    echo 'if [ ! -f /app/db.json ]; then' >> /app/startup.sh && \
    echo '  echo "ERROR: db.json not found!"' >> /app/startup.sh && \
    echo '  exit 1' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo '' >> /app/startup.sh && \
    echo '# Copy database to volume if not exists' >> /app/startup.sh && \
    echo 'if [ ! -f /app/data/db.json ]; then' >> /app/startup.sh && \
    echo '  echo "Initializing database in volume..."' >> /app/startup.sh && \
    echo '  cp /app/db.json /app/data/db.json' >> /app/startup.sh && \
    echo 'else' >> /app/startup.sh && \
    echo '  echo "Database already exists in volume"' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo '' >> /app/startup.sh && \
    echo '# Create symlink for backward compatibility' >> /app/startup.sh && \
    echo 'ln -sf /app/data/db.json /app/db.json' >> /app/startup.sh && \
    echo '' >> /app/startup.sh && \
    echo '# Start the server' >> /app/startup.sh && \
    echo 'echo "Starting production server..."' >> /app/startup.sh && \
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

# Health check with longer start period
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the production server
CMD ["/app/startup.sh"]
