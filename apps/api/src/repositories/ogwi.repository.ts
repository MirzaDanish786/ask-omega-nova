import { prisma } from '../config/database.js';
import type { OgwiHistoricalData, CrisisLevel, Prisma } from '@prisma/client';

export class OgwiRepository {
  async getLatest(): Promise<OgwiHistoricalData | null> {
    return prisma.ogwiHistoricalData.findFirst({ orderBy: { date: 'desc' } });
  }

  async getHistorical(params: { from?: Date; to?: Date; limit?: number }): Promise<OgwiHistoricalData[]> {
    const where: Record<string, unknown> = {};
    if (params.from || params.to) {
      where.date = {};
      if (params.from) (where.date as Record<string, Date>).gte = params.from;
      if (params.to) (where.date as Record<string, Date>).lte = params.to;
    }
    return prisma.ogwiHistoricalData.findMany({
      where,
      orderBy: { date: 'desc' },
      take: params.limit ?? 100,
    });
  }

  async create(data: {
    date: Date;
    ogwiScore: number;
    crisisLevel: CrisisLevel;
    regionalHotspots: string[];
    forecast?: Prisma.InputJsonValue;
    microDeltaCi?: number;
    microDeltaRss?: number;
    microDeltaMomentum?: number;
    hmmRegime?: string;
    netSignalDirection?: string;
    consecutiveEscalatoryUpdates?: number;
    notes?: string;
  }): Promise<OgwiHistoricalData> {
    return prisma.ogwiHistoricalData.create({ data });
  }

  async getRecentCount(days: number): Promise<number> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return prisma.ogwiHistoricalData.count({ where: { date: { gte: since } } });
  }
}
