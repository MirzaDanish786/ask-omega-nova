import { CrisisLevel, EarlyWarningSeverity } from '../types/ogwi.js';

export const OGWI_THRESHOLDS: Record<CrisisLevel, number> = {
  [CrisisLevel.CATASTROPHIC]: 4.5,
  [CrisisLevel.CRITICAL]: 4.0,
  [CrisisLevel.HIGH]: 3.5,
  [CrisisLevel.ELEVATED]: 2.5,
  [CrisisLevel.STABLE]: 0,
};

export function getCrisisLevel(score: number): CrisisLevel {
  if (score >= 4.5) return CrisisLevel.CATASTROPHIC;
  if (score >= 4.0) return CrisisLevel.CRITICAL;
  if (score >= 3.5) return CrisisLevel.HIGH;
  if (score >= 2.5) return CrisisLevel.ELEVATED;
  return CrisisLevel.STABLE;
}

export const REGIONAL_VARIANCE: Record<string, number> = {
  'Middle East': 0.4,
  'Africa': 0.35,
  'Americas': -0.2,
  'Europe': -0.15,
  'APAC': -0.05,
};

export const REGIONS = Object.keys(REGIONAL_VARIANCE);

export const EW_SEVERITY_THRESHOLDS: Record<EarlyWarningSeverity, number> = {
  [EarlyWarningSeverity.SYSTEMIC]: 0.85,
  [EarlyWarningSeverity.CRITICAL]: 0.7,
  [EarlyWarningSeverity.HIGH]: 0.5,
  [EarlyWarningSeverity.ELEVATED]: 0.3,
  [EarlyWarningSeverity.STABLE]: 0,
};

export function getEwSeverity(score: number): EarlyWarningSeverity {
  if (score >= 0.85) return EarlyWarningSeverity.SYSTEMIC;
  if (score >= 0.7) return EarlyWarningSeverity.CRITICAL;
  if (score >= 0.5) return EarlyWarningSeverity.HIGH;
  if (score >= 0.3) return EarlyWarningSeverity.ELEVATED;
  return EarlyWarningSeverity.STABLE;
}

export function getEwColor(severity: EarlyWarningSeverity): string {
  const colors: Record<EarlyWarningSeverity, string> = {
    [EarlyWarningSeverity.STABLE]: '#22c55e',
    [EarlyWarningSeverity.ELEVATED]: '#eab308',
    [EarlyWarningSeverity.HIGH]: '#f97316',
    [EarlyWarningSeverity.CRITICAL]: '#ef4444',
    [EarlyWarningSeverity.SYSTEMIC]: '#991b1b',
  };
  return colors[severity];
}

export const FALLBACK_OGWI = 3.88;
