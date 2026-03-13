import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Simulation, User, KnowledgeBaseArticle } from '../../entities/index.js';
import { SimulationsController } from './simulations.controller.js';
import { SimulationsService } from './simulations.service.js';
import { SimulationProcessor } from './simulation.processor.js';
import { UsersModule } from '../users/users.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { OgwiModule } from '../ogwi/ogwi.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Simulation, User, KnowledgeBaseArticle]),
    BullModule.registerQueue({ name: 'simulations' }),
    UsersModule,
    KnowledgeModule,
    OgwiModule,
  ],
  controllers: [SimulationsController],
  providers: [SimulationsService, SimulationProcessor],
  exports: [SimulationsService],
})
export class SimulationsModule {}
