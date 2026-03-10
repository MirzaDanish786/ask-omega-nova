import { prisma } from '../config/database.js';
import type { User, UserRole } from '@prisma/client';

// Fields safe to return in API responses (excludes nothing from User table,
// but we exclude the Account table's password hash via select)
const USER_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  name: true,
  image: true,
  role: true,
  assignedModules: true,
  companyId: true,
  monthlySimCount: true,
  simRateLimit: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email }, select: USER_SELECT });
  }

  async findMany(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: USER_SELECT });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    return prisma.user.update({ where: { id }, data: { role }, select: USER_SELECT });
  }

  async updateModules(id: string, modules: string[]): Promise<User> {
    return prisma.user.update({ where: { id }, data: { assignedModules: modules }, select: USER_SELECT });
  }

  async updateProfile(id: string, data: { name?: string }): Promise<User> {
    return prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async incrementSimCount(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { monthlySimCount: { increment: 1 } } });
  }

  async resetAllSimCounts(): Promise<void> {
    await prisma.user.updateMany({ data: { monthlySimCount: 0 } });
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }
}
