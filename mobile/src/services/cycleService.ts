import { apiRequest } from "@/services/api/client";

export function createCycle(token: string, input: { start_date: string; end_date?: string; flow_intensity?: string }) {
  return apiRequest("/mobile/cycles", { method: "POST", body: JSON.stringify(input) }, token);
}

export function fetchCycles(token: string) {
  return apiRequest("/mobile/cycles", {}, token);
}
