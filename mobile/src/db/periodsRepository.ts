import type { SQLiteDatabase } from 'expo-sqlite';

import type { CycleRecord } from '../utils/cycle';

/**
 * Every function takes the executor as its first argument instead of reaching
 * for `getDatabase()`, so a service can compose several writes inside one
 * `withTransactionAsync` and so the queries can be exercised against a real
 * SQLite in tests without the native module.
 */
export function listPeriods(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<CycleRecord>(
    'SELECT id, start_date, end_date FROM periods WHERE user_id = ? ORDER BY start_date',
    userId,
  );
}

export function findPeriod(db: SQLiteDatabase, userId: number, id: number) {
  return db.getFirstAsync<CycleRecord>(
    'SELECT id, start_date, end_date FROM periods WHERE user_id = ? AND id = ?',
    userId,
    id,
  );
}

export async function insertPeriod(
  db: SQLiteDatabase,
  userId: number,
  period: { startDate: string; endDate: string | null },
) {
  const result = await db.runAsync(
    'INSERT INTO periods (user_id, start_date, end_date) VALUES (?, ?, ?)',
    userId,
    period.startDate,
    period.endDate,
  );

  return result.lastInsertRowId;
}

export async function updatePeriodRange(
  db: SQLiteDatabase,
  userId: number,
  id: number,
  period: { startDate: string; endDate: string | null },
) {
  await db.runAsync(
    'UPDATE periods SET start_date = ?, end_date = ? WHERE user_id = ? AND id = ?',
    period.startDate,
    period.endDate,
    userId,
    id,
  );
}

export async function deletePeriod(
  db: SQLiteDatabase,
  userId: number,
  id: number,
) {
  await db.runAsync(
    'DELETE FROM periods WHERE user_id = ? AND id = ?',
    userId,
    id,
  );
}

/**
 * Keeps the invariant when a period disappears: a day log must never keep a
 * bleeding flow that belongs to no menstruation, or the calendar paints red
 * days outside every cycle.
 */
export async function clearFlowInRange(
  db: SQLiteDatabase,
  userId: number,
  startDate: string,
  endDate: string,
) {
  await db.runAsync(
    'UPDATE day_logs SET flow = NULL WHERE user_id = ? AND date BETWEEN ? AND ?',
    userId,
    startDate,
    endDate,
  );
}
