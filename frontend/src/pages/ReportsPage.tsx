import { useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Users, MessageCircleQuestion, Thermometer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const topContents = [
  { name: 'Corrimento vaginal', views: 1240 },
  { name: 'Cólica menstrual', views: 1100 },
  { name: 'Conheça seu ciclo', views: 980 },
  { name: 'Prevenção câncer de mama', views: 870 },
  { name: 'Violência contra a mulher', views: 650 },
];

const categoryViews = [
  { name: 'Menstruação', value: 3200 },
  { name: 'Saúde íntima', value: 2100 },
  { name: 'Câncer', value: 1500 },
  { name: 'TPM', value: 1200 },
  { name: 'Autocuidado', value: 800 },
];

const symptomsData = [
  { name: 'Cólica', registros: 450 },
  { name: 'Alteração humor', registros: 380 },
  { name: 'Corrimento', registros: 320 },
  { name: 'Dor de cabeça', registros: 290 },
  { name: 'Ansiedade', registros: 260 },
];

const userGrowth = [
  { month: 'Out', users: 120 },
  { month: 'Nov', users: 180 },
  { month: 'Dez', users: 250 },
  { month: 'Jan', users: 340 },
  { month: 'Fev', users: 480 },
  { month: 'Mar', users: 620 },
];

const lifeStageDistribution = [
  { name: 'Adolescência', value: 15 },
  { name: 'Fase adulta', value: 45 },
  { name: 'Gestação', value: 12 },
  { name: 'Climatério', value: 18 },
  { name: 'Outras', value: 10 },
];

const COLORS = ['hsl(330, 65%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(210, 80%, 55%)', 'hsl(40, 90%, 55%)', 'hsl(155, 60%, 45%)'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('30d');
  const { toast } = useToast();

  const handleExport = (type: string) => {
    toast({ title: `Exportação ${type} iniciada!`, description: 'O download será gerado em instantes.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Indicadores e métricas do sistema</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="365d">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('CSV')} className="gap-1"><Download className="h-4 w-4" /> CSV</Button>
          <Button variant="outline" onClick={() => handleExport('PDF')} className="gap-1"><Download className="h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total conteúdos" value={12} icon={FileText} trend={{ value: '+3', positive: true }} />
        <MetricCard title="Total usuárias" value={620} icon={Users} trend={{ value: '+29%', positive: true }} />
        <MetricCard title="Perguntas (mês)" value={18} icon={MessageCircleQuestion} />
        <MetricCard title="Sintomas registrados" value={1480} icon={Thermometer} trend={{ value: '+15%', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Conteúdos mais acessados</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topContents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Distribuição por fase da vida</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={lifeStageDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                  {lifeStageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Crescimento de usuárias</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Sintomas mais registrados</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={symptomsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="registros" fill="hsl(280, 60%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
