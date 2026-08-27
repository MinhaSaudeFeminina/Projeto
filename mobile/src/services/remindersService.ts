import { fail, ok, type ApiResult } from '../api/types';
import {
  addDays,
  addMonths,
  daysBetween,
  formatLongDate,
  parseIsoDate,
  toIsoDate,
} from '../utils/date';
import { secureStorage } from './secureStorage';

/**
 * Reminders have no backend yet, so they live on the device only and never
 * leave it. Everything here is local storage, not an API call.
 */
const storageKey = 'mobile.reminders';

export type ReminderType = 'consulta' | 'exame' | 'vacina' | 'outro';

export type ReminderRecurrence =
  | 'nenhuma'
  | 'diaria'
  | 'semanal'
  | 'mensal'
  | 'anual';

export const reminderRecurrences: {
  label: string;
  value: ReminderRecurrence;
}[] = [
  { label: 'Nao repete', value: 'nenhuma' },
  { label: 'Todo dia', value: 'diaria' },
  { label: 'Toda semana', value: 'semanal' },
  { label: 'Todo mes', value: 'mensal' },
  { label: 'Todo ano', value: 'anual' },
];

export type Reminder = {
  id: string;
  title: string;
  type: ReminderType;
  /** First occurrence. Never moves: every other one is derived from it. */
  date: string;
  recurrence: ReminderRecurrence;
  /** Only meaningful for reminders that do not repeat. */
  completed: boolean;
  /** Latest completed occurrence of a repeating reminder. */
  completedThrough: string | null;
};

export type ReminderDraft = {
  title: string;
  type: ReminderType;
  date: string;
  recurrence: ReminderRecurrence;
};

export type ReminderViewModel = Reminder & {
  /** Next pending occurrence; the same as `date` when there is no repetition. */
  nextDate: string;
  formattedDate: string;
  recurring: boolean;
  recurrenceLabel: string;
};

export async function getUserReminders(): Promise<
  ApiResult<ReminderViewModel[]>
> {
  const today = toIsoDate(new Date());
  const reminders = await readReminders();

  return ok(reminders.map((reminder) => toViewModel(reminder, today)));
}

export async function addReminder(
  reminder: ReminderDraft,
): Promise<ApiResult<ReminderViewModel>> {
  if (!reminder.title.trim()) {
    return fail('EMPTY_REMINDER_TITLE', 'Informe um titulo para o lembrete.');
  }

  const created: Reminder = {
    ...reminder,
    completed: false,
    completedThrough: null,
    id: `${Date.now()}`,
    title: reminder.title.trim(),
  };

  const reminders = await readReminders();
  const written = await writeReminders([...reminders, created]);

  return written.ok
    ? ok(toViewModel(created, toIsoDate(new Date())))
    : written;
}

export async function toggleReminderCompleted(
  id: string,
): Promise<ApiResult<ReminderViewModel[]>> {
  const today = toIsoDate(new Date());
  const reminders = await readReminders();

  if (!reminders.some((reminder) => reminder.id === id)) {
    return fail('REMINDER_NOT_FOUND', 'Lembrete nao encontrado.', false);
  }

  const updated = reminders.map((reminder) =>
    reminder.id === id ? completeOccurrence(reminder, today) : reminder,
  );

  const written = await writeReminders(updated);

  return written.ok
    ? ok(updated.map((reminder) => toViewModel(reminder, today)))
    : written;
}

export function getReminderFeedbackMessage(reminder?: ReminderViewModel) {
  if (reminder?.recurring) {
    return `Ocorrencia concluida! A proxima e em ${reminder.formattedDate}.`;
  }

  return 'Lembrete atualizado!';
}

/**
 * Completing a repeating reminder does not close it: the current occurrence is
 * checked off and the reminder comes back on the following date.
 */
function completeOccurrence(reminder: Reminder, today: string): Reminder {
  if (reminder.recurrence === 'nenhuma') {
    return { ...reminder, completed: !reminder.completed };
  }

  return { ...reminder, completedThrough: nextOccurrence(reminder, today) };
}

