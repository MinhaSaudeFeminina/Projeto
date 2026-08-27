import { fail, ok, type ApiResult } from '../api/types';
import { getDatabase } from '../db/database';
import {
  deleteDayLog,
  deleteEmptyDayLog,
  findDayLog,
  listDaySymptoms,
  replaceDaySymptoms,
  upsertDayLog,
} from '../db/dayLogsRepository';
import {
  deletePeriod,
  insertPeriod,
  listPeriods,
  updatePeriodRange,
} from '../db/periodsRepository';
import { formatShortDate, todayIso } from '../utils/date';
import {
  isBleeding,
  planPeriodSync,
  type FlowLevel,
  type MoodLevel,
  type SymptomIntensity,
} from '../utils/period';
import { databaseFailure, requireUser } from './access';
import { getSymptomCatalog, getSymptomGuidance, type SymptomOption } from './symptomsService';

export type DaySymptomSelection = {
  key: string;
  intensity: SymptomIntensity | null;
};

export type DayLogDraft = {
  date: string;
  flow: FlowLevel | null;
  mood: MoodLevel | null;
  notes: string;
  symptoms: DaySymptomSelection[];
};

export type DayLogDetail = {
  draft: DayLogDraft;
  catalog: SymptomOption[];
  /** True when the date already sits inside a recorded menstruation. */
  insidePeriod: boolean;
};

export type SavedDayLog = {
  /** Health guidance when a logged symptom asks for attention. */
  guidance: string | null;
  /** What the save did to the menstruation, when it did anything. */
  periodNote: string | null;
};

export async function getDayLogDetail(
  date: string,
): Promise<ApiResult<DayLogDetail>> {
  const user = requireUser('registrar seu dia');

  if (!user.ok) {
    return user;
  }

  const catalog = await getSymptomCatalog();

  if (!catalog.ok) {
    return catalog;
  }

  try {
    const db = await getDatabase();
    const log = await findDayLog(db, user.data.id, date);
    const symptoms = log ? await listDaySymptoms(db, log.id) : [];
    const periods = await listPeriods(db, user.data.id);
    const today = todayIso();

    return ok({
      catalog: catalog.data,
      draft: {
        date,
        flow: log?.flow ?? null,
        mood: log?.mood ?? null,
        notes: log?.notes ?? '',
        symptoms: symptoms.map((symptom) => ({
          intensity: symptom.intensity,
          key: symptom.symptom_key,
        })),
      },
      insidePeriod: periods.some(
        (period) =>
          date >= period.start_date && date <= (period.end_date ?? today),
      ),
    });
  } catch (error) {
    return databaseFailure(error);
  }
}

export async function saveDayLog(
  draft: DayLogDraft,
  catalog: SymptomOption[],
): Promise<ApiResult<SavedDayLog>> {
  const user = requireUser('registrar seu dia');

  if (!user.ok) {
    return user;
  }

  if (draft.date > todayIso()) {
    return fail(
      'FUTURE_DAY',
      'Nao da para registrar um dia que ainda nao aconteceu.',
    );
  }

  try {
    const db = await getDatabase();
    const periods = await listPeriods(db, user.data.id);
    const action = planPeriodSync({
      date: draft.date,
      flow: draft.flow,
      periods,
    });

    // `withTransactionAsync`, not the exclusive variant: that one is not
    // implemented on web, and the app has a single writer anyway.
    await db.withTransactionAsync(async () => {
      const dayLogId = await upsertDayLog(db, user.data.id, {
        date: draft.date,
        flow: draft.flow,
        mood: draft.mood,
        notes: draft.notes.trim() || null,
      });

      await replaceDaySymptoms(db, dayLogId, draft.symptoms);
      await deleteEmptyDayLog(db, user.data.id, draft.date);
      await applyPeriodSync(db, user.data.id, action);
    });

    return ok({
      guidance: findGuidance(draft.symptoms, catalog),
      periodNote: describeSync(action, draft.date),
    });
  } catch (error) {
    return databaseFailure(error);
  }
}

export async function deleteDayLogForDate(
  date: string,
): Promise<ApiResult<null>> {
  const user = requireUser('registrar seu dia');

  if (!user.ok) {
    return user;
  }

  try {
    const db = await getDatabase();
    const periods = await listPeriods(db, user.data.id);
    const action = planPeriodSync({ date, flow: null, periods });

    await db.withTransactionAsync(async () => {
      await deleteDayLog(db, user.data.id, date);
      await applyPeriodSync(db, user.data.id, action);
    });

    return ok(null);
  } catch (error) {
    return databaseFailure(error);
  }
}

async function applyPeriodSync(
  db: Awaited<ReturnType<typeof getDatabase>>,
  userId: number,
  action: ReturnType<typeof planPeriodSync>,
) {
  if (action.type === 'create') {
    await insertPeriod(db, userId, {
      endDate: action.endDate,
      startDate: action.startDate,
    });
    return;
  }

  if (action.type === 'range') {
    await updatePeriodRange(db, userId, action.id, {
      endDate: action.endDate,
      startDate: action.startDate,
    });
    return;
  }

  if (action.type === 'merge') {
    await deletePeriod(db, userId, action.removeId);
    await updatePeriodRange(db, userId, action.keepId, {
      endDate: action.endDate,
      startDate: action.startDate,
    });
    return;
  }

  if (action.type === 'delete') {
    await deletePeriod(db, userId, action.id);
  }
}

/**
 * The user is told what happened to her menstruation, because the calendar
 * changing on its own would otherwise look like a bug.
 */
function describeSync(
  action: ReturnType<typeof planPeriodSync>,
  date: string,
): string | null {
  const day = formatShortDate(date);

  switch (action.type) {
    case 'create':
      return `Menstruacao registrada em ${day}.`;
    case 'range':
    case 'merge':
      return `Sua menstruacao foi ajustada para incluir ${day}.`;
    case 'delete':
      return `A menstruacao de ${day} foi removida.`;
    default:
      return null;
  }
}

function findGuidance(
  selections: DaySymptomSelection[],
  catalog: SymptomOption[],
) {
  for (const selection of selections) {
    const symptom = catalog.find((option) => option.key === selection.key);
    const guidance = symptom
      ? getSymptomGuidance(symptom, selection.intensity)
      : null;

    if (guidance) {
      return guidance;
    }
  }

  return null;
}

export { isBleeding };
