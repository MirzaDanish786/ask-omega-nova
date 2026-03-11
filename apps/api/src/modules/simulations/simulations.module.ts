import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Simulation, User, KnowledgeBaseArticle } from '../../entities/index.js';
import { SimulationsController } from './simulations.controller.js';
import { SimulationsService } from './simulations.service.js';
import { UsersModule } from '../users/users.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { OgwiModule } from '../ogwi/ogwi.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Simulation, User, KnowledgeBaseArticle]),
    UsersModule,
    KnowledgeModule,
    OgwiModule,
  ],
  controllers: [SimulationsController],
  providers: [SimulationsService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
