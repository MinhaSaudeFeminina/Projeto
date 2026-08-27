import { apiRequest } from "@/services/api/client";
import { isCategoryAvailableOnWeb } from "@/services/webContentScope";
import { getAdminToken } from "@/state/adminAuthStore";

export type ManagedContentCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ContentCategoryPayload = {
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listContentCategories(): Promise<ManagedContentCategory[]> {
  const response = await apiRequest<{ data: ManagedContentCategory[] }>(
    "/admin/categories",
    {},
    authOptions(),
  );

  return response.data.filter(isCategoryAvailableOnWeb);
}

export async function createContentCategory(payload: ContentCategoryPayload): Promise<ManagedContentCategory> {
  if (!isCategoryAvailableOnWeb(payload)) {
    throw new Error("Este tema não está disponível no portal web.");
  }

  const response = await apiRequest<{ data: ManagedContentCategory }>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export async function updateContentCategory(
  id: number,
  payload: ContentCategoryPayload,
): Promise<ManagedContentCategory> {
  if (!isCategoryAvailableOnWeb(payload)) {
    throw new Error("Este tema não está disponível no portal web.");
  }

  const response = await apiRequest<{ data: ManagedContentCategory }>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export function deleteContentCategory(id: number): Promise<void> {
  return apiRequest<void>(`/admin/categories/${id}`, { method: "DELETE" }, authOptions());
}
