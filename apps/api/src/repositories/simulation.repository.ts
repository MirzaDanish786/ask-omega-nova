import { prisma } from '../config/database.js';
import type { Simulation, SimulationStatus } from '@prisma/client';

export class SimulationRepository {
  async findById(id: string): Promise<Simulation | null> {
    return prisma.simulation.findUnique({ where: { id } });
  }

  async findByUserId(userId: string, limit = 50): Promise<Simulation[]> {
    return prisma.simulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(data: {
    userId: string;
    query: string;
    status?: SimulationStatus;
    ogwiSnapshot?: number;
  }): Promise<Simulation> {
    return prisma.simulation.create({ data });
  }

  async update(id: string, data: {
    status?: SimulationStatus;
    threadId?: string;
    answer?: string;
    tokensUsed?: number;
    kbArticlesUsed?: string[];
  }): Promise<Simulation> {
    return prisma.simulation.update({ where: { id }, data });
  }

  async count(): Promise<number> {
    return prisma.simulation.count();
  }

  async countByUser(userId: string): Promise<number> {
    return prisma.simulation.count({ where: { userId } });
  }
}
