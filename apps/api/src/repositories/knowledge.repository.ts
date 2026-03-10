import { prisma } from '../config/database.js';
import type { KnowledgeBaseArticle } from '@prisma/client';

export class KnowledgeRepository {
  async findById(id: string): Promise<KnowledgeBaseArticle | null> {
    return prisma.knowledgeBaseArticle.findUnique({ where: { id } });
  }

  async findByIds(ids: string[]): Promise<KnowledgeBaseArticle[]> {
    return prisma.knowledgeBaseArticle.findMany({ where: { id: { in: ids } } });
  }

  async findAll(): Promise<KnowledgeBaseArticle[]> {
    return prisma.knowledgeBaseArticle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async search(query: string): Promise<KnowledgeBaseArticle[]> {
    const lower = query.toLowerCase();
    return prisma.knowledgeBaseArticle.findMany({
      where: {
        OR: [
          { title: { contains: lower, mode: 'insensitive' } },
          { category: { contains: lower, mode: 'insensitive' } },
          { tags: { hasSome: [lower] } },
          { keywords: { hasSome: [lower] } },
        ],
      },
    });
  }

  async create(data: {
    title: string;
    category: string;
    text: string;
    tags?: string[];
    keywords?: string[];
    accessLevel?: string;
  }): Promise<KnowledgeBaseArticle> {
    return prisma.knowledgeBaseArticle.create({ data });
  }
}
