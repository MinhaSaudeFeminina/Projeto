import { requestJson } from './client';
import { withFullAccessMessage, type ApiResult } from './types';

export type FlowIntensity = 'leve' | 'moderado' | 'intenso';

export type CycleRecord = {
  id: number;
  start_date: string;
  end_date: string | null;
  flow_intensity: FlowIntensity | null;
  notes: string | null;
};

export type NewCycle = {
  start_date: string;
  end_date?: string | null;
  flow_intensity?: FlowIntensity | null;
  notes?: string | null;
};

export async function listCycles(): Promise<ApiResult<CycleRecord[]>> {
  const result = await requestJson<{ data: CycleRecord[] }>('/cycles');

  return result.ok
    ? { ok: true, data: result.data.data }
    : withFullAccessMessage(result);
}

export async function createCycle(
  cycle: NewCycle,
): Promise<ApiResult<CycleRecord>> {
  const result = await requestJson<{ data: CycleRecord }>('/cycles', {
    body: cycle,
    method: 'POST',
  });

  return result.ok
    ? { ok: true, data: result.data.data }
    : withFullAccessMessage(result);
}
