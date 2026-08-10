import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export function runEditorialAction(contentId: number, action: string, comment?: string) {
  return apiRequest(
    `/admin/contents/${contentId}/actions`,
    { method: "POST", body: JSON.stringify({ action, comment }) },
    { token: getAdminToken() },
  );
}
