import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

type ContentImageResponse = { data: { url: string } };

export async function uploadContentImage(contentId: number, image: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("image", image);
  const response = await apiRequest<ContentImageResponse>(`/admin/contents/${contentId}/images`, { method: "POST", body }, { token: getAdminToken() });
  return response.data;
}
