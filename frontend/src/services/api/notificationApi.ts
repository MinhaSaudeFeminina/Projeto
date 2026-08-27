import { apiRequest } from "@/services/api/client";
import { isTextAvailableOnWeb } from "@/services/webContentScope";
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

export async function listAdminNotifications(): Promise<AdminNotificationResponse> {
  const response = await apiRequest<AdminNotificationResponse>("/admin/notifications", {}, authOptions());
  const data = response.data.filter((notification) =>
    isTextAvailableOnWeb(notification.title, notification.message, notification.action_url),
  );

  return {
    data,
    meta: { unread_count: data.filter((notification) => notification.read_at === null).length },
  };
}

export function markAdminNotificationRead(notificationId: number): Promise<void> {
  return apiRequest<void>(
    `/admin/notifications/${notificationId}/read`,
    { method: "POST" },
    authOptions(),
  );
}

