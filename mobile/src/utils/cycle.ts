import { addDays, daysBetween, toIsoDate, todayIso } from './date';

export type CyclePhase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea';

/**
 * Mutually exclusive cycle state of a calendar day. Symptoms are deliberately
 * absent: they are drawn as a dot on top of whatever state the day already has,
 * so a period day with symptoms keeps reading as a period day.
 */
export type CalendarDayStatus =
  | 'period'
  | 'predictedPeriod'
  | 'fertile'
  | 'ovulation'
  | 'none';

export type Regularity = 'Regular' | 'Irregular' | 'Sem dados';

/**
 * A recorded menstruation. `end_date` is null while it is still happening.
 * The snake_case names are the SQLite column names, kept as-is so rows travel
 * from the database to these rules without a translation layer.
 */
export type CycleRecord = {
  id: number;
  start_date: string;
  end_date: string | null;
};

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
  lastPeriodEnd: string | null;
  /** True when the most recent period has no end date yet. */
  ongoing: boolean;
  regularity: Regularity;
};

/** Where the user is inside the current cycle. */
export type CyclePosition = {
  /** 1-based and unbounded: it keeps counting when the period is late. */
  cycleDay: number;
  phase: CyclePhase;
  /** Zero or negative once the predicted date has passed. */
  daysUntilNextPeriod: number;
  isLate: boolean;
  lateDays: number;
  /** 1-based day of the menstruation itself, null outside a period. */
  periodDay: number | null;
  /** True while the numbers lean on the textbook defaults. */
  estimated: boolean;
};

export type CycleForecast = {
  periodDates: string[];
  fertileDates: string[];
  ovulationDates: string[];
};

/** Two consecutive starts less than this far apart are the same period. */
export const minimumCycleDays = 10;
/**
 * Above this, the gap is not a cycle: it is a stretch the user did not track.
 * Backfilling old periods makes holey history normal, and without this cap a
 * single six-month gap folded into the mean destroys every prediction.
 */
const maximumCycleDays = 60;
/** Spread between the shortest and longest cycle still considered regular. */
const regularSpreadDays = 4;
/** Textbook cycle, used only to predict before the user has two periods. */
export const defaultCycleDays = 28;
/** Textbook menstruation length, used the same way. */
export const defaultPeriodDays = 5;
/** The luteal phase is the stable half; ovulation is counted back from the end. */
const lutealPhaseDays = 14;

export function summarizeCycles(cycles: CycleRecord[]): CycleStats {
  const sorted = sortByStart(cycles);
  const cycleLengths: number[] = [];

  for (let index = 1; index < sorted.length; index += 1) {
    const length = daysBetween(
      sorted[index - 1].start_date,
      sorted[index].start_date,
    );

    if (length >= minimumCycleDays && length <= maximumCycleDays) {
      cycleLengths.push(length);
    }
  }

  const periodLengths = sorted
    .filter((cycle) => cycle.end_date)
    .map((cycle) => daysBetween(cycle.start_date, cycle.end_date as string) + 1)
    .filter((length) => length > 0);

  const last = sorted.at(-1) ?? null;

  return {
    averageCycleDays: average(cycleLengths),
    averagePeriodDays: average(periodLengths),
    cyclesRecorded: sorted.length,
    lastPeriodEnd: last?.end_date ?? null,
    lastPeriodStart: last?.start_date ?? null,
    ongoing: Boolean(last) && last?.end_date === null,
    regularity: rateRegularity(cycleLengths),
  };
}

export function sortByStart(cycles: CycleRecord[]) {
  return [...cycles].sort((left, right) =>
    left.start_date.localeCompare(right.start_date),
  );
}

/**
 * Cycle length to predict with. Until two periods are recorded there is no
 * average, and returning nothing there left a woman who had just logged her
 * first period with an app that showed her a screen full of dashes. Anything
 * derived from the fallback is labelled an estimate; `CycleStats` stays honest.
 */
export function getEffectiveCycleDays(stats: CycleStats) {
  return stats.averageCycleDays ?? defaultCycleDays;
}

export function getEffectivePeriodDays(stats: CycleStats) {
  return stats.averagePeriodDays ?? defaultPeriodDays;
}

export function isCycleEstimated(stats: CycleStats) {
  return stats.averageCycleDays === null;
}

export function getCyclePosition(
  stats: CycleStats,
  cycles: CycleRecord[],
  referenceIsoDate = todayIso(),
): CyclePosition | null {
  if (!stats.lastPeriodStart) {
    return null;
  }

  const elapsedDays = daysBetween(stats.lastPeriodStart, referenceIsoDate);

  if (elapsedDays < 0) {
    return null;
  }

  // No modulo here on purpose. Wrapping used to report "dia 8" to a woman who
  // was eight days late, which is the exact moment she trusts this screen most.
  const cycleDay = elapsedDays + 1;
  const cycleLength = getEffectiveCycleDays(stats);
  const daysUntilNextPeriod = cycleLength - cycleDay + 1;

  return {
    cycleDay,
    daysUntilNextPeriod,
    estimated: isCycleEstimated(stats),
    // `daysUntilNextPeriod` is 0 on the day the period is due, so late starts
    // below zero. Counting the due day itself as a day of delay would tell a
    // woman she is late on the exact day she is expecting to bleed.
    isLate: daysUntilNextPeriod < 0,
    lateDays: Math.max(0, -daysUntilNextPeriod),
    periodDay: getPeriodDay(cycles, referenceIsoDate),
    phase: getCyclePhase(cycleDay, stats),
  };
}

