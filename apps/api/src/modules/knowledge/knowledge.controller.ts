import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service.js';
import { RequireModule } from '../../common/decorators/require-module.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('knowledge')
@RequireModule('knowledge-base')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.knowledgeService.search(query || '');
  }

  @Get('articles')
  getAll() {
    return this.knowledgeService.getAll();
  }

  @Post('articles')
  @Roles('ADMIN')
  create(@Body() body: { title: string; category: string; text: string; tags?: string[]; keywords?: string[]; accessLevel?: string }) {
    return this.knowledgeService.create(body);
  }
}
