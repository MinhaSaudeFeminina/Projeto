import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type ManagedAdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
};

export type AdminUserPayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
  is_active: boolean;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listAdminUsers(): Promise<ManagedAdminUser[]> {
  const response = await apiRequest<ManagedAdminUser[] | { data: ManagedAdminUser[] }>(
    "/admin/admin-users",
    {},
    authOptions(),
  );

  return Array.isArray(response) ? response : response.data;
}

export function createAdminUser(payload: AdminUserPayload): Promise<ManagedAdminUser> {
  return apiRequest<ManagedAdminUser>("/admin/admin-users", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authOptions());
}

export function updateAdminUser(id: number, payload: AdminUserPayload): Promise<ManagedAdminUser> {
  return apiRequest<ManagedAdminUser>(`/admin/admin-users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());
}
