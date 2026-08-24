import { apiRequest } from "@/services/api/client";
import type { AdminContent } from "@/services/api/contentApi";
import { getAdminToken } from "@/state/adminAuthStore";

type EditorialResponse = { data: AdminContent };

function postEditorialAction(path: string, body?: Record<string, string>): Promise<EditorialResponse> {
  return apiRequest<EditorialResponse>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  }, { token: getAdminToken() });
}

export async function submitContentForReview(contentId: number): Promise<AdminContent> {
  const response = await postEditorialAction(`/admin/contents/${contentId}/submit-review`);
  return response.data;
}

export async function requestContentAdjustments(contentId: number, comment: string): Promise<AdminContent> {
  const response = await postEditorialAction(
    `/admin/contents/${contentId}/request-adjustments`,
    { comment },
  );
  return response.data;
}

export async function approveContent(contentId: number, comment?: string): Promise<AdminContent> {
  const response = await postEditorialAction(
    `/admin/contents/${contentId}/approve`,
    comment ? { comment } : undefined,
  );
  return response.data;
}
