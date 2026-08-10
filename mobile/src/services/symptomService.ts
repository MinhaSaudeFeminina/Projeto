import { apiRequest } from "@/services/api/client";

export function createSymptomRecord(
  token: string,
  input: { symptom_id?: number; custom_symptom?: string; intensity: number; occurred_on: string; notes?: string },
) {
  return apiRequest("/mobile/symptom-records", { method: "POST", body: JSON.stringify(input) }, token);
}

export function fetchSymptomRecords(token: string) {
  return apiRequest("/mobile/symptom-records", {}, token);
}
