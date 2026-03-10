import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('osd12_composite')
export class Osd12Composite {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Index()
  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'varchar' })
  hmmRegime!: string;

  @Column({ type: 'float' })
  ogwiInput!: number;

  @Column({ type: 'jsonb', nullable: true })
  indicators!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
