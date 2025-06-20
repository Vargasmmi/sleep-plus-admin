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

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy necessary files
COPY server ./server
COPY db.json ./
COPY routes.json ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Create volume mount point for database
VOLUME ["app/db.json"]

# Expose ports
EXPOSE 3001 5173

# Environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    FRONTEND_PORT=5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the production server
CMD ["node", "server/production-server.js"]
