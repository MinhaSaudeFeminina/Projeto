import { Link } from "react-router-dom";
import { Bell, FileCheck2, FilePenLine, History, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "@/state/adminAuthStore";

const metrics = [
  {
    title: "Rascunhos",
    value: "0",
    description: "Conteúdos em preparação",
    icon: FilePenLine,
  },
  {
    title: "Em revisão",
    value: "0",
    description: "Materiais aguardando análise",
    icon: FileCheck2,
  },
  {
    title: "Notificações",
    value: "0",
    description: "Pendências administrativas",
    icon: Bell,
  },
  {
    title: "Auditoria",
    value: "Ativa",
    description: "Eventos editoriais rastreáveis",
    icon: History,
  },
];

const actions = [
  { label: "Novo conteúdo", to: "/conteudos", icon: FilePenLine },
  { label: "Fila de revisão", to: "/conteudos", icon: FileCheck2 },
  { label: "Usuárias administrativas", to: "/usuarios-painel", icon: Users },
  { label: "Notificações", to: "/notificacoes", icon: Bell },
];

export default function DashboardPage() {
  const adminUser = getAdminUser();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" />
          Portal administrativo
        </div>
        <h1 className="text-2xl font-bold">Painel Minha Saúde Feminina</h1>
        <p className="max-w-3xl text-muted-foreground">
          Acompanhe autenticação, fluxo editorial, revisão, publicação e auditoria de conteúdos educativos.
        </p>
        {adminUser ? (
          <p className="text-sm text-muted-foreground">
            Sessão ativa para {adminUser.name} ({adminUser.email}).
          </p>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.title} className="rounded border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{metric.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Próximas ações editoriais</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.label} to={action.to}>
                  <Button variant="outline" className="h-12 w-full justify-start gap-2">
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Limites do MVP</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Este painel cobre somente administração web, autenticação administrativa e fluxo editorial.
            Funcionalidades mobile e dados de usuárias finais permanecem fora deste incremento.
          </p>
        </div>
      </section>
    </div>
  );
}
