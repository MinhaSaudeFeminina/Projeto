import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { listAdminNotifications } from '@/services/api/notificationApi';

export function AdminLayout() {
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let active = true;

    listAdminNotifications()
      .then((response) => {
        if (active) setUnreadNotifications(response.meta.unread_count);
      })
      .catch(() => undefined);

    const handleRead = () => setUnreadNotifications((count) => Math.max(0, count - 1));
    window.addEventListener('admin-notification-read', handleRead);

    return () => {
      active = false;
      window.removeEventListener('admin-notification-read', handleRead);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader unreadNotifications={unreadNotifications} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
