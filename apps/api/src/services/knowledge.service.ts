import { KnowledgeRepository } from '../repositories/knowledge.repository.js';
import type { KnowledgeBaseArticle } from '@prisma/client';

// Keyword-to-article ID mapping (ported from old project's askOmega.ts)
const KB_KEYWORD_MAP: Record<string, string[]> = {
  'security manager': ['field-security-handbook-001', 'srm-intro-001'],
  'field security': ['field-security-handbook-001'],
  'guard': ['field-security-handbook-001'],
  'evacuation': ['field-security-handbook-001'],
  'access control': ['field-security-handbook-001'],
  'perimeter': ['field-security-handbook-001'],
  'threat assessment': ['field-security-handbook-001', 'srm-intro-001', 'jihadist-profiles-001'],
  'security risk': ['srm-intro-001', 'field-security-handbook-001'],
  'srm': ['srm-intro-001'],
  'maturity model': ['srm-intro-001'],
  'vulnerability': ['srm-intro-001', 'infosec-intro-001'],
  'risk equation': ['srm-intro-001'],
  'defence in depth': ['field-security-handbook-001', 'srm-intro-001'],
  'information security': ['infosec-intro-001'],
  'infosec': ['infosec-intro-001'],
  'cybersecurity': ['infosec-intro-001'],
  'cyber': ['infosec-intro-001'],
  'confidentiality': ['infosec-intro-001'],
  'encryption': ['infosec-intro-001'],
  'data breach': ['infosec-intro-001'],
  'cia triad': ['infosec-intro-001'],
  'integrity': ['infosec-intro-001'],
  'availability': ['infosec-intro-001'],
  'terrorism': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'terrorist': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'clandestine': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'cell structure': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'insurgent': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'extremist': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'radicalization': ['clandestine-terror-org-001', 'jihadist-profiles-001'],
  'jihadist': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'jihad': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'al shabaab': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'al-shabaab': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'al qaeda': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'al-qaeda': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'isis': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'isil': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'islamic state': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'daesh': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'boko haram': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'aqap': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'aqim': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'jnim': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'ttp': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'lashkar': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'taliban': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'safe house': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'training camp': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'doctrine': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'opsec': ['jihadist-profiles-001', 'clandestine-terror-org-001', 'infosec-intro-001'],
  'operational security': ['jihadist-profiles-001', 'clandestine-terror-org-001', 'infosec-intro-001'],
  'compartmentalization': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'ied': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'improvised explosive': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'kidnapping': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'hostage': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'guerrilla': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'asymmetric': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'propaganda': ['jihadist-profiles-001'],
  'recruitment': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
  'surveillance': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'counter-surveillance': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'reconnaissance': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'soft power': ['soft-power-diplomacy-001', 'ir-primer-001'],
  'diplomacy': ['soft-power-diplomacy-001', 'ir-primer-001'],
  'realism': ['ir-primer-001'],
  'liberalism': ['ir-primer-001'],
  'constructivism': ['ir-primer-001'],
  'international relations': ['ir-primer-001'],
  'geopolitics': ['ir-primer-001', 'soft-power-diplomacy-001'],
  'balance of power': ['ir-primer-001'],
  'foreign policy': ['ir-primer-001'],
  'methodology': ['reflexive-methodology-001'],
  'reflexivity': ['reflexive-methodology-001'],
  'bias': ['reflexive-methodology-001'],
  'epistemology': ['reflexive-methodology-001'],
  'syria': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'somalia': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'afghanistan': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'iraq': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'yemen': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'libya': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'sahel': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'mali': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'niger': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'nigeria': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'sudan': ['clandestine-terror-org-001', 'field-security-handbook-001', 'jihadist-profiles-001'],
  'kenya': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'mozambique': ['jihadist-profiles-001', 'field-security-handbook-001'],
  'pakistan': ['jihadist-profiles-001', 'clandestine-terror-org-001'],
};

export class KnowledgeService {
  private repo = new KnowledgeRepository();

  findRelevantArticleIds(query: string): string[] {
    const lower = query.toLowerCase();
    const matched = new Set<string>();
    for (const [keyword, ids] of Object.entries(KB_KEYWORD_MAP)) {
      if (lower.includes(keyword)) {
        ids.forEach(id => matched.add(id));
      }
    }
    return Array.from(matched);
  }

  async getArticlesByIds(ids: string[]): Promise<KnowledgeBaseArticle[]> {
    return this.repo.findByIds(ids);
  }

  buildKBContext(articles: KnowledgeBaseArticle[], userLevel: string): string {
    if (articles.length === 0) return '';

    let context = '\n\n---\nKNOWLEDGE BASE CONTEXT:\n';
    context += `[User Level: ${userLevel}]\n\n`;

    for (const article of articles) {
      const truncated = article.text.length > 4000
        ? article.text.slice(0, 4000) + '\n\n[...truncated]'
        : article.text;
      context += `### ${article.title} (${article.category})\n`;
      context += `Tags: ${article.tags.join(', ')}\n\n`;
      context += truncated;
      context += '\n\n---\n';
    }

    context += '\nUse the above knowledge base content to inform your response. ';
    context += 'Cite specific concepts when relevant.\n';
    return context;
  }

  async search(query: string): Promise<KnowledgeBaseArticle[]> {
    return this.repo.search(query);
  }

  async getAll(): Promise<KnowledgeBaseArticle[]> {
    return this.repo.findAll();
  }

  async create(data: {
    title: string;
    category: string;
    text: string;
    tags?: string[];
    keywords?: string[];
    accessLevel?: string;
  }): Promise<KnowledgeBaseArticle> {
    return this.repo.create(data);
  }
}
