import {
  getContentArticleById,
  listContentArticles,
  listContentCategories,
} from '../api/contentApi';
import type { ApiResult } from '../api/types';
import type { ContentArticle, ContentCategory } from '../data/mockData';
import { matchesAnyNormalized, normalizeText } from '../utils/text';

export type ContentFilter = {
  categoryId?: string;
  query?: string;
};

export function getContentCategories(): ApiResult<ContentCategory[]> {
  return listContentCategories();
}

export function getContentById(id: string): ApiResult<ContentArticle> {
  return getContentArticleById(id);
}

export function getFilteredContents(
  filter: ContentFilter = {},
): ApiResult<ContentArticle[]> {
  const result = listContentArticles();

  if (!result.ok) {
    return result;
  }

  const categoryId = filter.categoryId;
  const query = filter.query ? normalizeText(filter.query) : '';

  const filteredContents = result.data.filter((content) => {
    const matchesCategory = !categoryId || content.categoryId === categoryId;
    const matchesQuery =
      !query ||
      matchesAnyNormalized([content.title, content.summary], query);

    return matchesCategory && matchesQuery;
  });

  return {
    ok: true,
    data: filteredContents,
  };
}
