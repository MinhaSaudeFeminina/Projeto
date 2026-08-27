import { requestJson } from './client';
import type { ApiResult } from './types';

/**
 * The catalog is editorial content managed in the admin portal, so it stays on
 * the API. Everything a user records about her cycle - periods, day logs and
 * symptoms - lives only in the local SQLite database and never leaves the
 * device.
 */
export type Symptom = {
  id: number;
  name: string;
  description: string | null;
  is_alert_candidate: boolean;
};

export async function listSymptomCatalog(): Promise<ApiResult<Symptom[]>> {
  const result = await requestJson<{ data: Symptom[] }>('/symptoms', {
    token: null,
  });

  return result.ok ? { ok: true, data: result.data.data } : result;
}
