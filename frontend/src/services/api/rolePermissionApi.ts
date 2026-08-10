import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type AdminRoleRecord = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
};

export type PermissionRecord = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listRoles(): Promise<AdminRoleRecord[]> {
  const response = await apiRequest<AdminRoleRecord[] | { data: AdminRoleRecord[] }>("/admin/roles", {}, authOptions());

  return Array.isArray(response) ? response : response.data;
}

export async function listPermissions(): Promise<PermissionRecord[]> {
  const response = await apiRequest<PermissionRecord[] | { data: PermissionRecord[] }>(
    "/admin/permissions",
    {},
    authOptions(),
  );

  return Array.isArray(response) ? response : response.data;
}
