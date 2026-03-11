import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(import.meta.dirname, '..', '..', '..', '..', '.env') });

import { AppDataSource } from './data-source.js';
import {
  OgwiHistoricalData,
  CrisisLevel,
  EarlyWarningData,
  EarlyWarningSeverity,
  AgentConfig,
  AgentStatus,
} from '../entities/index.js';
import { createId } from '../utils/id.js';

async function main() {
  await AppDataSource.initialize();
  console.log('Seeding database...');

  const ogwiRepo = AppDataSource.getRepository(OgwiHistoricalData);
  const ewRepo = AppDataSource.getRepository(EarlyWarningData);
  const agentRepo = AppDataSource.getRepository(AgentConfig);

  // Seed OGWI historical data (30 days)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseScore = 3.88 + (Math.random() - 0.45) * 0.3;
    const score = Number(Math.max(1.0, Math.min(5.0, baseScore)).toFixed(2));

    const crisisLevel = score >= 4.5 ? CrisisLevel.CATASTROPHIC
      : score >= 4.0 ? CrisisLevel.CRITICAL
      : score >= 3.5 ? CrisisLevel.HIGH
      : score >= 2.5 ? CrisisLevel.ELEVATED
      : CrisisLevel.STABLE;

    const entity = ogwiRepo.create({
      id: createId(),
      date,
      ogwiScore: score,
      crisisLevel,
      regionalHotspots: score >= 4.0 ? ['Middle East', 'Africa'] : [],
      hmmRegime: score >= 4.0 ? 'crisis' : 'normal',
      netSignalDirection: 'neutral',
    });
    await ogwiRepo.save(entity);
  }
  console.log('  Seeded 31 OGWI historical records');

  // Seed Early Warning data
  const regions = [
    { region: 'Americas', variance: -0.2 },
    { region: 'Europe', variance: -0.15 },
    { region: 'Middle East', variance: 0.4 },
    { region: 'Africa', variance: 0.35 },
    { region: 'APAC', variance: -0.05 },
  ];

  for (const { region, variance } of regions) {
    const ewScore = Number(Math.max(0, Math.min(1, (3.88 + variance - 2.5) / 2.5)).toFixed(2));
    const severity = ewScore >= 0.85 ? EarlyWarningSeverity.SYSTEMIC
      : ewScore >= 0.7 ? EarlyWarningSeverity.CRITICAL
      : ewScore >= 0.5 ? EarlyWarningSeverity.HIGH
      : ewScore >= 0.3 ? EarlyWarningSeverity.ELEVATED
      : EarlyWarningSeverity.STABLE;

    const entity = ewRepo.create({
      id: createId(),
      region,
      score: ewScore,
      severity,
      signals: { ogwiDerived: true },
      drivers: ewScore >= 0.5 ? ['elevated_risk', 'regional_instability'] : [],
    });
    await ewRepo.save(entity);
  }
  console.log('  Seeded 5 early warning records');

  // Seed Agent configs
  const agents = [
    { agentId: 'ogwi-bidaily', name: 'Bi-Daily OGWI Update', schedule: '30 6,18 * * *' },
    { agentId: 'sim-count-reset', name: 'Monthly Sim Count Reset', schedule: '0 0 1 * *' },
    { agentId: 'data-cleanup', name: 'Expired Data Cleanup', schedule: '0 3 * * 0' },
  ];

  for (const agent of agents) {
    const existing = await agentRepo.findOne({ where: { agentId: agent.agentId } });
    if (!existing) {
      const entity = agentRepo.create({
        id: createId(),
        agentId: agent.agentId,
        name: agent.name,
        schedule: agent.schedule,
        enabled: true,
        status: AgentStatus.ACTIVE,
      });
      await agentRepo.save(entity);
    }
  }
  console.log('  Seeded 3 agent configs');

  console.log('Seeding complete!');
  await AppDataSource.destroy();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
