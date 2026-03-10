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

# Generate Prisma client
RUN cd apps/api && npx prisma generate

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
COPY --from=builder /app/packages/shared/ ./packages/shared/

# Copy built API
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/
COPY --from=builder /app/apps/api/prisma/ ./apps/api/prisma/

# Copy generated Prisma client
COPY --from=builder /app/apps/api/node_modules/.prisma/ ./apps/api/node_modules/.prisma/
COPY --from=builder /app/node_modules/.prisma/ ./node_modules/.prisma/

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && cd /app && node apps/api/dist/index.js"]
