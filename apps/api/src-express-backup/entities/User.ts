import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from './Session.js';
import { Account } from './Account.js';
import { Simulation } from './Simulation.js';
import { Notification } from './Notification.js';
import { AuditLog } from './AuditLog.js';
import { ClientCompany } from './ClientCompany.js';

export enum UserRole {
  ADMIN = 'ADMIN',
  ALL_ACCESS = 'ALL_ACCESS',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  image!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role!: UserRole;

  @Column({ type: 'text', default: '[]' })
  assignedModules!: string;

  @Column({ type: 'varchar', nullable: true })
  companyId!: string | null;

  @Column({ type: 'int', default: 0 })
  monthlySimCount!: number;

  @Column({ type: 'int', default: 50 })
  simRateLimit!: number;

  @Column({ type: 'boolean', default: false })
  onboardingCompleted!: boolean;

  @Column({ type: 'varchar', nullable: true })
  accessLevel!: string | null;

  @Column({ type: 'varchar', nullable: true })
  apiMode!: string | null;

  @Column({ type: 'boolean', default: true })
  alertsEnabled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => ClientCompany, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company!: ClientCompany | null;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Simulation, (simulation) => simulation.user)
  simulations!: Simulation[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs!: AuditLog[];
}
