import { apiRequest } from "@/services/api/client";
import { getAdminToken } from "@/state/adminAuthStore";

export type ReportPeriod = "7d" | "30d" | "90d" | "365d";

export type ReportDataPoint = {
  key: string;
  label: string;
  value: number;
};

export type AdminReport = {
  period: { key: ReportPeriod; start: string; end: string };
  summary: {
    contents_created: number;
    contents_published: number;
    questions_received: number;
    symptoms_created: number;
  };
  content_statuses: ReportDataPoint[];
  life_stages: ReportDataPoint[];
  question_statuses: ReportDataPoint[];
  symptom_categories: ReportDataPoint[];
};

type ReportResponse = { data: AdminReport };

export async function getAdminReport(period: ReportPeriod): Promise<AdminReport> {
  const response = await apiRequest<ReportResponse>(
    `/admin/reports?period=${period}`,
    {},
    { token: getAdminToken() },
  );

  return response.data;
}
