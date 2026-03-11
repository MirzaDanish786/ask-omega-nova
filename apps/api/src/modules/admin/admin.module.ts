import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog, Simulation, OgwiHistoricalData } from '../../entities/index.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Simulation, OgwiHistoricalData]),
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
