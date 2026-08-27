import type { AdminReport } from "@/services/api/reportApi";

const sections: Array<[string, keyof Pick<AdminReport, "content_statuses" | "life_stages" | "symptom_categories">]> = [
  ["Conte\u00fados por status", "content_statuses"],
  ["Conte\u00fados por fase da vida", "life_stages"],
  ["Itens do cat\u00e1logo por categoria", "symptom_categories"],
];

function escapeCsv(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function reportToCsv(report: AdminReport): string {
  const rows: Array<Array<string | number>> = [
    ["Relat\u00f3rio administrativo"],
    ["Per\u00edodo", report.period.start, report.period.end],
    [],
    ["Indicador", "Valor"],
    ["Conte\u00fados criados no per\u00edodo", report.summary.contents_created],
    ["Conte\u00fados publicados no per\u00edodo", report.summary.contents_published],
    ["Sintomas cadastrados no per\u00edodo", report.summary.symptoms_created],
  ];

  sections.forEach(([title, key]) => {
    rows.push([], [title], ["Item", "Quantidade"]);
    report[key].forEach((item) => rows.push([item.label, item.value]));
  });

  return `\uFEFF${rows.map((row) => row.map(escapeCsv).join(";")).join("\r\n")}`;
}
