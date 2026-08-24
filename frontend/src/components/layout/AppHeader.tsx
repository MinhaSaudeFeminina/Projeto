import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { logoutAdmin } from "@/services/api/adminAuthApi";
import { clearAdminSession, getAdminToken, getAdminUser } from "@/state/adminAuthStore";

interface AppHeaderProps {
  title?: string;
  unreadNotifications?: number;
}

function notificationLabel(count: number): string {
  if (count === 0) return "Notificações: nenhuma não lida";
  return `Notificações: ${count} ${count === 1 ? "não lida" : "não lidas"}`;
}

function initials(name: string | undefined): string {
  if (!name) {
    return "AD";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppHeader({ title, unreadNotifications = 0 }: AppHeaderProps) {
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    const token = getAdminToken();
    setLoggingOut(true);

    try {
      if (token) {
        await logoutAdmin(token);
      }
    } finally {
      clearAdminSession();
      setLoggingOut(false);
      toast({ title: "Sessão encerrada", description: "Você saiu do painel administrativo." });
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar conteúdos..." className="w-64 border-0 bg-muted/50 pl-9" />
        </div>

        <Button asChild variant="ghost" size="icon" className="relative">
          <Link to="/notificacoes" aria-label={notificationLabel(unreadNotifications)}>
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-xs text-primary-foreground">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            ) : null}
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials(adminUser?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{adminUser?.name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground">{adminUser?.email ?? "Sessão administrativa"}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
