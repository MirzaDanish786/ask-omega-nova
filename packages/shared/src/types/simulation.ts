export enum SimulationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ISimulation {
  id: string;
  userId: string;
  query: string;
  status: SimulationStatus;
  threadId: string | null;
  answer: string | null;
  tokensUsed: number;
  ogwiSnapshot: number | null;
  kbArticlesUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IKnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  text: string;
  tags: string[];
  keywords: string[];
  accessLevel: string;
  createdAt: Date;
  updatedAt: Date;
}
