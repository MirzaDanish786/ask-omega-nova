export enum CrisisLevel {
  STABLE = 'STABLE',
  ELEVATED = 'ELEVATED',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  CATASTROPHIC = 'CATASTROPHIC',
}

export enum EarlyWarningSeverity {
  STABLE = 'STABLE',
  ELEVATED = 'ELEVATED',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  SYSTEMIC = 'SYSTEMIC',
}

export interface IOgwiHistoricalData {
  id: string;
  date: Date;
  ogwiScore: number;
  crisisLevel: CrisisLevel;
  regionalHotspots: string[];
  forecast: Record<string, unknown>;
  microDeltaCi: number;
  microDeltaRss: number;
  microDeltaMomentum: number;
  hmmRegime: string;
}

export interface IEarlyWarningData {
  id: string;
  region: string;
  score: number;
  severity: EarlyWarningSeverity;
  signals: Record<string, unknown>;
  drivers: string[];
  createdAt: Date;
}

export interface IOgwiRegionalBreakdown {
  region: string;
  score: number;
  crisisLevel: CrisisLevel;
  earlyWarning: {
    score: number;
    severity: EarlyWarningSeverity;
    color: string;
  };
}

export interface IOgwiForecastPoint {
  year: number;
  projected: number;
  confidence50: [number, number];
  confidence80: [number, number];
}

export interface IOgwiCurrentResponse {
  ogwiScore: number;
  crisisLevel: CrisisLevel;
  date: string;
  regionalBreakdown: IOgwiRegionalBreakdown[];
  earlyWarning: IEarlyWarningData[];
}
