import { isDateInCycle, minimumCycleDays, type CycleRecord } from './cycle';
import { addDaysIso, daysBetween, formatShortDate, parseIsoDate, todayIso } from './date';

export const flowLevels = ['escape', 'leve', 'moderado', 'intenso'] as const;
export type FlowLevel = (typeof flowLevels)[number];

export const moodLevels = [
  'otima',
  'bem',
  'neutra',
  'triste',
  'irritada',
  'ansiosa',
] as const;
export type MoodLevel = (typeof moodLevels)[number];

export const symptomIntensities = ['leve', 'moderado', 'intenso'] as const;
export type SymptomIntensity = (typeof symptomIntensities)[number];

export const flowLabels: Record<FlowLevel, string> = {
  escape: 'Escape',
  intenso: 'Intenso',
  leve: 'Leve',
  moderado: 'Moderado',
};

/**
 * How the day felt overall, one per day. Distinct from symptoms, which are
 * things that happened and can be many per day - the catalog already carries
 * Irritabilidade and Ansiedade as symptoms.
 */
export const moodLabels: Record<MoodLevel, string> = {
  ansiosa: 'Ansiosa',
  bem: 'Bem',
  irritada: 'Irritada',
  neutra: 'Neutra',
  otima: 'Otima',
  triste: 'Triste',
};

/** Escape is not menstruation, so it never opens or extends a period. */
export function isBleeding(flow: FlowLevel | null) {
  return flow === 'leve' || flow === 'moderado' || flow === 'intenso';
}

/** Beyond this a menstruation is unusual enough to warn about, never to block. */
export const longPeriodDays = 15;
/** A start older than this is almost always a typo in the year. */
export const maximumHistoryYears = 2;

export type PeriodDraft = {
  id: number | null;
  startDate: string;
  endDate: string | null;
};

export type PeriodProblem = {
  code: string;
  message: string;
};

export function validatePeriod(
  draft: PeriodDraft,
  existing: CycleRecord[],
  today = todayIso(),
): PeriodProblem | null {
  if (!parseIsoDate(draft.startDate)) {
    return {
      code: 'INVALID_START',
      message: 'Informe a data de inicio no formato DD/MM/AAAA.',
    };
  }

  if (draft.endDate !== null && !parseIsoDate(draft.endDate)) {
    return {
      code: 'INVALID_END',
      message: 'Informe a data de termino no formato DD/MM/AAAA.',
    };
  }

  if (draft.endDate !== null && draft.endDate < draft.startDate) {
    return {
      code: 'END_BEFORE_START',
      message: 'O termino nao pode ser antes do inicio.',
    };
  }

  // A start in the future makes `getCyclePosition` give up and every screen
  // fall back to dashes, with nothing on screen explaining why.
  if (draft.startDate > today) {
    return {
      code: 'FUTURE_START',
      message: 'Nao da para registrar uma menstruacao que ainda nao aconteceu.',
    };
  }

  if (draft.endDate !== null && draft.endDate > today) {
    return {
      code: 'FUTURE_END',
      message: 'O termino nao pode ser uma data futura.',
    };
  }

  if (draft.startDate < addDaysIso(today, -365 * maximumHistoryYears)) {
    return {
      code: 'TOO_OLD',
      message: `So da para registrar menstruacoes dos ultimos ${maximumHistoryYears} anos.`,
    };
  }

  const others = existing.filter((cycle) => cycle.id !== draft.id);
  const draftEnd = draft.endDate ?? today;

  // Checked before the overlap rule: an open period runs to today, so it always
  // overlaps anything recorded after it, and "ja existe uma menstruacao em
  // 20/08" would hide the real mistake.
  if (draft.endDate === null && others.some((cycle) => cycle.start_date > draft.startDate)) {
    return {
      code: 'ONGOING_NOT_LAST',
      message: 'So a menstruacao mais recente pode ficar sem data de termino.',
    };
  }

  const overlapping = others.find((cycle) => {
    const cycleEnd = cycle.end_date ?? today;

    return cycle.start_date <= draftEnd && cycleEnd >= draft.startDate;
  });

  if (overlapping) {
    return {
      code: 'OVERLAP',
      message: `Ja existe uma menstruacao registrada a partir de ${formatShortDate(overlapping.start_date)}.`,
    };
  }

  // Two starts closer than a cycle are the same menstruation split in two.
  // `summarizeCycles` drops the short gap from the average, but it still takes
  // `lastPeriodStart` from the newest row, which would shift every prediction.
  const tooClose = others.find(
    (cycle) =>
      Math.abs(daysBetween(cycle.start_date, draft.startDate)) <
      minimumCycleDays,
  );

  if (tooClose) {
    return {
      code: 'TOO_CLOSE',
      message: `Isso fica a poucos dias da menstruacao de ${formatShortDate(tooClose.start_date)}. Edite aquela em vez de criar outra.`,
    };
  }

  return null;
}

