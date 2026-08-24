import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type ContentTaxonomyRecord = {
  id: number;
  name?: string;
  label?: string;
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

function authOptions() {
  return { token: getAdminToken() };
}

export async function listAdminContents(filters: { q?: string; status?: string } = {}): Promise<AdminContent[]> {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);

  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await apiRequest<ContentListResponse>(`/admin/contents${suffix}`, {}, authOptions());

  return response.data;
}

export async function getAdminContent(id: number): Promise<AdminContent> {
  const response = await apiRequest<ContentResponse>(`/admin/contents/${id}`, {}, authOptions());

  return response.data;
}

export async function createDraftContent(input: ContentPayload): Promise<AdminContent> {
  const response = await apiRequest<ContentResponse>("/admin/contents", {
    method: "POST",
    body: JSON.stringify(input),
  }, authOptions());

  return response.data;
}

export async function updateDraftContent(id: number, input: ContentPayload): Promise<AdminContent> {
  const response = await apiRequest<ContentResponse>(`/admin/contents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, authOptions());

  return response.data;
}
