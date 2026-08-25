import { mockReminders, mockUser, type Reminder } from '../data/mockData';

import { fail, ok, type ApiResult } from './types';

let reminders: Reminder[] = mockReminders.map((reminder) => ({
  ...reminder,
}));

export function listReminders(userId = mockUser.id): ApiResult<Reminder[]> {
  return ok(reminders.filter((reminder) => reminder.userId === userId));
}

export function toggleReminderCompleted(id: string): ApiResult<Reminder> {
  const reminder = reminders.find((item) => item.id === id);

  if (!reminder) {
    return fail(
      'REMINDER_NOT_FOUND',
      'Lembrete nao encontrado.',
      false,
    );
  }

  const updatedReminder = {
    ...reminder,
    completed: !reminder.completed,
  };

  reminders = reminders.map((item) =>
    item.id === id ? updatedReminder : item,
  );

  return ok(updatedReminder);
}

export function resetReminders(): ApiResult<Reminder[]> {
  reminders = mockReminders.map((reminder) => ({
    ...reminder,
  }));

  return ok(reminders);
}
