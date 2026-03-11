import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { toNodeHandler } from 'better-auth/node';
import { env } from './config/env.js';
import { auth } from './config/auth.js';
import { initializeDatabase } from './database/index.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/error.js';
import { router } from './routes/index.js';
import { startScheduler } from './scheduler/index.js';

async function bootstrap(): Promise<void> {
  // Initialize TypeORM connection
  await initializeDatabase();

  const app = express();

  // Middleware chain
  app.use(helmet());
  app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }));
  app.use(logger);

  // BetterAuth must be mounted BEFORE express.json() and directly on the app.
  // It needs the full URL path (not a sub-router which strips the prefix),
  // and it handles its own body parsing internally.
  app.all('/api/auth/*', toNodeHandler(auth));

  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Routes
  app.use('/api', router);

  // Error handler (must be last)
  app.use(errorHandler);

  // Start
  app.listen(env.PORT, () => {
    console.log(`[API] Omega Nova API running on port ${env.PORT} (${env.NODE_ENV})`);
    startScheduler();
  });
}

bootstrap().catch((err) => {
  console.error('[API] Failed to start:', err);
  process.exit(1);
});
