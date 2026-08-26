import { requestJson } from './client';
import { withFullAccessMessage, type ApiResult } from './types';

export type Symptom = {
  id: number;
  name: string;
  description: string | null;
  is_alert_candidate: boolean;
};

export type SymptomRecord = {
  id: number;
  symptom_id: number | null;
  custom_symptom: string | null;
  /** Backend scale, 1 to 10. */
  intensity: number;
  occurred_on: string;
  notes: string | null;
  alert_shown: boolean;
  symptom?: Symptom | null;
};

export type NewSymptomRecord = {
  symptom_id?: number | null;
  custom_symptom?: string | null;
  intensity: number;
  occurred_on: string;
  notes?: string | null;
};

export type SymptomRecordCreated = {
  record: SymptomRecord;
  /** Present when the record trips a health alert. */
  guidance: string | null;
};

export async function listSymptomCatalog(): Promise<ApiResult<Symptom[]>> {
  const result = await requestJson<{ data: Symptom[] }>('/symptoms', {
    token: null,
  });

  return result.ok ? { ok: true, data: result.data.data } : result;
}

export async function listSymptomRecords(): Promise<ApiResult<SymptomRecord[]>> {
  const result = await requestJson<{ data: SymptomRecord[] }>(
    '/symptom-records',
  );

  return result.ok
    ? { ok: true, data: result.data.data }
    : withFullAccessMessage(result);
}

export async function createSymptomRecord(
  record: NewSymptomRecord,
): Promise<ApiResult<SymptomRecordCreated>> {
  const result = await requestJson<{
    data: SymptomRecord;
    guidance: string | null;
  }>('/symptom-records', {
    body: record,
    method: 'POST',
  });

  return result.ok
    ? { ok: true, data: { record: result.data.data, guidance: result.data.guidance } }
    : withFullAccessMessage(result);
}
