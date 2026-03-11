import { MoreThanOrEqual, LessThanOrEqual, type FindOptionsWhere, type Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { OgwiHistoricalData, type CrisisLevel } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class OgwiRepository {
  private repo: Repository<OgwiHistoricalData>;

  constructor() {
    this.repo = AppDataSource.getRepository(OgwiHistoricalData);
  }

  async getLatest(): Promise<OgwiHistoricalData | null> {
    return this.repo.findOne({ order: { date: 'DESC' } });
  }

  async getHistorical(params: { from?: Date; to?: Date; limit?: number }): Promise<OgwiHistoricalData[]> {
    const where: FindOptionsWhere<OgwiHistoricalData> = {};
    if (params.from) where.date = MoreThanOrEqual(params.from);
    if (params.to) where.date = LessThanOrEqual(params.to);

    return this.repo.find({
      where,
      order: { date: 'DESC' },
      take: params.limit ?? 100,
    });
  }

  async create(data: {
    date: Date;
    ogwiScore: number;
    crisisLevel: CrisisLevel;
    regionalHotspots: string[];
    forecast?: Record<string, unknown>;
    microDeltaCi?: number;
    microDeltaRss?: number;
    microDeltaMomentum?: number;
    hmmRegime?: string;
    netSignalDirection?: string;
    consecutiveEscalatoryUpdates?: number;
    notes?: string;
  }): Promise<OgwiHistoricalData> {
    const entity = this.repo.create({ id: createId(), ...data });
    return this.repo.save(entity);
  }

  async getRecentCount(days: number): Promise<number> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.repo.count({ where: { date: MoreThanOrEqual(since) } });
  }
}
