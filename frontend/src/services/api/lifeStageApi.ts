import { apiRequest } from "@/services/api/client";
import type { AgeRange } from "@/services/api/taxonomyApi";
import { getAdminToken } from "@/state/adminAuthStore";

/** Só `published` chega ao app; rascunho e arquivada ficam restritas ao painel. */
export type LifeStageTrackStatus = "draft" | "published" | "archived";

export type LifeStageTrackContent = {
  id: number;
  title: string;
  slug: string;
  status: string;
};

export type LifeStageTrack = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  ubs_orientation: string | null;
  warning_signals: string[];
  reminder_suggestions: string[];
  age_range_id: number | null;
  age_range: AgeRange | null;
  status: LifeStageTrackStatus;
  published_at: string | null;
  /** Vem apenas no detalhe da trilha, na ordem escolhida no painel. */
  contents?: LifeStageTrackContent[];
  sort_order: number;
  is_active: boolean;
  contents_count: number;
};

/** A `key` não vai no payload: ela identifica a fase no app e nos conteúdos. */
export type LifeStageTrackPayload = {
  name: string;
  description: string | null;
  ubs_orientation: string | null;
  warning_signals: string[];
  reminder_suggestions: string[];
  age_range_id: number | null;
  is_active: boolean;
};

export type LifeStageTrackCreatePayload = {
  name: string;
  description: string | null;
  age_range_id: number;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listLifeStageTracks(): Promise<LifeStageTrack[]> {
  const response = await apiRequest<{ data: LifeStageTrack[] }>(
    "/admin/life-stages?include_inactive=1",
    {},
    authOptions(),
  );

  return response.data;
}

export async function getLifeStageTrack(id: number): Promise<LifeStageTrack> {
  const response = await apiRequest<{ data: LifeStageTrack }>(
    `/admin/life-stages/${id}`,
    {},
    authOptions(),
  );

  return response.data;
}

export async function createLifeStageTrack(
  payload: LifeStageTrackCreatePayload,
): Promise<LifeStageTrack> {
  const response = await apiRequest<{ data: LifeStageTrack }>("/admin/life-stages", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export async function updateLifeStageTrack(
  id: number,
  payload: Partial<LifeStageTrackPayload>,
): Promise<LifeStageTrack> {
  const response = await apiRequest<{ data: LifeStageTrack }>(`/admin/life-stages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export function deleteLifeStageTrack(id: number): Promise<void> {
  return apiRequest<void>(`/admin/life-stages/${id}`, { method: "DELETE" }, authOptions());
}

/** A ordem do array é a ordem em que a usuária percorre a trilha. */
export async function syncLifeStageTrackContents(
  id: number,
  contentIds: number[],
): Promise<LifeStageTrack> {
  const response = await apiRequest<{ data: LifeStageTrack }>(`/admin/life-stages/${id}/contents`, {
    method: "PUT",
    body: JSON.stringify({ content_ids: contentIds }),
  }, authOptions());

  return response.data;
}

export async function publishLifeStageTrack(id: number): Promise<LifeStageTrack> {
  const response = await apiRequest<{ data: LifeStageTrack }>(`/admin/life-stages/${id}/publish`, {
    method: "POST",
  }, authOptions());

  return response.data;
}

export async function archiveLifeStageTrack(id: number): Promise<LifeStageTrack> {
  const response = await apiRequest<{ data: LifeStageTrack }>(`/admin/life-stages/${id}/archive`, {
    method: "POST",
  }, authOptions());

  return response.data;
}
