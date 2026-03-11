import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { EarlyWarningData, type EarlyWarningSeverity } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class EarlyWarningRepository {
  private repo: Repository<EarlyWarningData>;

  constructor() {
    this.repo = AppDataSource.getRepository(EarlyWarningData);
  }

  async getLatestByRegion(): Promise<EarlyWarningData[]> {
    const regions = ['Americas', 'Europe', 'Middle East', 'Africa', 'APAC'];
    const results: EarlyWarningData[] = [];

    for (const region of regions) {
      const latest = await this.repo.findOne({
        where: { region },
        order: { createdAt: 'DESC' },
      });
      if (latest) results.push(latest);
    }

    return results;
  }

  async getHistory(params: { region?: string; limit?: number }): Promise<EarlyWarningData[]> {
    return this.repo.find({
      where: params.region ? { region: params.region } : {},
      order: { createdAt: 'DESC' },
      take: params.limit ?? 100,
    });
  }

  async create(data: {
    region: string;
    score: number;
    severity: EarlyWarningSeverity;
    signals?: Record<string, unknown>;
    drivers?: string[];
  }): Promise<EarlyWarningData> {
    const entity = this.repo.create({ id: createId(), ...data });
    return this.repo.save(entity);
  }
}
