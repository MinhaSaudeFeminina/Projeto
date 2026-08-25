import {
  contentCategories,
  mockContents,
  type ContentArticle,
  type ContentCategory,
} from '../data/mockData';

import { fail, ok, type ApiResult } from './types';

export function listContentCategories(): ApiResult<ContentCategory[]> {
  return ok(contentCategories as ContentCategory[]);
}

export function listContentArticles(): ApiResult<ContentArticle[]> {
  return ok(mockContents);
}

export function getContentArticleById(id: string): ApiResult<ContentArticle> {
  const article = mockContents.find((content) => content.id === id);

  if (!article) {
    return fail(
      'CONTENT_NOT_FOUND',
      'Conteudo nao encontrado.',
      false,
    );
  }

  return ok(article);
}
