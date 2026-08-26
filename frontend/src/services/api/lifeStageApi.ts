import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type LifeStageTrack = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  ubs_orientation: string | null;
  warning_signals: string[];
  reminder_suggestions: string[];
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
  is_active: boolean;
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
