import { requestJson } from './client';
import type { ApiResult } from './types';

export type ContentCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export type ContentSummary = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  category: {
    name: string | null;
    slug: string | null;
  };
  published_at: string | null;
};

/** The list endpoint omits `body`; only the detail endpoint returns it. */
export type ContentDetail = ContentSummary & {
  body: string;
};

export type ContentFilters = {
  q?: string;
  category?: string;
};

export async function listContentCategories(): Promise<
  ApiResult<ContentCategory[]>
> {
  const result = await requestJson<{ data: ContentCategory[] }>('/categories', {
    token: null,
  });

  return result.ok ? { ok: true, data: result.data.data } : result;
}

export async function listContents(
  filters: ContentFilters = {},
): Promise<ApiResult<ContentSummary[]>> {
  const result = await requestJson<{ data: ContentSummary[] }>('/contents', {
    query: filters,
    token: null,
  });

  return result.ok ? { ok: true, data: result.data.data } : result;
}

export async function getContentBySlug(
  slug: string,
): Promise<ApiResult<ContentDetail>> {
  const result = await requestJson<{ data: ContentDetail }>(
    `/contents/${encodeURIComponent(slug)}`,
    { token: null },
  );

  return result.ok ? { ok: true, data: result.data.data } : result;
}
