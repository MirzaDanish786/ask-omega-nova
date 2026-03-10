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
import { OgwiRepository } from '../repositories/ogwi.repository.js';
import { EarlyWarningRepository } from '../repositories/earlywarning.repository.js';
import { CrisisLevel, EarlyWarningSeverity } from '../entities/index.js';

export class OgwiService {
  private ogwiRepo = new OgwiRepository();
  private ewRepo = new EarlyWarningRepository();

  async getCurrent(): Promise<IOgwiCurrentResponse> {
    const latest = await this.ogwiRepo.getLatest();
    const ogwiScore = latest?.ogwiScore ?? FALLBACK_OGWI;
    const crisisLevel = getCrisisLevel(ogwiScore);

    const regionalBreakdown = this.buildRegionalBreakdown(ogwiScore);
    const earlyWarning = await this.ewRepo.getLatestByRegion();

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
    return this.ogwiRepo.getHistorical({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? Number(limit) : 100,
    });
  }

  async getForecast(): Promise<IOgwiForecastPoint[]> {
    const latest = await this.ogwiRepo.getLatest();
    const ogwiNow = latest?.ogwiScore ?? FALLBACK_OGWI;
    return this.generate10YearForecast(ogwiNow);
  }

  async triggerUpdate(): Promise<{ ogwiScore: number; crisisLevel: string }> {
    const latest = await this.ogwiRepo.getLatest();
    const previousScore = latest?.ogwiScore ?? FALLBACK_OGWI;

    // Simplified update logic (in production, integrates external data)
    const microDelta = (Math.random() - 0.48) * 0.04; // slight upward bias
    const newScore = Math.max(1.0, Math.min(5.0, Number((previousScore + microDelta).toFixed(2))));
    const crisisLevel = getCrisisLevel(newScore);

    const hotspots = REGIONS.filter(r => {
      const regional = newScore + (REGIONAL_VARIANCE[r] ?? 0);
      return regional >= 4.0;
    });

    await this.ogwiRepo.create({
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

    // Create early warning entries for each region
    for (const region of REGIONS) {
      const variance = REGIONAL_VARIANCE[region] ?? 0;
      const regionalScore = Math.max(1.0, Math.min(5.0, newScore + variance));
      const ewScore = Math.max(0, Math.min(1, (regionalScore - 2.5) / 2.5));
      const ewSeverity = getEwSeverity(ewScore);

      await this.ewRepo.create({
        region,
        score: Number(ewScore.toFixed(2)),
        severity: ewSeverity as unknown as EarlyWarningSeverity,
        signals: { ogwiDerived: true, regionalScore },
        drivers: hotspots.includes(region) ? ['elevated_ogwi', 'regional_stress'] : [],
      });
    }

    return { ogwiScore: newScore, crisisLevel };
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
