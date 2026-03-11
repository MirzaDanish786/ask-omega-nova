import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CrisisLevel {
  STABLE = 'STABLE',
  ELEVATED = 'ELEVATED',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  CATASTROPHIC = 'CATASTROPHIC',
}

@Entity('ogwi_historical_data')
export class OgwiHistoricalData {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Index()
  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'float' })
  ogwiScore!: number;

  @Column({ type: 'enum', enum: CrisisLevel })
  crisisLevel!: CrisisLevel;

  @Column({ type: 'text', array: true, default: '{}' })
  regionalHotspots!: string[];

  @Column({ type: 'jsonb', nullable: true })
  forecast!: Record<string, unknown> | null;

  @Column({ type: 'float', default: 0 })
  microDeltaCi!: number;

  @Column({ type: 'float', default: 0 })
  microDeltaRss!: number;

  @Column({ type: 'float', default: 0 })
  microDeltaMomentum!: number;

  @Column({ type: 'varchar', default: 'normal' })
  hmmRegime!: string;

  @Column({ type: 'varchar', default: 'neutral' })
  netSignalDirection!: string;

  @Column({ type: 'int', default: 0 })
  consecutiveEscalatoryUpdates!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
