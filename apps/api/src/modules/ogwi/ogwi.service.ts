import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, type FindOptionsWhere } from 'typeorm';
import {
  getCrisisLevel,
  REGIONAL_VARIANCE,
  REGIONS,
  FALLBACK_OGWI,
  getEwSeverity,
  getEwColor,
  type IOgwiCurrentResponse,
  type IOgwiForecastPoint,
  type IOgwiRegionalBreakdown,
} from '@omega-nova/shared';
import { OgwiHistoricalData, CrisisLevel, EarlyWarningData, EarlyWarningSeverity } from '../../entities/index.js';
import { createId } from '../../utils/id.js';

@Injectable()
export class OgwiService {
  constructor(
    @InjectRepository(OgwiHistoricalData)
    private readonly ogwiRepo: Repository<OgwiHistoricalData>,
    @InjectRepository(EarlyWarningData)
    private readonly ewRepo: Repository<EarlyWarningData>,
  ) {}

  async getCurrent(): Promise<IOgwiCurrentResponse> {
    const [latest] = await this.ogwiRepo.find({ order: { date: 'DESC' }, take: 1 });
    const ogwiScore = latest?.ogwiScore ?? FALLBACK_OGWI;
    const crisisLevel = getCrisisLevel(ogwiScore);

    const regionalBreakdown = this.buildRegionalBreakdown(ogwiScore);
    const earlyWarning = await this.getLatestEarlyWarning();

    return {
      ogwiScore,
      crisisLevel,
      date: (latest?.date ?? new Date()).toISOString().split('T')[0]!,
      regionalBreakdown,
      earlyWarning: earlyWarning.map(ew => ({
        id: ew.id,
        region: ew.region,
        score: ew.score,
        severity: ew.severity as unknown as import('@omega-nova/shared').EarlyWarningSeverity,
        signals: ew.signals as Record<string, unknown>,
        drivers: ew.drivers,
        createdAt: ew.createdAt,
      })),
    };
  }

  async getHistorical(from?: string, to?: string, limit?: number) {
    const where: FindOptionsWhere<OgwiHistoricalData> = {};
    if (from) where.date = MoreThanOrEqual(new Date(from));
    if (to) where.date = LessThanOrEqual(new Date(to));

    return this.ogwiRepo.find({
      where,
      order: { date: 'DESC' },
      take: limit ? Number(limit) : 100,
    });
  }

  async getForecast(): Promise<IOgwiForecastPoint[]> {
    const [latest] = await this.ogwiRepo.find({ order: { date: 'DESC' }, take: 1 });
    const ogwiNow = latest?.ogwiScore ?? FALLBACK_OGWI;
    return this.generate10YearForecast(ogwiNow);
  }

  async triggerUpdate(): Promise<{ ogwiScore: number; crisisLevel: string }> {
    const [latest] = await this.ogwiRepo.find({ order: { date: 'DESC' }, take: 1 });
    const previousScore = latest?.ogwiScore ?? FALLBACK_OGWI;

    const microDelta = (Math.random() - 0.48) * 0.04;
    const newScore = Math.max(1.0, Math.min(5.0, Number((previousScore + microDelta).toFixed(2))));
    const crisisLevel = getCrisisLevel(newScore);

    const hotspots = REGIONS.filter(r => {
      const regional = newScore + (REGIONAL_VARIANCE[r] ?? 0);
      return regional >= 4.0;
    });

    const ogwiEntity = this.ogwiRepo.create({
      id: createId(),
      date: new Date(),
      ogwiScore: newScore,
      crisisLevel: crisisLevel as unknown as CrisisLevel,
      regionalHotspots: hotspots,
      forecast: { generated: new Date().toISOString() },
      microDeltaCi: microDelta,
      microDeltaRss: 0,
      microDeltaMomentum: 0,
      hmmRegime: crisisLevel === 'CRITICAL' || crisisLevel === 'CATASTROPHIC' ? 'crisis' : 'normal',
      netSignalDirection: microDelta > 0 ? 'negative' : microDelta < 0 ? 'positive' : 'neutral',
    });
    await this.ogwiRepo.save(ogwiEntity);

    for (const region of REGIONS) {
      const variance = REGIONAL_VARIANCE[region] ?? 0;
      const regionalScore = Math.max(1.0, Math.min(5.0, newScore + variance));
      const ewScore = Math.max(0, Math.min(1, (regionalScore - 2.5) / 2.5));
      const ewSeverity = getEwSeverity(ewScore);

      const ewEntity = this.ewRepo.create({
        id: createId(),
        region,
        score: Number(ewScore.toFixed(2)),
        severity: ewSeverity as unknown as EarlyWarningSeverity,
        signals: { ogwiDerived: true, regionalScore },
        drivers: hotspots.includes(region) ? ['elevated_ogwi', 'regional_stress'] : [],
      });
      await this.ewRepo.save(ewEntity);
    }

    return { ogwiScore: newScore, crisisLevel };
  }

  async getLatestScore(): Promise<number> {
    const [latest] = await this.ogwiRepo.find({ order: { date: 'DESC' }, take: 1 });
    return latest?.ogwiScore ?? FALLBACK_OGWI;
  }

  async getRecentCount(days: number): Promise<number> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.ogwiRepo.count({ where: { date: MoreThanOrEqual(since) } });
  }

  private async getLatestEarlyWarning(): Promise<EarlyWarningData[]> {
    const regions = ['Americas', 'Europe', 'Middle East', 'Africa', 'APAC'];
    const results: EarlyWarningData[] = [];
    for (const region of regions) {
      const latest = await this.ewRepo.findOne({
        where: { region },
        order: { createdAt: 'DESC' },
      });
      if (latest) results.push(latest);
    }
    return results;
  }

  private buildRegionalBreakdown(globalScore: number): IOgwiRegionalBreakdown[] {
    return REGIONS.map(region => {
      const variance = REGIONAL_VARIANCE[region] ?? 0;
      const score = Math.max(1.0, Math.min(5.0, Number((globalScore + variance).toFixed(2))));
      const crisisLevel = getCrisisLevel(score);
      const ewScore = Math.max(0, Math.min(1, Number(((score - 2.5) / 2.5).toFixed(2))));
      const ewSeverity = getEwSeverity(ewScore);

      return {
        region,
        score,
        crisisLevel,
        earlyWarning: {
          score: ewScore,
          severity: ewSeverity,
          color: getEwColor(ewSeverity),
        },
      };
    });
  }

  private generate10YearForecast(ogwiNow: number): IOgwiForecastPoint[] {
    const currentYear = new Date().getFullYear();
    const trend = (ogwiNow - 3.0) * 0.05;

    return Array.from({ length: 11 }, (_, i) => {
      const projected = Number(Math.max(1.0, Math.min(5.0, ogwiNow + trend * i)).toFixed(2));
      return {
        year: currentYear + i,
        projected,
        confidence50: [
          Number(Math.max(1.0, projected - 0.15).toFixed(2)),
          Number(Math.min(5.0, projected + 0.15).toFixed(2)),
        ] as [number, number],
        confidence80: [
          Number(Math.max(1.0, projected - 0.30).toFixed(2)),
          Number(Math.min(5.0, projected + 0.30).toFixed(2)),
        ] as [number, number],
      };
    });
  }
}