/** 1-based day inside the menstruation covering `date`, or null. */
export function getPeriodDay(cycles: CycleRecord[], date = todayIso()) {
  const current = cycles.find((cycle) => isDateInCycle(date, cycle, date));

  return current ? daysBetween(current.start_date, date) + 1 : null;
}

/**
 * Anchored to the same `length - 14` that drives `getOvulationDate`. Fixed
 * thresholds used to claim day 21 of a 35-day cycle was luteal while the
 * ovulation date said it was ovulation day.
 */
export function getCyclePhase(cycleDay: number, stats: CycleStats): CyclePhase {
  if (cycleDay <= getEffectivePeriodDays(stats)) {
    return 'menstrual';
  }

  const ovulationDay = getEffectiveCycleDays(stats) - lutealPhaseDays + 1;

  if (cycleDay < ovulationDay - 1) {
    return 'folicular';
  }

  if (cycleDay <= ovulationDay + 1) {
    return 'ovulatoria';
  }

  return 'lutea';
}

/** Next expected ovulation, counted from the last recorded period. */
export function getOvulationDate(stats: CycleStats) {
  if (!stats.lastPeriodStart) {
    return null;
  }

  return addDays(stats.lastPeriodStart, getEffectiveCycleDays(stats) - lutealPhaseDays);
}

/**
 * Predictions covering an arbitrary window, so paging the calendar forward
 * keeps showing them instead of going blank after the first projected cycle.
 */
export function buildCycleForecast(
  stats: CycleStats,
  fromDate: string,
  toDate: string,
): CycleForecast {
  const forecast: CycleForecast = {
    fertileDates: [],
    ovulationDates: [],
    periodDates: [],
  };

  if (!stats.lastPeriodStart) {
    return forecast;
  }

  const cycleLength = getEffectiveCycleDays(stats);
  const periodLength = getEffectivePeriodDays(stats);

  // The window can open before the last recorded period, so the current
  // cycle's fertile window and ovulation belong to it too: index 0.
  // `maximumProjections` only guards against a corrupt cycle length; the loop
  // normally stops as soon as a projected start passes the window.
  const maximumProjections = 60;

  for (let index = 0; index <= maximumProjections; index += 1) {
    const start = addDays(stats.lastPeriodStart, cycleLength * index);

    if (!start || toIsoDate(start) > toDate) {
      break;
    }

    // Index 0 is the recorded period itself, drawn from `cycles`, not predicted.
    if (index > 0) {
      collectRange(forecast.periodDates, start, periodLength, fromDate, toDate);
    }

    const ovulation = addDays(start, cycleLength - lutealPhaseDays);

    if (ovulation) {
      pushWhenInside(forecast.ovulationDates, toIsoDate(ovulation), fromDate, toDate);
      collectRange(forecast.fertileDates, addDays(ovulation, -5), 7, fromDate, toDate);
    }
  }

  return forecast;
}

export function isDateInCycle(
  date: string,
  cycle: CycleRecord,
  referenceIsoDate = todayIso(),
) {
  if (date < cycle.start_date) {
    return false;
  }

  // An ongoing period runs from its start up to today. Falling back to the
  // start date painted a single day and made "estou menstruada" invisible.
  const end = cycle.end_date ?? referenceIsoDate;

  return date <= end;
}

export function getCalendarDayStatus(params: {
  cycles: CycleRecord[];
  date: string;
  forecast: CycleForecast;
  referenceIsoDate?: string;
}): CalendarDayStatus {
  const { cycles, date, forecast, referenceIsoDate = todayIso() } = params;

  if (cycles.some((cycle) => isDateInCycle(date, cycle, referenceIsoDate))) {
    return 'period';
  }

  if (forecast.ovulationDates.includes(date)) {
    return 'ovulation';
  }

  if (forecast.fertileDates.includes(date)) {
    return 'fertile';
  }

  if (forecast.periodDates.includes(date)) {
    return 'predictedPeriod';
  }

  return 'none';
}

function collectRange(
  target: string[],
  start: Date | null,
  length: number,
  fromDate: string,
  toDate: string,
) {
  if (!start) {
    return;
  }

  for (let offset = 0; offset < length; offset += 1) {
    const date = addDays(start, offset);

    if (date) {
      pushWhenInside(target, toIsoDate(date), fromDate, toDate);
    }
  }
}

function pushWhenInside(
  target: string[],
  date: string,
  fromDate: string,
  toDate: string,
) {
  if (date >= fromDate && date <= toDate && !target.includes(date)) {
    target.push(date);
  }
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
