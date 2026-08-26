import type { CycleRecord } from '../api/cycleApi';

import { addDays, daysBetween, parseIsoDate, toIsoDate } from './date';

export type CyclePhase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea';

export type CalendarDayStatus =
  | 'period'
  | 'predictedPeriod'
  | 'fertile'
  | 'ovulation'
  | 'symptom'
  | 'none';

export type Regularity = 'Regular' | 'Irregular' | 'Sem dados';

/**
 * Everything the app shows about the cycle is derived from the periods the
 * user recorded. Fields stay `null` while there is not enough history, so the
 * screens can say "no data yet" instead of inventing an average.
 */
export type CycleStats = {
  cyclesRecorded: number;
  averageCycleDays: number | null;
  averagePeriodDays: number | null;
  lastPeriodStart: string | null;
  regularity: Regularity;
};

/** Two consecutive starts less than this far apart are the same period. */
const minimumCycleDays = 10;
/** Spread between the shortest and longest cycle still considered regular. */
const regularSpreadDays = 4;

export function summarizeCycles(cycles: CycleRecord[]): CycleStats {
  const sorted = [...cycles].sort((left, right) =>
    left.start_date.localeCompare(right.start_date),
  );

  const cycleLengths: number[] = [];

  for (let index = 1; index < sorted.length; index += 1) {
    const length = daysBetween(
      sorted[index - 1].start_date,
      sorted[index].start_date,
    );

    if (length >= minimumCycleDays) {
      cycleLengths.push(length);
    }
  }

  const periodLengths = sorted
    .filter((cycle) => cycle.end_date)
    .map((cycle) => daysBetween(cycle.start_date, cycle.end_date as string) + 1)
    .filter((length) => length > 0);

  return {
    cyclesRecorded: sorted.length,
    averageCycleDays: average(cycleLengths),
    averagePeriodDays: average(periodLengths),
    lastPeriodStart: sorted.at(-1)?.start_date ?? null,
    regularity: rateRegularity(cycleLengths),
  };
}

export function getCycleDay(stats: CycleStats, referenceDate = new Date()) {
  if (!stats.lastPeriodStart || !stats.averageCycleDays) {
    return null;
  }

  const elapsedDays = daysBetween(stats.lastPeriodStart, referenceDate);

  if (elapsedDays < 0) {
    return null;
  }

  return (elapsedDays % stats.averageCycleDays) + 1;
}

export function getDaysUntilNextPeriod(
  stats: CycleStats,
  referenceDate = new Date(),
) {
  const cycleDay = getCycleDay(stats, referenceDate);

  if (cycleDay === null || !stats.averageCycleDays) {
    return null;
  }

  return stats.averageCycleDays - cycleDay + 1;
}

export function getCyclePhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) {
    return 'menstrual';
  }

  if (cycleDay <= 13) {
    return 'folicular';
  }

  if (cycleDay <= 16) {
    return 'ovulatoria';
  }

  return 'lutea';
}

export function getOvulationDate(stats: CycleStats) {
  if (!stats.lastPeriodStart || !stats.averageCycleDays) {
    return null;
  }

  return addDays(stats.lastPeriodStart, stats.averageCycleDays - 14);
}

export function getPredictedPeriodDates(stats: CycleStats) {
  if (!stats.lastPeriodStart || !stats.averageCycleDays) {
    return [];
  }

  const firstDate = addDays(stats.lastPeriodStart, stats.averageCycleDays);

  if (!firstDate) {
    return [];
  }

  const length = stats.averagePeriodDays ?? 5;

  return Array.from({ length }, (_, offset) => addDays(firstDate, offset))
    .filter((date): date is Date => date !== null)
    .map(toIsoDate);
}

export function getFertileWindowDates(stats: CycleStats) {
  const ovulationDate = getOvulationDate(stats);

  if (!ovulationDate) {
    return [];
  }

  return Array.from({ length: 7 }, (_, index) =>
    addDays(ovulationDate, index - 5),
  )
    .filter((date): date is Date => date !== null)
    .map(toIsoDate);
}

export function isDateInCycle(date: string, cycle: CycleRecord) {
  const currentDate = parseIsoDate(date);
  const startDate = parseIsoDate(cycle.start_date);

  if (!currentDate || !startDate) {
    return false;
  }

  const endDate = cycle.end_date ? parseIsoDate(cycle.end_date) : startDate;

  return Boolean(endDate) && currentDate >= startDate && currentDate <= endDate!;
}

export function getCalendarDayStatus(params: {
  date: string;
  cycles: CycleRecord[];
  symptomDates: string[];
  stats: CycleStats;
}): CalendarDayStatus {
  const { date, cycles, symptomDates, stats } = params;

  if (cycles.some((cycle) => isDateInCycle(date, cycle))) {
    return 'period';
  }

  const ovulationDate = getOvulationDate(stats);

  if (ovulationDate && date === toIsoDate(ovulationDate)) {
    return 'ovulation';
  }

  if (getFertileWindowDates(stats).includes(date)) {
    return 'fertile';
  }

  if (getPredictedPeriodDates(stats).includes(date)) {
    return 'predictedPeriod';
  }

  if (symptomDates.includes(date)) {
    return 'symptom';
  }

  return 'none';
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
}

function rateRegularity(cycleLengths: number[]): Regularity {
  if (cycleLengths.length < 2) {
    return 'Sem dados';
  }

  const spread = Math.max(...cycleLengths) - Math.min(...cycleLengths);

  return spread <= regularSpreadDays ? 'Regular' : 'Irregular';
}
