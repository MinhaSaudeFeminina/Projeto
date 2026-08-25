import {
  listReminders,
  toggleReminderCompleted,
} from '../api/remindersApi';
import type { ApiResult } from '../api/types';
import type { Reminder } from '../data/mockData';
import { formatLongDate } from '../utils/date';

export type ReminderViewModel = Reminder & {
  formattedDate: string;
};

export function getUserReminders(userId?: string): ApiResult<ReminderViewModel[]> {
  const result = listReminders(userId);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data.map((reminder) => ({
      ...reminder,
      formattedDate: formatLongDate(reminder.date),
    })),
  };
}

export function completeReminder(id: string): ApiResult<ReminderViewModel> {
  const result = toggleReminderCompleted(id);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: {
      ...result.data,
      formattedDate: formatLongDate(result.data.date),
    },
  };
}

export function getReminderFeedbackMessage(): string {
  return 'Lembrete atualizado!';
}
