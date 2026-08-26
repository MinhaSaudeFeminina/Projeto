import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import ReportsPage from "@/pages/ReportsPage";
import { getAdminReport, type AdminReport } from "@/services/api/reportApi";
import { reportToCsv } from "@/services/reports/reportCsv";

vi.mock("@/services/api/reportApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services/api/reportApi")>();
  return { ...original, getAdminReport: vi.fn() };
});

const report: AdminReport = {
  period: { key: "30d", start: "2026-07-27", end: "2026-08-25" },
  summary: {
    contents_created: 4,
    contents_published: 2,
    questions_received: 7,
    symptoms_created: 3,
  },
  content_statuses: [{ key: "published", label: "Publicado", value: 2 }],
  life_stages: [{ key: "adulta", label: "Fase adulta", value: 4 }],
  question_statuses: [{ key: "nova", label: "Nova", value: 7 }],
  symptom_categories: [{ key: "Geral", label: "Geral", value: 3 }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("loads and renders the administrative report from the API", async () => {
  vi.mocked(getAdminReport).mockResolvedValue(report);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <ReportsPage />
    </QueryClientProvider>,
  );

  expect(screen.getByText("Carregando relat\u00f3rio...")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Conte\u00fados por status" })).toBeInTheDocument();
  expect(screen.getByText("Per\u00edodo do relat\u00f3rio: 27/07/2026 a 25/08/2026")).toBeInTheDocument();
  expect(screen.getByText("Conte\u00fados criados no per\u00edodo")).toBeInTheDocument();
  expect(screen.getAllByText("4")).toHaveLength(2);
  expect(screen.getByText("Perguntas recebidas no per\u00edodo")).toBeInTheDocument();
  expect(screen.getAllByText("7")).toHaveLength(2);
  expect(screen.getAllByRole("table")).toHaveLength(4);
  expect(getAdminReport).toHaveBeenCalledWith("30d");
  expect(screen.queryByText("Total usu\u00e1rias")).not.toBeInTheDocument();
});

test("shows the API error details and offers a retry action", async () => {
  vi.mocked(getAdminReport).mockRejectedValue(new Error("Servi\u00e7o temporariamente indispon\u00edvel."));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <ReportsPage />
    </QueryClientProvider>,
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "N\u00e3o foi poss\u00edvel carregar o relat\u00f3rio. Servi\u00e7o temporariamente indispon\u00edvel.",
  );
  expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
});

test("generates a UTF-8 CSV with summaries and report distributions", () => {
  const csv = reportToCsv(report);

  expect(csv.startsWith("\uFEFF")).toBe(true);
  expect(csv).toContain('"Conte\u00fados publicados no per\u00edodo";"2"');
  expect(csv).toContain('"Fase adulta";"4"');
  expect(csv).toContain('"Geral";"3"');
});
