import 'reflect-metadata';
import { AppDataSource } from './data-source.js';

export { AppDataSource } from './data-source.js';

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('[Database] TypeORM connection established');
  } catch (error) {
    console.error('[Database] Failed to initialize TypeORM:', error);
    process.exit(1);
  }
}
