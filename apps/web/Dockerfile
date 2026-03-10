# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./

# Copy package manifests for all workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Build shared package and web app
RUN npx turbo build --filter=@omega-nova/web

# Production stage - serve with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/apps/web/dist/ /usr/share/nginx/html/

# Nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://api:3001; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
