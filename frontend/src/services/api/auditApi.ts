import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type EditorialAuditEvent = {
  id: number;
  actor_id: number | null;
  actor: { id: number; name: string } | null;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  comment: string | null;
  occurred_at: string;
};

export type ContentRevision = {
  id: number;
  content_id: number;
  changed_by: number;
  changed_by_user: { id: number; name: string } | null;
  version: number;
  title_snapshot: string;
  summary_snapshot: string | null;
  body_snapshot: string;
  status_snapshot: string;
  change_summary: string | null;
  created_at: string;
};

type AuditResponse = { data: EditorialAuditEvent[] };
type RevisionResponse = { data: ContentRevision[] };

function authOptions() {
  return { token: getAdminToken() };
}

export async function getContentAudit(contentId: number): Promise<EditorialAuditEvent[]> {
  const response = await apiRequest<AuditResponse>(`/admin/contents/${contentId}/audit`, {}, authOptions());
  return response.data;
}

export async function getContentRevisions(contentId: number): Promise<ContentRevision[]> {
  const response = await apiRequest<RevisionResponse>(`/admin/contents/${contentId}/revisions`, {}, authOptions());
  return response.data;
}
