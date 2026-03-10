import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { Simulation, type SimulationStatus } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class SimulationRepository {
  private repo: Repository<Simulation>;

  constructor() {
    this.repo = AppDataSource.getRepository(Simulation);
  }

  async findById(id: string): Promise<Simulation | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUserId(userId: string, limit = 50): Promise<Simulation[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async create(data: {
    userId: string;
    query: string;
    status?: SimulationStatus;
    ogwiSnapshot?: number;
  }): Promise<Simulation> {
    const entity = this.repo.create({ id: createId(), ...data });
    return this.repo.save(entity);
  }

  async update(id: string, data: {
    status?: SimulationStatus;
    threadId?: string;
    answer?: string;
    tokensUsed?: number;
    kbArticlesUsed?: string[];
  }): Promise<Simulation> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Simulation>;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async countByUser(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }
}
