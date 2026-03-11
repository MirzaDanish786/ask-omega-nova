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

export enum UserRole {
  ADMIN = 'ADMIN',
  ALL_ACCESS = 'ALL_ACCESS',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING })
  accountStatus!: AccountStatus;

  @Column({ type: 'varchar', nullable: true })
  otpCode!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne('ClientCompany', 'users', { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company!: any;

  @OneToMany('Session', 'user')
  sessions!: any[];

  @OneToMany('Account', 'user')
  accounts!: any[];

  @OneToMany('Simulation', 'user')
  simulations!: any[];

  @OneToMany('Notification', 'user')
  notifications!: any[];

  @OneToMany('AuditLog', 'user')
  auditLogs!: any[];
}
