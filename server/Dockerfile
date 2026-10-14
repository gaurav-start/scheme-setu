# Production Dockerfile for Scheme Setu Express Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for production build
COPY package*.json ./

RUN npm ci --omit=dev

# Copy application source code
COPY src ./src

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose server port
EXPOSE 5000

# Healthcheck for container health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["npm", "start"]
