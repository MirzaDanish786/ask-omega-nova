import { DataSource } from 'typeorm';
import { env } from '../config/env.js';
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
} from '../entities/index.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  entities: [
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
  ],
  migrations: [],
  subscribers: [],
});
