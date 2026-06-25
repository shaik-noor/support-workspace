# Stage 1: Base image for building
FROM node:22-slim AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 4: Install production dependencies only (for smaller runner image)
FROM base AS production-deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 5: Production runner
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs --gid 1001 && \
    chown -R nodejs:nodejs /app

# Copy build artifacts, production dependencies, and package files with correct ownership
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist
COPY --chown=nodejs:nodejs --from=production-deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

EXPOSE 4000

# Start the application using srvx serve
CMD ["node", "node_modules/srvx/bin/srvx.mjs", "serve", "--dir", ".", "--entry", "./dist/server/server.js", "--static", "./dist/client", "--prod"]
