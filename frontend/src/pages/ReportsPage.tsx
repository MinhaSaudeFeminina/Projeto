import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, FileText, Loader2, MessageCircleQuestion, Thermometer } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAdminReport, type AdminReport, type ReportDataPoint, type ReportPeriod } from "@/services/api/reportApi";
import { reportToCsv } from "@/services/reports/reportCsv";

const COLORS = [
  "hsl(330, 65%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(210, 80%, 55%)",
  "hsl(40, 90%, 55%)",
  "hsl(155, 60%, 45%)",
];

const COPY = {
  title: "Relat\u00f3rios",
  subtitle: "Indicadores administrativos do per\u00edodo selecionado",
  periodLabel: "Per\u00edodo do relat\u00f3rio",
  last7Days: "\u00daltimos 7 dias",
  last30Days: "\u00daltimos 30 dias",
  last90Days: "\u00daltimos 90 dias",
  lastYear: "\u00daltimo ano",
  loading: "Carregando relat\u00f3rio...",
  loadError: "N\u00e3o foi poss\u00edvel carregar o relat\u00f3rio.",
  empty: "Sem dados no per\u00edodo selecionado.",
  exportSuccess: "Relat\u00f3rio CSV gerado com sucesso!",
  contentsCreated: "Conte\u00fados criados no per\u00edodo",
  contentsPublished: "Conte\u00fados publicados no per\u00edodo",
  questionsReceived: "Perguntas recebidas no per\u00edodo",
  symptomsCreated: "Sintomas cadastrados no per\u00edodo",
  contentsByStatus: "Conte\u00fados por status",
  contentsByLifeStage: "Conte\u00fados por fase da vida",
  questionsByStatus: "Perguntas por status",
  symptomsByCategory: "Itens do cat\u00e1logo por categoria",
  quantity: "Quantidade",
};

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function downloadCsv(report: AdminReport): void {
  const blob = new Blob([reportToCsv(report)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-administrativo-${report.period.start}-${report.period.end}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function hasData(items: ReportDataPoint[]): boolean {
  return items.some((item) => item.value > 0);
}

function EmptyChart({ items }: { items: ReportDataPoint[] }) {
  if (hasData(items)) return null;
  return <p className="flex h-60 items-center justify-center text-sm text-muted-foreground">{COPY.empty}</p>;
}

function AccessibleDataTable({ title, items }: { title: string; items: ReportDataPoint[] }) {
  return (
    <table className="sr-only">
      <caption>{title}</caption>
      <thead><tr><th>Item</th><th>{COPY.quantity}</th></tr></thead>
      <tbody>
        {items.map((item) => <tr key={item.key}><td>{item.label}</td><td>{item.value}</td></tr>)}
      </tbody>
    </table>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const { toast } = useToast();
  const reportQuery = useQuery({
    queryKey: ["admin-report", period],
    queryFn: () => getAdminReport(period),
  });
  const report = reportQuery.data;

  function handleExport() {
    if (!report) return;
    downloadCsv(report);
    toast({ title: COPY.exportSuccess });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{COPY.title}</h1>
          <p className="text-muted-foreground">{COPY.subtitle}</p>
          {report ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {`${COPY.periodLabel}: ${formatDate(report.period.start)} a ${formatDate(report.period.end)}`}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
            <SelectTrigger className="w-40" aria-label={COPY.periodLabel}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{COPY.last7Days}</SelectItem>
              <SelectItem value="30d">{COPY.last30Days}</SelectItem>
              <SelectItem value="90d">{COPY.last90Days}</SelectItem>
              <SelectItem value="365d">{COPY.lastYear}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={!report || reportQuery.isFetching} className="gap-1">
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {reportQuery.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {COPY.loading}</p>
      ) : null}
      {reportQuery.isError ? (
        <div role="alert" className="flex items-center justify-between rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <span>{`${COPY.loadError} ${reportQuery.error instanceof Error ? reportQuery.error.message : ""}`.trim()}</span>
          <Button variant="outline" size="sm" onClick={() => void reportQuery.refetch()}>Tentar novamente</Button>
        </div>
      ) : null}

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title={COPY.contentsCreated} value={report.summary.contents_created} icon={FileText} />
            <MetricCard title={COPY.contentsPublished} value={report.summary.contents_published} icon={CheckCircle2} />
            <MetricCard title={COPY.questionsReceived} value={report.summary.questions_received} icon={MessageCircleQuestion} />
            <MetricCard title={COPY.symptomsCreated} value={report.summary.symptoms_created} icon={Thermometer} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ReportBarCard title={COPY.contentsByStatus} items={report.content_statuses} color="hsl(var(--primary))" />

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">{COPY.contentsByLifeStage}</CardTitle></CardHeader>
              <CardContent>
                <EmptyChart items={report.life_stages} />
                <AccessibleDataTable title={COPY.contentsByLifeStage} items={report.life_stages} />
                {hasData(report.life_stages) ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={report.life_stages} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={85} label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                        {report.life_stages.map((item, index) => <Cell key={item.key} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>

            <ReportBarCard title={COPY.questionsByStatus} items={report.question_statuses} color="hsl(280, 60%, 55%)" horizontal />
            <ReportBarCard title={COPY.symptomsByCategory} items={report.symptom_categories} color="hsl(155, 60%, 45%)" />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ReportBarCard({ title, items, color, horizontal = false }: { title: string; items: ReportDataPoint[]; color: string; horizontal?: boolean }) {
  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <EmptyChart items={items} />
        <AccessibleDataTable title={title} items={items} />
        {hasData(items) ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={items} layout={horizontal ? "vertical" : "horizontal"}>
              <CartesianGrid strokeDasharray="3 3" horizontal={!horizontal} vertical={horizontal} stroke="hsl(var(--border))" />
              {horizontal ? (
                <>
                  <XAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" width={90} fontSize={11} tickLine={false} axisLine={false} />
                </>
              ) : (
                <>
                  <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                </>
              )}
              <Tooltip />
              <Bar dataKey="value" name={COPY.quantity} fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}
