import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export function listAdminContents() {
  return apiRequest("/admin/contents", {}, { token: getAdminToken() });
}

export function createDraftContent(input: { title: string; summary: string; body: string; category_id: number }) {
  return apiRequest("/admin/contents", { method: "POST", body: JSON.stringify(input) }, { token: getAdminToken() });
}
