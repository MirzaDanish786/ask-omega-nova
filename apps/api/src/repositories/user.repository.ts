import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { User, type UserRole } from '../entities/index.js';

const USER_SELECT_COLUMNS: (keyof User)[] = [
  'id',
  'email',
  'emailVerified',
  'name',
  'image',
  'role',
  'assignedModules',
  'companyId',
  'monthlySimCount',
  'simRateLimit',
  'onboardingCompleted',
  'accessLevel',
  'apiMode',
  'alertsEnabled',
  'createdAt',
  'updatedAt',
];

export class UserRepository {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      select: USER_SELECT_COLUMNS,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      select: USER_SELECT_COLUMNS,
    });
  }

  async findMany(): Promise<User[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      select: USER_SELECT_COLUMNS,
    });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.repo.update(id, { role });
    return this.findById(id) as Promise<User>;
  }

  async updateModules(id: string, modules: string[]): Promise<User> {
    await this.repo.update(id, { assignedModules: JSON.stringify(modules) });
    return this.findById(id) as Promise<User>;
  }

  async updateProfile(id: string, data: {
    name?: string;
    onboardingCompleted?: boolean;
    accessLevel?: string;
    apiMode?: string;
    alertsEnabled?: boolean;
  }): Promise<User> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<User>;
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
