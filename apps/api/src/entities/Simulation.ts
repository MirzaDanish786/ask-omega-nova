import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.js';

export enum SimulationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('simulation')
export class Simulation {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  userId!: string;

  @Column({ type: 'text' })
  query!: string;

  @Column({ type: 'enum', enum: SimulationStatus, default: SimulationStatus.PENDING })
  status!: SimulationStatus;

  @Column({ type: 'varchar', nullable: true })
  threadId!: string | null;

  @Column({ type: 'text', nullable: true })
  answer!: string | null;

  @Column({ type: 'int', default: 0 })
  tokensUsed!: number;

  @Column({ type: 'float', nullable: true })
  ogwiSnapshot!: number | null;

  @Column({ type: 'text', array: true, default: '{}' })
  kbArticlesUsed!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.simulations)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
