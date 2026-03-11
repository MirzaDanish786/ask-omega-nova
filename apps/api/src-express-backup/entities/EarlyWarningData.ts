import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EarlyWarningSeverity {
  STABLE = 'STABLE',
  ELEVATED = 'ELEVATED',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  SYSTEMIC = 'SYSTEMIC',
}

@Entity('early_warning_data')
@Index(['region'])
@Index(['createdAt'])
export class EarlyWarningData {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  region!: string;

  @Column({ type: 'float' })
  score!: number;

  @Column({ type: 'enum', enum: EarlyWarningSeverity })
  severity!: EarlyWarningSeverity;

  @Column({ type: 'jsonb', nullable: true })
  signals!: Record<string, unknown> | null;

  @Column({ type: 'text', array: true, default: '{}' })
  drivers!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}
