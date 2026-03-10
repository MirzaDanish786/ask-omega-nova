import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AgentConfig } from './AgentConfig.js';

@Entity('agent_audit_log')
export class AgentAuditLog {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  agentId!: string;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  durationMs!: number;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => AgentConfig, (agent) => agent.auditLogs)
  @JoinColumn({ name: 'agentId', referencedColumnName: 'agentId' })
  agent!: AgentConfig;
}
