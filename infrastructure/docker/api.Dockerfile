FROM node:20-alpine

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY tsconfig.base.json tsconfig.json ./

# Copy packages and apps manifests
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/api/package.json ./apps/api/

# Install dependencies across workspaces
RUN npm install

# Copy source files
COPY packages/shared-contracts ./packages/shared-contracts
COPY apps/api ./apps/api

# Build shared-contracts and api
RUN npm run build --workspace=@proofhire/shared-contracts
RUN npm run build --workspace=@proofhire/api

EXPOSE 4000

CMD ["npm", "run", "dev:api"]
