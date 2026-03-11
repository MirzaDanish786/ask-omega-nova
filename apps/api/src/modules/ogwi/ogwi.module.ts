import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OgwiHistoricalData, EarlyWarningData } from '../../entities/index.js';
import { OgwiController } from './ogwi.controller.js';
import { OgwiService } from './ogwi.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OgwiHistoricalData, EarlyWarningData])],
  controllers: [OgwiController],
  providers: [OgwiService],
  exports: [OgwiService],
})
export class OgwiModule {}
