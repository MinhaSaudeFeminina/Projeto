import { apiRequest } from "@/services/api/client";
import { isLifeStageAvailableOnWeb } from "@/services/webContentScope";
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
    symptoms_created: number;
  };
  content_statuses: ReportDataPoint[];
  life_stages: ReportDataPoint[];
  symptom_categories: ReportDataPoint[];
};

type ReportResponse = { data: AdminReport };

export async function getAdminReport(period: ReportPeriod): Promise<AdminReport> {
  const response = await apiRequest<ReportResponse>(
    `/admin/reports?period=${period}`,
    {},
    { token: getAdminToken() },
  );

  return {
    ...response.data,
    life_stages: response.data.life_stages.filter(isLifeStageAvailableOnWeb),
  };
}
