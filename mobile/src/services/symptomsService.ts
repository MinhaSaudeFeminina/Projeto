import {
  createSymptomRecord,
  listSymptomCatalog,
  listSymptomRecords,
  type Symptom,
  type SymptomRecord,
} from '../api/symptomsApi';
import { fail, ok, type ApiResult } from '../api/types';
import { toIsoDate } from '../utils/date';

export type { Symptom, SymptomRecord };

export type SymptomIntensity = 'leve' | 'moderado' | 'intenso';

export const symptomIntensities: SymptomIntensity[] = [
  'leve',
  'moderado',
  'intenso',
];

/**
 * The backend stores intensity on a 1-10 scale; the app offers three levels.
 * These are the mid-points of each third, so a round trip keeps its label.
 */
const intensityScale: Record<SymptomIntensity, number> = {
  leve: 3,
  moderado: 6,
  intenso: 9,
};

export type PendingSymptomEntry = {
  symptomId: number;
  intensity: SymptomIntensity;
  notes: string;
  date: string;
};

export function getSymptomCatalog(): Promise<ApiResult<Symptom[]>> {
  return listSymptomCatalog();
}

export function getUserSymptomRecords(): Promise<ApiResult<SymptomRecord[]>> {
  return listSymptomRecords();
}

export function describeIntensity(value: number): SymptomIntensity {
  if (value >= 8) {
    return 'intenso';
  }

  return value >= 5 ? 'moderado' : 'leve';
}

export function togglePendingSymptom(
  entries: PendingSymptomEntry[],
  symptomId: number,
  date = toIsoDate(new Date()),
): PendingSymptomEntry[] {
  const exists = entries.some((entry) => entry.symptomId === symptomId);

  if (exists) {
    return entries.filter((entry) => entry.symptomId !== symptomId);
  }

  return [...entries, { date, intensity: 'leve', notes: '', symptomId }];
}

export function updatePendingSymptomIntensity(
  entries: PendingSymptomEntry[],
  symptomId: number,
  intensity: SymptomIntensity,
): PendingSymptomEntry[] {
  return entries.map((entry) =>
    entry.symptomId === symptomId ? { ...entry, intensity } : entry,
  );
}

export type RegisteredSymptoms = {
  records: SymptomRecord[];
  /** Set when at least one record tripped a health alert on the backend. */
  guidance: string | null;
};

export async function registerSymptoms(
  entries: PendingSymptomEntry[],
): Promise<ApiResult<RegisteredSymptoms>> {
  if (entries.length === 0) {
    return fail('EMPTY_SYMPTOM_ENTRIES', 'Selecione pelo menos um sintoma.');
  }

  // The API takes one record per call, so a partial failure is possible; the
  // first error is surfaced and the already-saved records are kept.
  const records: SymptomRecord[] = [];
  let guidance: string | null = null;

  for (const entry of entries) {
    const result = await createSymptomRecord({
      intensity: intensityScale[entry.intensity],
      notes: entry.notes || null,
      occurred_on: entry.date,
      symptom_id: entry.symptomId,
    });

    if (!result.ok) {
      return result;
    }

    records.push(result.data.record);
    guidance = guidance ?? result.data.guidance;
  }

  return ok({ guidance, records });
}
