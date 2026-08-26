import {
  getContentBySlug,
  listContentCategories,
  listContents,
  type ContentCategory,
  type ContentDetail,
  type ContentFilters,
  type ContentSummary,
} from '../api/contentApi';
import type { ApiResult } from '../api/types';

export type { ContentCategory, ContentDetail, ContentSummary };

export type ContentFilter = {
  categorySlug?: string;
  query?: string;
};

export function getContentCategories(): Promise<ApiResult<ContentCategory[]>> {
  return listContentCategories();
}

export function getContentBySlugOrFail(
  slug: string,
): Promise<ApiResult<ContentDetail>> {
  return getContentBySlug(slug);
}

export function getFilteredContents(
  filter: ContentFilter = {},
): Promise<ApiResult<ContentSummary[]>> {
  // The backend does the searching: it matches against an accent-insensitive
  // column the app has no copy of.
  const filters: ContentFilters = {
    category: filter.categorySlug,
    q: filter.query?.trim() || undefined,
  };

  return listContents(filters);
}
