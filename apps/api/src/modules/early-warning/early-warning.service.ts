import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EarlyWarningData } from '../../entities/index.js';

@Injectable()
export class EarlyWarningService {
  constructor(
    @InjectRepository(EarlyWarningData)
    private readonly repo: Repository<EarlyWarningData>,
  ) {}

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

  async getHistory(region?: string, limit?: number): Promise<EarlyWarningData[]> {
    return this.repo.find({
      where: region ? { region } : {},
      order: { createdAt: 'DESC' },
      take: limit ?? 100,
    });
  }
}
