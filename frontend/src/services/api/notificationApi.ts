import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type AdminNotification = {
  id: number;
  recipient_id: number;
  content_id: number | null;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  read_at: string | null;
  email_sent_at: string | null;
  email_failed_at: string | null;
  created_at: string;
};

export type AdminNotificationResponse = {
  data: AdminNotification[];
  meta: { unread_count: number };
};

function authOptions() {
  return { token: getAdminToken() };
}

export function listAdminNotifications(): Promise<AdminNotificationResponse> {
  return apiRequest<AdminNotificationResponse>("/admin/notifications", {}, authOptions());
}

export function markAdminNotificationRead(notificationId: number): Promise<void> {
  return apiRequest<void>(
    `/admin/notifications/${notificationId}/read`,
    { method: "POST" },
    authOptions(),
  );
}

