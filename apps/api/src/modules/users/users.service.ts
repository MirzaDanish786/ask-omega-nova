import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { User, UserRole, AccountStatus } from '../../entities/index.js';
import { auth } from '../../config/auth.js';
import { EmailService } from '../email/email.service.js';

const USER_SELECT_COLUMNS: (keyof User)[] = [
  'id', 'email', 'emailVerified', 'name', 'image', 'role',
  'assignedModules', 'companyId', 'monthlySimCount', 'simRateLimit',
  'onboardingCompleted', 'accessLevel', 'apiMode', 'alertsEnabled',
  'accountStatus', 'createdAt', 'updatedAt',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id }, select: USER_SELECT_COLUMNS });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email }, select: USER_SELECT_COLUMNS });
  }

  async getAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' }, select: USER_SELECT_COLUMNS });
  }

  async getPending(): Promise<User[]> {
    return this.repo.find({
      where: { accountStatus: AccountStatus.PENDING },
      order: { createdAt: 'DESC' },
      select: USER_SELECT_COLUMNS,
    });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.getById(id);
    await this.repo.update(id, { role });
    return this.getById(id);
  }

  async updateModules(id: string, modules: string[]): Promise<User> {
    await this.getById(id);
    await this.repo.update(id, { assignedModules: JSON.stringify(modules) });
    return this.getById(id);
  }

  async updateProfile(id: string, data: {
    name?: string;
    onboardingCompleted?: boolean;
    accessLevel?: string;
    apiMode?: string;
    alertsEnabled?: boolean;
  }): Promise<User> {
    await this.repo.update(id, data);
    return this.getById(id);
  }

  async getStats(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.repo.count();
    return { totalUsers };
  }

  async incrementSimCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'monthlySimCount', 1);
  }

  async resetAllSimCounts(): Promise<void> {
    await this.repo.update({}, { monthlySimCount: 0 });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const result = await auth.api.signUpEmail({
      body: { email: data.email, password: data.password, name: data.name },
    });

    if (!result?.user) {
      throw new BadRequestException('Failed to create user');
    }

    await this.repo.update(result.user.id, {
      role: data.role || UserRole.VIEWER,
      accountStatus: AccountStatus.APPROVED,
      emailVerified: true,
    });

    return this.getById(result.user.id);
  }

  // ── OTP ──

  async sendOtp(userId: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified) throw new BadRequestException('Email is already verified');

    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.repo.update(userId, { otpCode: code, otpExpiresAt: expiresAt });
    await this.emailService.sendOtp(user.email, code, user.name);
  }

  async verifyOtp(userId: string, code: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified) throw new BadRequestException('Email is already verified');

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }
    if (new Date() > user.otpExpiresAt) {
      await this.repo.update(userId, { otpCode: null, otpExpiresAt: null });
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }
    if (user.otpCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.repo.update(userId, { otpCode: null, otpExpiresAt: null, emailVerified: true });
    return this.getById(userId);
  }

  // ── Approval ──

  async approveUser(id: string): Promise<User> {
    const user = await this.getById(id);
    if (user.accountStatus === AccountStatus.APPROVED) {
      throw new BadRequestException('User is already approved');
    }
    await this.repo.update(id, { accountStatus: AccountStatus.APPROVED });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');
    await this.emailService.sendAccountApproved(user.email, user.name, frontendUrl);
    return this.getById(id);
  }

  async rejectUser(id: string): Promise<User> {
    const user = await this.getById(id);
    if (user.accountStatus === AccountStatus.REJECTED) {
      throw new BadRequestException('User is already rejected');
    }
    await this.repo.update(id, { accountStatus: AccountStatus.REJECTED });
    await this.emailService.sendAccountRejected(user.email, user.name);
    return this.getById(id);
  }
}
