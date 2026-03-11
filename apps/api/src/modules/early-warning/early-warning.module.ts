import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarlyWarningData } from '../../entities/index.js';
import { EarlyWarningController } from './early-warning.controller.js';
import { EarlyWarningService } from './early-warning.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([EarlyWarningData])],
  controllers: [EarlyWarningController],
  providers: [EarlyWarningService],
  exports: [EarlyWarningService],
})
export class EarlyWarningModule {}
