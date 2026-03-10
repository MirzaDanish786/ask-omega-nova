export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  DISABLED = 'DISABLED',
}

export interface IAgentConfig {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  status: AgentStatus;
  schedule: string;
  lastRunAt: Date | null;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgentAuditLog {
  id: string;
  agentId: string;
  action: string;
  status: string;
  durationMs: number;
  error: string | null;
  createdAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  createdAt: Date;
}