/** First occurrence still pending, skipping whatever was already completed. */
function nextOccurrence(reminder: Reminder, today: string) {
  if (reminder.recurrence === 'nenhuma') {
    return reminder.date;
  }

  const afterCompleted = reminder.completedThrough
    ? shiftDays(reminder.completedThrough, 1)
    : today;
  const pendingFrom = afterCompleted > today ? afterCompleted : today;

  return occurrenceOnOrAfter(reminder.date, reminder.recurrence, pendingFrom);
}

function occurrenceOnOrAfter(
  anchor: string,
  recurrence: ReminderRecurrence,
  from: string,
) {
  // Without a valid start date there is no series to walk, and the search below
  // would never leave the first date.
  if (!parseIsoDate(anchor) || from <= anchor) {
    return anchor;
  }

  let steps = estimateSteps(anchor, recurrence, from);
  let occurrence = occurrenceAt(anchor, recurrence, steps);

  // The jump above deliberately undershoots; this catches up over months of
  // different lengths and leap years.
  while (occurrence < from) {
    steps += 1;
    occurrence = occurrenceAt(anchor, recurrence, steps);
  }

  return occurrence;
}

/**
 * Occurrences are counted from the original date instead of chained one after
 * another, so a monthly reminder set on the 31st goes back to the 31st after a
 * short month clamps it.
 */
function occurrenceAt(
  anchor: string,
  recurrence: ReminderRecurrence,
  steps: number,
) {
  switch (recurrence) {
    case 'diaria':
      return shiftDays(anchor, steps);
    case 'semanal':
      return shiftDays(anchor, steps * 7);
    case 'mensal':
      return shiftMonths(anchor, steps);
    case 'anual':
      return shiftMonths(anchor, steps * 12);
    default:
      return anchor;
  }
}

function estimateSteps(
  anchor: string,
  recurrence: ReminderRecurrence,
  from: string,
) {
  const elapsedDays = Math.max(0, daysBetween(anchor, from));

  switch (recurrence) {
    case 'diaria':
      return elapsedDays;
    case 'semanal':
      return Math.floor(elapsedDays / 7);
    case 'mensal':
      return Math.floor(elapsedDays / 31);
    case 'anual':
      return Math.floor(elapsedDays / 366);
    default:
      return 0;
  }
}

function shiftDays(date: string, days: number) {
  const shifted = addDays(date, days);

  return shifted ? toIsoDate(shifted) : date;
}

function shiftMonths(date: string, months: number) {
  const shifted = addMonths(date, months);

  return shifted ? toIsoDate(shifted) : date;
}

async function readReminders(): Promise<Reminder[]> {
  try {
    const stored = await secureStorage.getItem(storageKey);

    return stored ? (JSON.parse(stored) as Reminder[]).map(withRecurrence) : [];
  } catch {
    return [];
  }
}

/** Reminders stored before recurrence existed have none of the new fields. */
function withRecurrence(reminder: Reminder): Reminder {
  const known = reminderRecurrences.some(
    (option) => option.value === reminder.recurrence,
  );

  return {
    ...reminder,
    completedThrough: reminder.completedThrough ?? null,
    recurrence: known ? reminder.recurrence : 'nenhuma',
  };
}

async function writeReminders(
  reminders: Reminder[],
): Promise<ApiResult<Reminder[]>> {
  try {
    await secureStorage.setItem(storageKey, JSON.stringify(reminders));

    return ok(reminders);
  } catch {
    return fail(
      'REMINDER_STORAGE_FAILED',
      'Nao foi possivel salvar o lembrete neste dispositivo.',
    );
  }
}

function toViewModel(reminder: Reminder, today: string): ReminderViewModel {
  const nextDate = nextOccurrence(reminder, today);

  return {
    ...reminder,
    formattedDate: formatLongDate(nextDate),
    nextDate,
    recurrenceLabel: recurrenceLabel(reminder.recurrence),
    recurring: reminder.recurrence !== 'nenhuma',
  };
}

function recurrenceLabel(recurrence: ReminderRecurrence) {
  return (
    reminderRecurrences.find((option) => option.value === recurrence)?.label ??
    'Nao repete'
  );
}
