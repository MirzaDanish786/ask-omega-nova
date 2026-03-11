import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { OgwiModule } from './modules/ogwi/ogwi.module.js';
import { SimulationsModule } from './modules/simulations/simulations.module.js';
import { EarlyWarningModule } from './modules/early-warning/early-warning.module.js';
import { KnowledgeModule } from './modules/knowledge/knowledge.module.js';
import { AgentsModule } from './modules/agents/agents.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { SchedulerModule } from './modules/scheduler/scheduler.module.js';
import { HealthController } from './health.controller.js';
import { envValidation } from './config/env.validation.js';
import {
  User,
  Session,
  Account,
  Verification,
  OgwiHistoricalData,
  Osd12Composite,
  Simulation,
  KnowledgeBaseArticle,
  EarlyWarningData,
  AgentConfig,
  AgentAuditLog,
  Notification,
  AuditLog,
  ClientCompany,
} from './entities/index.js';

@Module({
  imports: [
    // Config — load .env from monorepo root
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
      validate: envValidation,
    }),

    // TypeORM — PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development' ? ['error', 'warn'] as const : ['error'] as const,
        entities: [
          User, Session, Account, Verification,
          OgwiHistoricalData, Osd12Composite, Simulation,
          KnowledgeBaseArticle, EarlyWarningData,
          AgentConfig, AgentAuditLog,
          Notification, AuditLog, ClientCompany,
        ],
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 15 * 60 * 1000,
      limit: 200,
    }]),

    // Feature modules
    AuthModule,
    UsersModule,
    OgwiModule,
    SimulationsModule,
    EarlyWarningModule,
    KnowledgeModule,
    AgentsModule,
    NotificationsModule,
    AdminModule,
    SchedulerModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    // BetterAuth middleware is configured in AuthModule
  }
}
