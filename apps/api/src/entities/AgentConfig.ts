import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AgentAuditLog } from './AgentAuditLog.js';

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  DISABLED = 'DISABLED',
}

@Entity('agent_config')
export class AgentConfig {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar', unique: true })
  agentId!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.ACTIVE })
  status!: AgentStatus;

  @Column({ type: 'varchar' })
  schedule!: string;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  errorCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => AgentAuditLog, (log) => log.agent)
  auditLogs!: AgentAuditLog[];
}
