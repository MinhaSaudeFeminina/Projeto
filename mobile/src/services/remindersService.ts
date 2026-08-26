import { fail, ok, type ApiResult } from '../api/types';
import { formatLongDate } from '../utils/date';
import { secureStorage } from './secureStorage';

/**
 * Reminders have no backend yet, so they live on the device only and never
 * leave it. Everything here is local storage, not an API call.
 */
const storageKey = 'mobile.reminders';

export type ReminderType = 'consulta' | 'exame' | 'vacina' | 'outro';

export type Reminder = {
  id: string;
  title: string;
  type: ReminderType;
  date: string;
  completed: boolean;
};

export type ReminderViewModel = Reminder & {
  formattedDate: string;
};

export async function getUserReminders(): Promise<
  ApiResult<ReminderViewModel[]>
> {
  const reminders = await readReminders();

  return ok(reminders.map(toViewModel));
}

export async function addReminder(
  reminder: Omit<Reminder, 'id' | 'completed'>,
): Promise<ApiResult<ReminderViewModel>> {
  if (!reminder.title.trim()) {
    return fail('EMPTY_REMINDER_TITLE', 'Informe um titulo para o lembrete.');
  }

  const created: Reminder = {
    ...reminder,
    completed: false,
    id: `${Date.now()}`,
    title: reminder.title.trim(),
  };

  const reminders = await readReminders();
  const written = await writeReminders([...reminders, created]);

  return written.ok ? ok(toViewModel(created)) : written;
}

export async function toggleReminderCompleted(
  id: string,
): Promise<ApiResult<ReminderViewModel[]>> {
  const reminders = await readReminders();

  if (!reminders.some((reminder) => reminder.id === id)) {
    return fail('REMINDER_NOT_FOUND', 'Lembrete nao encontrado.', false);
  }

  const updated = reminders.map((reminder) =>
    reminder.id === id
      ? { ...reminder, completed: !reminder.completed }
      : reminder,
  );

  const written = await writeReminders(updated);

  return written.ok ? ok(updated.map(toViewModel)) : written;
}

export function getReminderFeedbackMessage() {
  return 'Lembrete atualizado!';
}

async function readReminders(): Promise<Reminder[]> {
  try {
    const stored = await secureStorage.getItem(storageKey);

    return stored ? (JSON.parse(stored) as Reminder[]) : [];
  } catch {
    return [];
  }
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

function toViewModel(reminder: Reminder): ReminderViewModel {
  return { ...reminder, formattedDate: formatLongDate(reminder.date) };
}
