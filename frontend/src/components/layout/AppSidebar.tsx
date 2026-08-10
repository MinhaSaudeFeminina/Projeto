import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { hasAdminRole } from '@/state/adminAuthStore';
import {
  LayoutDashboard, FileText, FolderOpen, Route, Thermometer,
  Bell, MessageCircleQuestion, Users, Send, Phone,
  BarChart3, UserCog, Settings, ChevronLeft, Heart
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Conteúdos Educativos', icon: FileText, path: '/conteudos' },
  { label: 'Categorias', icon: FolderOpen, path: '/categorias' },
  { label: 'Trilhas por Fase da Vida', icon: Route, path: '/trilhas' },
  { label: 'Sintomas e Queixas', icon: Thermometer, path: '/sintomas' },
  { label: 'Lembretes e Campanhas', icon: Bell, path: '/lembretes' },
  { label: 'Perguntas Anônimas', icon: MessageCircleQuestion, path: '/perguntas' },
  { label: 'Usuárias / Perfis', icon: Users, path: '/usuarias' },
  { label: 'Notificações', icon: Send, path: '/notificacoes' },
  { label: 'Apoio e Contatos', icon: Phone, path: '/apoio' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { label: 'Usuários do Painel', icon: UserCog, path: '/usuarios-painel' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const visibleItems = menuItems.filter((item) => item.path !== '/usuarios-painel' || hasAdminRole('admin'));

  return (
    <aside className={cn(
      "gradient-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-lg text-sidebar-primary-foreground truncate leading-none">Minha Saúde</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60 truncate mt-1">Feminina</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-accent transition-colors"
      >
        <ChevronLeft className={cn("h-3 w-3 text-foreground transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
