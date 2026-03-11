import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../interfaces/base.js';
import { type User, type UserRole } from '../entities/index.js';

export class UserService {
  private repo = new UserRepository();

  async getById(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async getAll(): Promise<User[]> {
    return this.repo.findMany();
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.getById(id); // ensure exists
    return this.repo.updateRole(id, role);
  }

  async updateModules(id: string, modules: string[]): Promise<User> {
    await this.getById(id);
    return this.repo.updateModules(id, modules);
  }

  async updateProfile(id: string, data: {
    name?: string;
    onboardingCompleted?: boolean;
    accessLevel?: string;
    apiMode?: string;
    alertsEnabled?: boolean;
  }): Promise<User> {
    return this.repo.updateProfile(id, data);
  }

  async getStats(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.repo.count();
    return { totalUsers };
  }
}
