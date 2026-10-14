# Production Dockerfile for Scheme Setu Express Backend (Root Repository Context)
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files from server
COPY server/package*.json ./

RUN npm ci --omit=dev

# Copy server source code
COPY server/src ./src

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose server port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]
