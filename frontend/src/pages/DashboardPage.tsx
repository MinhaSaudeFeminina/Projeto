import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { contents, anonymousQuestions, categories, appUsers, reminders } from '@/data/mockData';
import {
  FileText, FilePen, MessageCircleQuestion, Bell, Users, FolderOpen,
  Plus, Megaphone, Clock, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const chartData = [
  { month: 'Out', acessos: 1200 },
  { month: 'Nov', acessos: 1800 },
  { month: 'Dez', acessos: 2400 },
  { month: 'Jan', acessos: 3100 },
  { month: 'Fev', acessos: 3800 },
  { month: 'Mar', acessos: 4200 },
];

export default function DashboardPage() {
  const published = contents.filter(c => c.status === 'publicado');
  const drafts = contents.filter(c => c.status === 'rascunho');
  const pendingReview = contents.filter(c => c.status === 'em_revisao');
  const newQuestions = anonymousQuestions.filter(q => q.status === 'nova' || q.status === 'em_analise');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do Painel Minha Saúde Feminina</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Publicados" value={published.length} icon={FileText} trend={{ value: '+3 este mês', positive: true }} />
        <MetricCard title="Rascunhos" value={drafts.length} icon={FilePen} />
        <MetricCard title="Perguntas novas" value={newQuestions.length} icon={MessageCircleQuestion} trend={{ value: '+2 hoje', positive: true }} />
        <MetricCard title="Lembretes ativos" value={reminders.filter(r => r.isActive).length} icon={Bell} />
        <MetricCard title="Usuárias" value={appUsers.length} icon={Users} trend={{ value: '+12%', positive: true }} />
        <MetricCard title="Categorias" value={categories.length} icon={FolderOpen} />
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Crescimento de acessos</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="acessos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h3 className="font-semibold">Atalhos rápidos</h3>
          <div className="space-y-2">
            <Link to="/conteudos/novo"><Button variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4" /> Novo conteúdo</Button></Link>
            <Link to="/lembretes"><Button variant="outline" className="w-full justify-start gap-2"><Megaphone className="h-4 w-4" /> Nova campanha</Button></Link>
            <Link to="/lembretes"><Button variant="outline" className="w-full justify-start gap-2"><Bell className="h-4 w-4" /> Novo lembrete</Button></Link>
            <Link to="/categorias"><Button variant="outline" className="w-full justify-start gap-2"><FolderOpen className="h-4 w-4" /> Nova categoria</Button></Link>
            <Link to="/perguntas"><Button variant="outline" className="w-full justify-start gap-2"><MessageCircleQuestion className="h-4 w-4" /> Responder pergunta</Button></Link>
          </div>
        </div>
      </div>

      {/* Recent content + Pending + Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Últimos publicados</h3>
          <div className="space-y-3">
            {published.slice(0, 5).map(c => (
              <Link key={c.id} to={`/conteudos`} className="block rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.publishedAt}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> Pendentes de revisão</h3>
          <div className="space-y-3">
            {pendingReview.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum conteúdo pendente 🎉</p>
            ) : pendingReview.map(c => (
              <Link key={c.id} to={`/conteudos`} className="block rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><MessageCircleQuestion className="h-4 w-4 text-info" /> Perguntas recentes</h3>
          <div className="space-y-3">
            {anonymousQuestions.slice(0, 5).map(q => (
              <Link key={q.id} to="/perguntas" className="block rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium truncate">{q.question}</p>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={q.status} />
                  <StatusBadge status={q.priority} type="priority" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
