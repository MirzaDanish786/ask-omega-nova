import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: parseRedisUrl(config.get<string>('REDIS_URL', 'redis://localhost:6379')),
      }),
    }),
  ],
  exports: [BullModule],
})
export class BullConfigModule {}

function parseRedisUrl(url: string): { host: string; port: number } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 6379,
  };
}
