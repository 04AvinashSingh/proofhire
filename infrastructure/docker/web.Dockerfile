FROM node:20-alpine

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY tsconfig.base.json tsconfig.json ./

# Copy packages and apps manifests
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source files
COPY packages/shared-contracts ./packages/shared-contracts
COPY apps/web ./apps/web

# Build shared-contracts
RUN npm run build --workspace=@proofhire/shared-contracts

EXPOSE 3000

CMD ["npm", "run", "dev:web"]
