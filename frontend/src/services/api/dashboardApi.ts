import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export function fetchDashboardSummary() {
  return apiRequest("/admin/dashboard", {}, { token: getAdminToken() });
}
