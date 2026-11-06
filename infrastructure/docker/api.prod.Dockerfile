# ================================================================
# Multi-stage Production Dockerfile for ProofHire API
# ================================================================
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install curl
RUN apk add --no-cache curl

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY tsconfig.base.json tsconfig.json ./

# Copy packages and apps manifests
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/api/package.json ./apps/api/

# Install dependencies across workspaces
RUN npm ci

# Copy source files
COPY packages/shared-contracts ./packages/shared-contracts
COPY apps/api ./apps/api

# Build shared-contracts and api
RUN npm run build --workspace=@proofhire/shared-contracts
RUN npm run build --workspace=@proofhire/api

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/packages/shared-contracts/dist ./packages/shared-contracts/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle

# Create uploads directory and assign non-root permissions
RUN mkdir -p /app/apps/api/uploads && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["node", "apps/api/dist/index.js"]

