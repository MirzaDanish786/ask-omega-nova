import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SimulationsService } from './simulations.service.js';

export interface SimulationJobData {
  simId: string;
  query: string;
  userId: string;
  userRole: string;
}

@Processor('simulations')
export class SimulationProcessor extends WorkerHost {
  constructor(private readonly simulationsService: SimulationsService) {
    super();
  }

  async process(job: Job<SimulationJobData>): Promise<void> {
    const { simId, query, userId, userRole } = job.data;
    await this.simulationsService.runSimulation(simId, query, userId, userRole);
  }
}
