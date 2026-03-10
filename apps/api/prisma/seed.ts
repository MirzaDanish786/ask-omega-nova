import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed OGWI historical data (30 days)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseScore = 3.88 + (Math.random() - 0.45) * 0.3;
    const score = Number(Math.max(1.0, Math.min(5.0, baseScore)).toFixed(2));

    const crisisLevel = score >= 4.5 ? 'CATASTROPHIC'
      : score >= 4.0 ? 'CRITICAL'
      : score >= 3.5 ? 'HIGH'
      : score >= 2.5 ? 'ELEVATED'
      : 'STABLE';

    await prisma.ogwiHistoricalData.create({
      data: {
        date,
        ogwiScore: score,
        crisisLevel: crisisLevel as any,
        regionalHotspots: score >= 4.0 ? ['Middle East', 'Africa'] : [],
        hmmRegime: score >= 4.0 ? 'crisis' : 'normal',
        netSignalDirection: 'neutral',
      },
    });
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
    const severity = ewScore >= 0.85 ? 'SYSTEMIC'
      : ewScore >= 0.7 ? 'CRITICAL'
      : ewScore >= 0.5 ? 'HIGH'
      : ewScore >= 0.3 ? 'ELEVATED'
      : 'STABLE';

    await prisma.earlyWarningData.create({
      data: {
        region,
        score: ewScore,
        severity: severity as any,
        signals: { ogwiDerived: true },
        drivers: ewScore >= 0.5 ? ['elevated_risk', 'regional_instability'] : [],
      },
    });
  }
  console.log('  Seeded 5 early warning records');

  // Seed Agent configs
  const agents = [
    { agentId: 'ogwi-bidaily', name: 'Bi-Daily OGWI Update', schedule: '30 6,18 * * *' },
    { agentId: 'sim-count-reset', name: 'Monthly Sim Count Reset', schedule: '0 0 1 * *' },
    { agentId: 'data-cleanup', name: 'Expired Data Cleanup', schedule: '0 3 * * 0' },
  ];

  for (const agent of agents) {
    await prisma.agentConfig.upsert({
      where: { agentId: agent.agentId },
      update: {},
      create: {
        agentId: agent.agentId,
        name: agent.name,
        schedule: agent.schedule,
        enabled: true,
        status: 'ACTIVE',
      },
    });
  }
  console.log('  Seeded 3 agent configs');

  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
