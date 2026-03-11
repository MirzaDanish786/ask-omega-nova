import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { AuditLog, Simulation, OgwiHistoricalData } from '../../entities/index.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(Simulation)
    private readonly simRepo: Repository<Simulation>,
    @InjectRepository(OgwiHistoricalData)
    private readonly ogwiRepo: Repository<OgwiHistoricalData>,
    private readonly usersService: UsersService,
  ) {}

  async getStats() {
    const [userStats, simCount, ogwiCount] = await Promise.all([
      this.usersService.getStats(),
      this.simRepo.count(),
      this.getOgwiRecentCount(30),
    ]);
    return {
      users: userStats.totalUsers,
      simulations: simCount,
      ogwiUpdates30d: ogwiCount,
    };
  }

  async getAuditLogs() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
      relations: ['user'],
    });
  }

  private async getOgwiRecentCount(days: number): Promise<number> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.ogwiRepo.count({ where: { date: MoreThanOrEqual(since) } });
  }
}
