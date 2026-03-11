import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/index.js';

const USER_SELECT_COLUMNS: (keyof User)[] = [
  'id', 'email', 'emailVerified', 'name', 'image', 'role',
  'assignedModules', 'companyId', 'monthlySimCount', 'simRateLimit',
  'onboardingCompleted', 'accessLevel', 'apiMode', 'alertsEnabled',
  'createdAt', 'updatedAt',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
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
}
