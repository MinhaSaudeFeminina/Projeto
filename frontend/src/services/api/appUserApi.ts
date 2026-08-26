import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type ManagedAppUser = {
  id: number;
  name: string;
  email: string;
  age: number | null;
  birth_date: string | null;
  life_stage_id: number | null;
  life_stage: string | null;
  is_active: boolean;
  notifications_active: boolean;
  last_access_at: string | null;
  created_at: string | null;
};

export type AppUserPayload = {
  name: string;
  email: string;
  birth_date: string | null;
  life_stage_id: number | null;
  notifications_active: boolean;
  is_active: boolean;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listAppUsers(): Promise<ManagedAppUser[]> {
  const response = await apiRequest<ManagedAppUser[] | { data: ManagedAppUser[] }>(
    "/admin/app-users",
    {},
    authOptions(),
  );

  return Array.isArray(response) ? response : response.data;
}

export function updateAppUser(id: number, payload: AppUserPayload): Promise<ManagedAppUser> {
  return apiRequest<ManagedAppUser>(`/admin/app-users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());
}
