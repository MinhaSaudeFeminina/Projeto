import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type ReminderType =
  | "exame_preventivo"
  | "mamografia"
  | "vacina_hpv"
  | "consulta"
  | "medicamento"
  | "menstruacao"
  | "autoexame"
  | "campanha";

export type ReminderPriority = "baixa" | "media" | "alta" | "urgente";

export type Reminder = {
  id: number;
  title: string;
  description: string | null;
  type: ReminderType;
  priority: ReminderPriority;
  audience: string;
  periodicity: string;
  start_date: string;
  end_date: string | null;
  short_message: string;
  expanded_message: string;
  is_active: boolean;
};

export type ReminderPayload = {
  title: string;
  description: string | null;
  type: ReminderType;
  priority: ReminderPriority;
  audience: string;
  periodicity: string;
  start_date: string;
  end_date: string | null;
  short_message: string;
  expanded_message: string;
  is_active: boolean;
};

export type ReminderFilters = {
  q?: string;
  type?: ReminderType;
};

function authOptions() {
  return { token: getAdminToken() };
}

export async function listReminders(filters: ReminderFilters = {}): Promise<Reminder[]> {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  const query = params.toString();
  const response = await apiRequest<{ data: Reminder[] }>(
    `/admin/reminders${query ? `?${query}` : ""}`,
    {},
    authOptions(),
  );

  return response.data;
}

export async function createReminder(payload: ReminderPayload): Promise<Reminder> {
  const response = await apiRequest<{ data: Reminder }>("/admin/reminders", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export async function updateReminder(id: number, payload: Partial<ReminderPayload>): Promise<Reminder> {
  const response = await apiRequest<{ data: Reminder }>(`/admin/reminders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, authOptions());

  return response.data;
}

export async function duplicateReminder(id: number): Promise<Reminder> {
  const response = await apiRequest<{ data: Reminder }>(`/admin/reminders/${id}/duplicate`, {
    method: "POST",
  }, authOptions());

  return response.data;
}

export function deleteReminder(id: number): Promise<void> {
  return apiRequest<void>(`/admin/reminders/${id}`, { method: "DELETE" }, authOptions());
}
