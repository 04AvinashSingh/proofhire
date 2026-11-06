# ================================================================
# Multi-stage Production Dockerfile for ProofHire Web (Nginx)
# ================================================================
# Stage 1: Build React/Vite App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY tsconfig.base.json tsconfig.json ./

# Copy packages and apps manifests
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/web/package.json ./apps/web/

# Install dependencies across workspaces
RUN npm ci

# Copy source files
COPY packages/shared-contracts ./packages/shared-contracts
COPY apps/web ./apps/web

# Build shared-contracts and web
RUN npm run build --workspace=@proofhire/shared-contracts
RUN npm run build --workspace=@proofhire/web

# Stage 2: Nginx Web Server
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built web artifacts
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

