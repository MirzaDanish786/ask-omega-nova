# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./

# Copy package manifests for all workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared package and API
RUN npx turbo build --filter=@omega-nova/api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* ./

# Copy package manifests
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN npm install --omit=dev

# Copy built shared package
COPY --from=builder /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Copy built API
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
