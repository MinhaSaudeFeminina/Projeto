import { fail, ok, type ApiResult } from '../api/types';
import { getDatabase } from '../db/database';
import {
  listDayLogsInRange,
  listSymptomDatesInRange,
} from '../db/dayLogsRepository';
import {
  clearFlowInRange,
  deletePeriod,
  findPeriod,
  insertPeriod,
  listPeriods,
  updatePeriodRange,
} from '../db/periodsRepository';
import { healthTips } from '../data/staticContent';
import {
  buildCycleForecast,
  getCalendarDayStatus,
  getCyclePosition,
  getOvulationDate,
  isDateInCycle,
  summarizeCycles,
  type CalendarDayStatus,
  type CycleRecord,
  type CyclePosition,
  type CycleStats,
} from '../utils/cycle';
import {
  addDaysIso,
  daysBetween,
  formatLongDate,
  toIsoDate,
  todayIso,
} from '../utils/date';
import { databaseFailure, requireUser } from './access';
import {
  describePeriodWarning,
  validatePeriod,
  type FlowLevel,
  type PeriodDraft,
} from '../utils/period';

export type { CycleRecord, CyclePosition, CycleStats };

export type CycleSummary = {
  cycles: CycleRecord[];
  stats: CycleStats;
  /** `null` until the first period is recorded. */
  position: CyclePosition | null;
  ovulationDate: string | null;
  ongoingPeriod: CycleRecord | null;
  healthTip: string;
};

export type CalendarDay = {
  date: string;
  label: string;
  status: CalendarDayStatus;
  flow: FlowLevel | null;
  hasSymptom: boolean;
  isToday: boolean;
};

export type MonthCalendar = {
  days: CalendarDay[];
  /** Empty cells before the first of the month, so it lands on its weekday. */
  leadingBlanks: number;
};

export type CycleHistoryEntry = {
  id: number;
  startDate: string;
  endDate: string | null;
  periodDays: number | null;
  /** Days until the next period started, `null` for the most recent one. */
  cycleDays: number | null;
  ongoing: boolean;
};

export type SavedPeriod = {
  id: number;
  /** Non-blocking note, e.g. an unusually long menstruation. */
  warning: string | null;
};

export async function getCycleSummary(
  referenceDate = new Date(),
): Promise<ApiResult<CycleSummary>> {
  return run(async (db, userId) => {
    const cycles = await listPeriods(db, userId);
    const stats = summarizeCycles(cycles);
    const reference = toIsoDate(referenceDate);
    const ovulationDate = getOvulationDate(stats);

    return {
      cycles,
      healthTip: healthTips[referenceDate.getDate() % healthTips.length],
      ongoingPeriod: cycles.find((cycle) => cycle.end_date === null) ?? null,
      ovulationDate: ovulationDate ? toIsoDate(ovulationDate) : null,
      position: getCyclePosition(stats, cycles, reference),
      stats,
    };
  });
}

export async function getMonthCalendar(
  monthDate: Date,
): Promise<ApiResult<MonthCalendar>> {
  return run(async (db, userId) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const fromDate = toIsoDate(firstDay);
    const toDate = toIsoDate(new Date(year, month, daysInMonth));
    const today = todayIso();

    const [cycles, dayLogs, symptomDates] = await Promise.all([
      listPeriods(db, userId),
      listDayLogsInRange(db, userId, fromDate, toDate),
      listSymptomDatesInRange(db, userId, fromDate, toDate),
    ]);

    const stats = summarizeCycles(cycles);
    // Built once for the whole month instead of per day: the forecast walks
    // every projected cycle, so recomputing it 31 times is pure waste.
    const forecast = buildCycleForecast(stats, fromDate, toDate);
    const flowByDate = new Map(dayLogs.map((log) => [log.date, log.flow]));

    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const date = toIsoDate(new Date(year, month, index + 1));

      return {
        date,
        flow: flowByDate.get(date) ?? null,
        hasSymptom: symptomDates.includes(date),
        isToday: date === today,
        label: formatLongDate(date),
        status: getCalendarDayStatus({ cycles, date, forecast, referenceIsoDate: today }),
      };
    });

    return { days, leadingBlanks: firstDay.getDay() };
  });
}

export async function getCycleHistory(): Promise<ApiResult<CycleHistoryEntry[]>> {
  return run(async (db, userId) => {
    const cycles = await listPeriods(db, userId);

    return cycles
      .map((cycle, index) => {
        const next = cycles[index + 1];

        return {
          cycleDays: next ? daysBetween(cycle.start_date, next.start_date) : null,
          endDate: cycle.end_date,
          id: cycle.id,
          ongoing: cycle.end_date === null,
          periodDays: cycle.end_date
            ? daysBetween(cycle.start_date, cycle.end_date) + 1
            : null,
          startDate: cycle.start_date,
        };
      })
      .reverse();
  });
}

