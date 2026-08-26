import { createCycle, listCycles, type CycleRecord, type NewCycle } from '../api/cycleApi';
import { ok, type ApiResult } from '../api/types';
import { healthTips } from '../data/staticContent';
import {
  getCalendarDayStatus,
  getCycleDay,
  getCyclePhase,
  getDaysUntilNextPeriod,
  getFertileWindowDates,
  getOvulationDate,
  getPredictedPeriodDates,
  summarizeCycles,
  type CalendarDayStatus,
  type CyclePhase,
  type CycleStats,
} from '../utils/cycle';
import { formatLongDate, toIsoDate } from '../utils/date';

export type { CycleRecord, CycleStats };

export type CycleSummary = {
  stats: CycleStats;
  cycles: CycleRecord[];
  /** `null` until there is enough history to predict anything. */
  cycleDay: number | null;
  phase: CyclePhase | null;
  daysUntilNextPeriod: number | null;
  nextPeriodDates: string[];
  fertileWindowDates: string[];
  ovulationDate: string | null;
  healthTip: string;
};

export type CalendarDay = {
  date: string;
  label: string;
  status: CalendarDayStatus;
};

export async function getCycleSummary(
  referenceDate = new Date(),
): Promise<ApiResult<CycleSummary>> {
  const result = await listCycles();

  if (!result.ok) {
    return result;
  }

  return ok(buildSummary(result.data, referenceDate));
}

export function registerPeriodStart(
  cycle: NewCycle,
): Promise<ApiResult<CycleRecord>> {
  return createCycle(cycle);
}

export function buildMonthCalendar(
  summary: CycleSummary,
  symptomDates: string[],
  monthDate = new Date(),
): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = toIsoDate(new Date(year, month, index + 1));

    return {
      date,
      label: formatLongDate(date),
      status: getCalendarDayStatus({
        cycles: summary.cycles,
        date,
        stats: summary.stats,
        symptomDates,
      }),
    };
  });
}

function buildSummary(
  cycles: CycleRecord[],
  referenceDate: Date,
): CycleSummary {
  const stats = summarizeCycles(cycles);
  const cycleDay = getCycleDay(stats, referenceDate);
  const ovulationDate = getOvulationDate(stats);

  return {
    cycleDay,
    cycles,
    daysUntilNextPeriod: getDaysUntilNextPeriod(stats, referenceDate),
    fertileWindowDates: getFertileWindowDates(stats),
    healthTip: healthTips[referenceDate.getDate() % healthTips.length],
    nextPeriodDates: getPredictedPeriodDates(stats),
    ovulationDate: ovulationDate ? toIsoDate(ovulationDate) : null,
    phase: cycleDay === null ? null : getCyclePhase(cycleDay),
    stats,
  };
}
