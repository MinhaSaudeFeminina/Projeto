import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type SupportContact = {
  id: number;
  name: string;
  description: string;
  type: string;
  phone: string | null;
  link: string | null;
  cta_label: string;
  sort_order: number;
  is_highlighted: boolean;
  is_active: boolean;
};

export type SupportContactPayload = {
  name: string;
  description: string;
  type: string;
  phone: string | null;
  link: string | null;
  cta_label: string;
  sort_order: number;
  is_highlighted: boolean;
  is_active: boolean;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listSupportContacts(): Promise<SupportContact[]> {
  const response = await apiRequest<{ data: SupportContact[] }>(
    "/admin/support-contacts",
    {},
    authOptions(),
  );

  return response.data;
}

export async function createSupportContact(payload: SupportContactPayload): Promise<SupportContact> {
  const response = await apiRequest<{ data: SupportContact }>("/admin/support-contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export async function updateSupportContact(
  id: number,
  payload: SupportContactPayload,
): Promise<SupportContact> {
  const response = await apiRequest<{ data: SupportContact }>(`/admin/support-contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export function deleteSupportContact(id: number): Promise<void> {
  return apiRequest<void>(`/admin/support-contacts/${id}`, { method: "DELETE" }, authOptions());
}
