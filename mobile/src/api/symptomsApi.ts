import {
  mockSymptoms,
  mockSymptomTypes,
  mockUser,
  type SymptomEntry,
  type SymptomIntensity,
  type SymptomType,
} from '../data/mockData';

import { fail, ok, type ApiResult } from './types';

let symptomEntries: SymptomEntry[] = mockSymptoms.map((symptom) => ({
  ...symptom,
}));

export type SaveSymptomEntryInput = {
  type: string;
  intensity: SymptomIntensity;
  notes?: string;
  date: string;
  userId?: string;
};

export function listSymptomTypes(): ApiResult<SymptomType[]> {
  return ok(mockSymptomTypes as SymptomType[]);
}

export function listSymptomEntries(userId = mockUser.id): ApiResult<SymptomEntry[]> {
  return ok(symptomEntries.filter((entry) => entry.userId === userId));
}

export function saveSymptomEntries(
  entries: SaveSymptomEntryInput[],
): ApiResult<SymptomEntry[]> {
  if (entries.length === 0) {
    return fail(
      'EMPTY_SYMPTOM_ENTRIES',
      'Selecione pelo menos um sintoma.',
    );
  }

  const validTypeIds = new Set(mockSymptomTypes.map((type) => type.id));
  const validIntensities: SymptomIntensity[] = ['leve', 'moderado', 'intenso'];

  const hasInvalidEntry = entries.some(
    (entry) =>
      !validTypeIds.has(entry.type) ||
      !validIntensities.includes(entry.intensity) ||
      Number.isNaN(new Date(`${entry.date}T00:00:00`).getTime()),
  );

  if (hasInvalidEntry) {
    return fail(
      'INVALID_SYMPTOM_ENTRY',
      'Registro de sintoma invalido.',
    );
  }

  const savedEntries = entries.map((entry, index) => ({
    id: `${Date.now()}-${index}`,
    userId: entry.userId ?? mockUser.id,
    type: entry.type,
    intensity: entry.intensity,
    notes: entry.notes ?? '',
    date: entry.date,
  }));

  symptomEntries = [...symptomEntries, ...savedEntries];

  return ok(savedEntries);
}

export function resetSymptomEntries(): ApiResult<SymptomEntry[]> {
  symptomEntries = mockSymptoms.map((symptom) => ({
    ...symptom,
  }));

  return ok(symptomEntries);
}
