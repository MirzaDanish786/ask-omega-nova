import { prisma } from '../config/database.js';
import type { EarlyWarningData, EarlyWarningSeverity, Prisma } from '@prisma/client';

export class EarlyWarningRepository {
  async getLatestByRegion(): Promise<EarlyWarningData[]> {
    const regions = ['Americas', 'Europe', 'Middle East', 'Africa', 'APAC'];
    const results: EarlyWarningData[] = [];
    for (const region of regions) {
      const latest = await prisma.earlyWarningData.findFirst({
        where: { region },
        orderBy: { createdAt: 'desc' },
      });
      if (latest) results.push(latest);
    }
    return results;
  }

  async getHistory(params: { region?: string; limit?: number }): Promise<EarlyWarningData[]> {
    return prisma.earlyWarningData.findMany({
      where: params.region ? { region: params.region } : {},
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 100,
    });
  }

  async create(data: {
    region: string;
    score: number;
    severity: EarlyWarningSeverity;
    signals?: Prisma.InputJsonValue;
    drivers?: string[];
  }): Promise<EarlyWarningData> {
    return prisma.earlyWarningData.create({ data });
  }
}
