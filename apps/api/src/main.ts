import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS
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
