import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type AdminSymptom = {
  id: number;
  name: string;
  type: string;
  short_description: string | null;
  full_description: string | null;
  icon: string | null;
  category: string;
  show_in_app: boolean;
  ask_intensity: boolean;
  ask_notes: boolean;
  generate_ubs_alert: boolean;
  orientation_text: string | null;
  severity_alert_text: string | null;
  sort_order: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminSymptomPayload = {
  name: string;
  type: string;
  short_description: string;
  full_description: string | null;
  icon: string | null;
  category: string;
  show_in_app: boolean;
  ask_intensity: boolean;
  ask_notes: boolean;
  generate_ubs_alert: boolean;
  orientation_text: string | null;
  severity_alert_text: string | null;
  sort_order: number;
};

export type AdminSymptomFilters = {
  q?: string;
  type?: string;
  category?: string;
  showInApp?: boolean;
  generateUbsAlert?: boolean;
};

type SymptomResponse = { data: AdminSymptom };
type SymptomListResponse = { data: AdminSymptom[] };

function authOptions() {
  return { token: getAdminToken() };
}

export async function listAdminSymptoms(filters: AdminSymptomFilters = {}): Promise<AdminSymptom[]> {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.showInApp !== undefined) params.set("show_in_app", String(Number(filters.showInApp)));
  if (filters.generateUbsAlert !== undefined) params.set("generate_ubs_alert", String(Number(filters.generateUbsAlert)));

  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await apiRequest<SymptomListResponse>(`/admin/symptoms${suffix}`, {}, authOptions());

  return response.data;
}

export async function createAdminSymptom(payload: AdminSymptomPayload): Promise<AdminSymptom> {
  const response = await apiRequest<SymptomResponse>("/admin/symptoms", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export async function updateAdminSymptom(
  id: number,
  payload: Partial<AdminSymptomPayload>,
): Promise<AdminSymptom> {
  const response = await apiRequest<SymptomResponse>(`/admin/symptoms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export function deleteAdminSymptom(id: number): Promise<void> {
  return apiRequest<void>(`/admin/symptoms/${id}`, { method: "DELETE" }, authOptions());
}