export function getPeriod(id: number): Promise<ApiResult<CycleRecord | null>> {
  return run(async (db, userId) => (await findPeriod(db, userId, id)) ?? null);
}

export async function savePeriod(
  draft: PeriodDraft,
): Promise<ApiResult<SavedPeriod>> {
  const user = requireUser('acompanhar seu ciclo');

  if (!user.ok) {
    return user;
  }

  try {
    const db = await getDatabase();
    const existing = await listPeriods(db, user.data.id);
    const problem = validatePeriod(draft, existing);

    if (problem) {
      return fail(problem.code, problem.message);
    }

    const period = { endDate: draft.endDate, startDate: draft.startDate };
    let id = draft.id ?? 0;

    if (draft.id === null) {
      id = await insertPeriod(db, user.data.id, period);
    } else {
      // `withTransactionAsync`, not the exclusive variant: that one is not
      // implemented on web, and the app has a single writer anyway.
      await db.withTransactionAsync(async () => {
        const previous = existing.find((cycle) => cycle.id === draft.id);

        // Days that left the range keep their symptoms and mood, but a
        // bleeding flow there would belong to no menstruation.
        if (previous) {
          await clearFlowInRange(
            db,
            user.data.id,
            previous.start_date,
            previous.end_date ?? todayIso(),
          );
        }

        await updatePeriodRange(db, user.data.id, draft.id as number, period);
      });
    }

    return ok({ id, warning: describePeriodWarning(draft) });
  } catch (error) {
    return databaseFailure(error);
  }
}

export async function deletePeriodById(id: number): Promise<ApiResult<null>> {
  const user = requireUser('acompanhar seu ciclo');

  if (!user.ok) {
    return user;
  }

  try {
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      const period = await findPeriod(db, user.data.id, id);

      if (!period) {
        return;
      }

      await clearFlowInRange(
        db,
        user.data.id,
        period.start_date,
        period.end_date ?? todayIso(),
      );
      await deletePeriod(db, user.data.id, id);
    });

    return ok(null);
  } catch (error) {
    return databaseFailure(error);
  }
}

/** The one-tap action on the Ciclo hero. */
export function startPeriodToday(): Promise<ApiResult<SavedPeriod>> {
  return savePeriod({ endDate: null, id: null, startDate: todayIso() });
}

export async function endPeriodToday(): Promise<ApiResult<SavedPeriod>> {
  const user = requireUser('acompanhar seu ciclo');

  if (!user.ok) {
    return user;
  }

  try {
    const db = await getDatabase();
    const cycles = await listPeriods(db, user.data.id);
    const ongoing = cycles.find((cycle) => cycle.end_date === null);

    if (!ongoing) {
      return fail(
        'NO_ONGOING_PERIOD',
        'Nao ha menstruacao em andamento para encerrar.',
      );
    }

    return savePeriod({
      endDate: todayIso(),
      id: ongoing.id,
      startDate: ongoing.start_date,
    });
  } catch (error) {
    return databaseFailure(error);
  }
}

/** Moves an ongoing period's start, for the "comecou ontem" correction. */
export async function shiftOngoingPeriodStart(
  days: number,
): Promise<ApiResult<SavedPeriod>> {
  const user = requireUser('acompanhar seu ciclo');

  if (!user.ok) {
    return user;
  }

  try {
    const db = await getDatabase();
    const cycles = await listPeriods(db, user.data.id);
    const ongoing = cycles.find((cycle) => cycle.end_date === null);

    if (!ongoing) {
      return fail(
        'NO_ONGOING_PERIOD',
        'Nao ha menstruacao em andamento para ajustar.',
      );
    }

    return savePeriod({
      endDate: null,
      id: ongoing.id,
      startDate: addDaysIso(ongoing.start_date, days),
    });
  } catch (error) {
    return databaseFailure(error);
  }
}

export function isTodayInPeriod(cycles: CycleRecord[]) {
  const today = todayIso();

  return cycles.some((cycle) => isDateInCycle(today, cycle, today));
}

async function run<T>(
  operation: (
    db: Awaited<ReturnType<typeof getDatabase>>,
    userId: number,
  ) => Promise<T>,
): Promise<ApiResult<T>> {
  const user = requireUser('acompanhar seu ciclo');

  if (!user.ok) {
    return user;
  }

  try {
    const db = await getDatabase();

    return ok(await operation(db, user.data.id));
  } catch (error) {
    return databaseFailure(error);
  }
}