/** Non-blocking note shown after a valid save. */
export function describePeriodWarning(draft: PeriodDraft, today = todayIso()) {
  const end = draft.endDate ?? today;
  const length = daysBetween(draft.startDate, end) + 1;

  return length > longPeriodDays
    ? `Foram ${length} dias. Se a menstruacao esta durando muito, vale conversar com uma profissional de saude.`
    : null;
}

/**
 * What has to happen to `periods` so the invariant holds: a day with bleeding
 * flow always sits inside exactly one period, and a day without it never sits
 * at the edge of one.
 */
export type PeriodSyncAction =
  | { type: 'none' }
  | { type: 'create'; startDate: string; endDate: string }
  | { type: 'range'; id: number; startDate: string; endDate: string | null }
  | { type: 'merge'; keepId: number; removeId: number; startDate: string; endDate: string | null }
  | { type: 'delete'; id: number };

export function planPeriodSync(params: {
  date: string;
  flow: FlowLevel | null;
  periods: CycleRecord[];
  today?: string;
}): PeriodSyncAction {
  const { date, flow, periods, today = todayIso() } = params;
  const covering = periods.find((cycle) => isDateInCycle(date, cycle, today));

  if (isBleeding(flow)) {
    if (covering) {
      return { type: 'none' };
    }

    const endsDayBefore = periods.find(
      (cycle) => cycle.end_date !== null && cycle.end_date === addDaysIso(date, -1),
    );
    const startsDayAfter = periods.find(
      (cycle) => cycle.start_date === addDaysIso(date, 1),
    );

    // The day bridges two rows that were always the same menstruation.
    if (endsDayBefore && startsDayAfter) {
      return {
        endDate: startsDayAfter.end_date,
        keepId: endsDayBefore.id,
        removeId: startsDayAfter.id,
        startDate: endsDayBefore.start_date,
        type: 'merge',
      };
    }

    if (endsDayBefore) {
      return {
        endDate: date,
        id: endsDayBefore.id,
        startDate: endsDayBefore.start_date,
        type: 'range',
      };
    }

    if (startsDayAfter) {
      return {
        endDate: startsDayAfter.end_date,
        id: startsDayAfter.id,
        startDate: date,
        type: 'range',
      };
    }

    return { endDate: date, startDate: date, type: 'create' };
  }

  if (!covering) {
    return { type: 'none' };
  }

  const isOnlyDay =
    covering.start_date === date &&
    (covering.end_date === null || covering.end_date === date);

  if (isOnlyDay) {
    return { id: covering.id, type: 'delete' };
  }

  if (covering.start_date === date) {
    return {
      endDate: covering.end_date,
      id: covering.id,
      startDate: addDaysIso(date, 1),
      type: 'range',
    };
  }

  if (covering.end_date === date) {
    return {
      endDate: addDaysIso(date, -1),
      id: covering.id,
      startDate: covering.start_date,
      type: 'range',
    };
  }

  // A light day in the middle of a menstruation is normal; it does not split
  // the period in two.
  return { type: 'none' };
}
