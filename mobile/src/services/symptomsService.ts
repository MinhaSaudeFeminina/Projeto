import {
  listSymptomEntries,
  listSymptomTypes,
  saveSymptomEntries,
  type SaveSymptomEntryInput,
} from '../api/symptomsApi';
import { type ApiResult, ok } from '../api/types';
import type {
  SymptomEntry,
  SymptomIntensity,
  SymptomType,
} from '../data/mockData';
import { toIsoDate } from '../utils/date';

export type PendingSymptomEntry = {
  type: string;
  intensity: SymptomIntensity;
  notes: string;
  date: string;
};

export function getSymptomOptions(): ApiResult<SymptomType[]> {
  return listSymptomTypes();
}

export function getUserSymptoms(userId?: string): ApiResult<SymptomEntry[]> {
  return listSymptomEntries(userId);
}

export function togglePendingSymptom(
  entries: PendingSymptomEntry[],
  type: string,
  date = toIsoDate(new Date()),
): PendingSymptomEntry[] {
  const exists = entries.some((entry) => entry.type === type);

  if (exists) {
    return entries.filter((entry) => entry.type !== type);
  }

  return [
    ...entries,
    {
      type,
      intensity: 'leve',
      notes: '',
      date,
    },
  ];
}

export function updatePendingSymptomIntensity(
  entries: PendingSymptomEntry[],
  type: string,
  intensity: SymptomIntensity,
): PendingSymptomEntry[] {
  return entries.map((entry) =>
    entry.type === type
      ? {
          ...entry,
          intensity,
        }
      : entry,
  );
}

export function registerSymptoms(
  entries: PendingSymptomEntry[],
): ApiResult<SymptomEntry[]> {
  const payload: SaveSymptomEntryInput[] = entries.map((entry) => ({
    type: entry.type,
    intensity: entry.intensity,
    notes: entry.notes,
    date: entry.date,
  }));

  return saveSymptomEntries(payload);
}

export function getSymptomSuccessMessage(count: number): ApiResult<string> {
  return ok(`${count} sintoma(s) registrado(s)!`);
}
