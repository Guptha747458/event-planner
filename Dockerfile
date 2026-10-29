# ===================================================
# Stage 1: Build the Vite Frontend
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for Vite)
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY index.html vite.config.js ./
COPY src ./src
COPY server ./server

# Build production static bundle to /app/dist
RUN npm run build

# ===================================================
# Stage 2: Production Server Runtime
# ===================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend server code and built frontend static assets
COPY server ./server
COPY --from=builder /app/dist ./dist

# Ensure the non-root node user owns the app files
RUN chown -R node:node /app

USER node

EXPOSE 3001

# Health check using Alpine's built-in wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the Express server which serves both API and static UI
CMD ["node", "server/index.js"]

