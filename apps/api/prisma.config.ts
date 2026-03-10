import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig, env } from 'prisma/config';

// Load .env from monorepo root (../../.env from apps/api)
config({ path: resolve(import.meta.dirname, '..', '..', '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  seed: 'tsx prisma/seed.ts',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
