import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  // CORS — must be before anything else
  app.enableCors({
    origin: [
      frontendUrl,
      // Dev: browser may resolve localhost as 127.0.0.1 or [::1]
      ...(configService.get('NODE_ENV') === 'development'
        ? ['http://127.0.0.1:5173', 'http://[::1]:5173']
        : []),
    ],
    credentials: true,
  });

  // Mount BetterAuth DIRECTLY on Express, BEFORE NestJS global prefix.
  // This bypasses NestJS routing entirely for auth — BetterAuth handles its own routing.
  const betterAuthHandler = toNodeHandler(auth);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.all('/api/auth/*', (req: any, res: any) => {
    betterAuthHandler(req, res);
  });

  // Global prefix for all NestJS controller routes
  app.setGlobalPrefix('api');

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter(configService));
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  console.log(`[API] Omega Nova NestJS API running on port ${port} (${configService.get('NODE_ENV')})`);
}

bootstrap().catch((err) => {
  console.error('[API] Failed to start:', err);
  process.exit(1);
});
