import { In, ILike, type Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { KnowledgeBaseArticle } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class KnowledgeRepository {
  private repo: Repository<KnowledgeBaseArticle>;

  constructor() {
    this.repo = AppDataSource.getRepository(KnowledgeBaseArticle);
  }

  async findById(id: string): Promise<KnowledgeBaseArticle | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIds(ids: string[]): Promise<KnowledgeBaseArticle[]> {
    return this.repo.find({ where: { id: In(ids) } });
  }

  async findAll(): Promise<KnowledgeBaseArticle[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async search(query: string): Promise<KnowledgeBaseArticle[]> {
    const lower = query.toLowerCase();

    // Use query builder for array overlap (hasSome equivalent)
    return this.repo
      .createQueryBuilder('article')
      .where('LOWER(article.title) LIKE :q', { q: `%${lower}%` })
      .orWhere('LOWER(article.category) LIKE :q', { q: `%${lower}%` })
      .orWhere('article.tags @> :tag', { tag: [lower] })
      .orWhere('article.keywords @> :tag', { tag: [lower] })
      .getMany();
  }

  async create(data: {
    title: string;
    category: string;
    text: string;
    tags?: string[];
    keywords?: string[];
    accessLevel?: string;
  }): Promise<KnowledgeBaseArticle> {
    const entity = this.repo.create({ id: createId(), ...data });
    return this.repo.save(entity);
  }
}
