import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listAdminNotifications,
  markAdminNotificationRead,
  type AdminNotification,
} from "@/services/api/notificationApi";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    listAdminNotifications()
      .then((response) => setNotifications(response.data))
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function markRead(notification: AdminNotification) {
    if (notification.read_at !== null) return;

    setPendingId(notification.id);
    setError(null);

    try {
      await markAdminNotificationRead(notification.id);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, read_at: readAt } : item
      )));
      window.dispatchEvent(new CustomEvent("admin-notification-read", { detail: notification.id }));
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Notificações administrativas</h1>
        <p className="text-muted-foreground">Acompanhe eventos editoriais que precisam da sua atenção.</p>
      </header>

      {error ? <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando notificações...</p> : null}
      {!isLoading && notifications.length === 0 ? (
        <div className="rounded border bg-card p-6 text-center">
          <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p>Nenhuma notificação administrativa.</p>
        </div>
      ) : null}

      <ul className="space-y-3" aria-label="Notificações administrativas">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`rounded border p-4 ${notification.read_at === null ? "border-primary/40 bg-primary/5" : "bg-card"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-semibold">{notification.title}</h2>
                <p className="text-sm">{notification.message}</p>
                <time className="block text-xs text-muted-foreground" dateTime={notification.created_at}>
                  {formatDate(notification.created_at)}
                </time>
              </div>
              <div className="flex flex-wrap gap-2">
                {notification.action_url ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to={notification.action_url}>Ver no portal</Link>
                  </Button>
                ) : null}
                {notification.read_at === null ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pendingId === notification.id}
                    onClick={() => markRead(notification)}
                  >
                    <Check className="mr-1 h-4 w-4" aria-hidden="true" />
                    Marcar como lida
                  </Button>
                ) : <span className="self-center text-xs text-muted-foreground">Lida</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

