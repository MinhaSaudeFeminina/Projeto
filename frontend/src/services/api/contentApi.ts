import { apiRequest } from "@/services/api/client";
import {
  isCategoryAvailableOnWeb,
  isLifeStageAvailableOnWeb,
  isTextAvailableOnWeb,
} from "@/services/webContentScope";
import { getAdminToken } from "@/state/adminAuthStore";

export type ContentTaxonomyRecord = {
  id: number;
  key?: string;
  name?: string;
  label?: string;
  slug?: string;
  description?: string | null;
};

export type AdminContent = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: "draft" | "in_review" | "approved" | "published" | "archived";
  category_id: number;
  category: ContentTaxonomyRecord;
  life_stages: ContentTaxonomyRecord[];
  age_ranges: ContentTaxonomyRecord[];
  author?: { id: number; name: string };
  author_id: number;
  submitted_by: number | null;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  published_by: number | null;
  published_at: string | null;
  archived_by: number | null;
  archived_at: string | null;
  updated_at: string;
};

export type ContentPayload = {
  title: string;
  summary: string;
  body: string;
  category_id: number;
  life_stage_ids: number[];
  age_range_ids: number[];
};

type ContentResponse = { data: AdminContent };
type ContentListResponse = { data: AdminContent[] };

export type ContentListFilters = {
  q?: string;
  status?: string;
  categoryId?: number;
  lifeStageId?: number;
  ageRangeId?: number;
  authorId?: number;
};

function authOptions() {
  return { token: getAdminToken() };
}

function isContentAvailableOnWeb(content: AdminContent): boolean {
  return isCategoryAvailableOnWeb(content.category)
    && content.life_stages.every(isLifeStageAvailableOnWeb)
    && isTextAvailableOnWeb(content.title, content.slug, content.summary, content.body);
}

function assertPayloadAvailableOnWeb(input: ContentPayload): void {
  if (!isTextAvailableOnWeb(input.title, input.summary, input.body)) {
    throw new Error("Este tema não está disponível no portal web.");
  }
}

export async function listAdminContents(filters: ContentListFilters = {}): Promise<AdminContent[]> {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId) params.set("category_id", String(filters.categoryId));
  if (filters.lifeStageId) params.set("life_stage_id", String(filters.lifeStageId));
  if (filters.ageRangeId) params.set("age_range_id", String(filters.ageRangeId));
  if (filters.authorId) params.set("author_id", String(filters.authorId));

  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await apiRequest<ContentListResponse>(`/admin/contents${suffix}`, {}, authOptions());

  return response.data.filter(isContentAvailableOnWeb);
}

export async function getAdminContent(id: number): Promise<AdminContent> {
  const response = await apiRequest<ContentResponse>(`/admin/contents/${id}`, {}, authOptions());

  if (!isContentAvailableOnWeb(response.data)) {
    throw new Error("Conteúdo não disponível no portal web.");
  }

  return response.data;
}

export async function createDraftContent(input: ContentPayload): Promise<AdminContent> {
  assertPayloadAvailableOnWeb(input);
  const response = await apiRequest<ContentResponse>("/admin/contents", {
    method: "POST",
    body: JSON.stringify(input),
  }, authOptions());

  if (!isContentAvailableOnWeb(response.data)) {
    throw new Error("Conteúdo não disponível no portal web.");
  }

  return response.data;
}

export async function updateDraftContent(id: number, input: ContentPayload): Promise<AdminContent> {
  assertPayloadAvailableOnWeb(input);
  const response = await apiRequest<ContentResponse>(`/admin/contents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, authOptions());

  if (!isContentAvailableOnWeb(response.data)) {
    throw new Error("Conteúdo não disponível no portal web.");
  }

  return response.data;
}
