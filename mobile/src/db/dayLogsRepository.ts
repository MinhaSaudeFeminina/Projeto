import type { SQLiteDatabase } from 'expo-sqlite';

import type { FlowLevel, MoodLevel, SymptomIntensity } from '../utils/period';

export type DayLogRow = {
  id: number;
  date: string;
  flow: FlowLevel | null;
  mood: MoodLevel | null;
  notes: string | null;
};

export type DaySymptomRow = {
  symptom_key: string;
  intensity: SymptomIntensity | null;
};

export function findDayLog(
  db: SQLiteDatabase,
  userId: number,
  date: string,
) {
  return db.getFirstAsync<DayLogRow>(
    'SELECT id, date, flow, mood, notes FROM day_logs WHERE user_id = ? AND date = ?',
    userId,
    date,
  );
}

export function listDayLogsInRange(
  db: SQLiteDatabase,
  userId: number,
  fromDate: string,
  toDate: string,
) {
  return db.getAllAsync<DayLogRow>(
    `SELECT id, date, flow, mood, notes FROM day_logs
      WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date`,
    userId,
    fromDate,
    toDate,
  );
}

export async function listSymptomDatesInRange(
  db: SQLiteDatabase,
  userId: number,
  fromDate: string,
  toDate: string,
) {
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT DISTINCT day_logs.date AS date
       FROM day_logs
       JOIN day_symptoms ON day_symptoms.day_log_id = day_logs.id
      WHERE day_logs.user_id = ? AND day_logs.date BETWEEN ? AND ?`,
    userId,
    fromDate,
    toDate,
  );

  return rows.map((row) => row.date);
}

export function listDaySymptoms(db: SQLiteDatabase, dayLogId: number) {
  return db.getAllAsync<DaySymptomRow>(
    'SELECT symptom_key, intensity FROM day_symptoms WHERE day_log_id = ?',
    dayLogId,
  );
}

export async function upsertDayLog(
  db: SQLiteDatabase,
  userId: number,
  log: {
    date: string;
    flow: FlowLevel | null;
    mood: MoodLevel | null;
    notes: string | null;
  },
) {
  await db.runAsync(
    `INSERT INTO day_logs (user_id, date, flow, mood, notes)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (user_id, date)
     DO UPDATE SET flow = excluded.flow, mood = excluded.mood, notes = excluded.notes`,
    userId,
    log.date,
    log.flow,
    log.mood,
    log.notes,
  );

  const row = await findDayLog(db, userId, log.date);

  return row!.id;
}

/** The screen always sends the full set for the day, so replace rather than diff. */
export async function replaceDaySymptoms(
  db: SQLiteDatabase,
  dayLogId: number,
  symptoms: { key: string; intensity: SymptomIntensity | null }[],
) {
  await db.runAsync('DELETE FROM day_symptoms WHERE day_log_id = ?', dayLogId);

  for (const symptom of symptoms) {
    await db.runAsync(
      'INSERT INTO day_symptoms (day_log_id, symptom_key, intensity) VALUES (?, ?, ?)',
      dayLogId,
      symptom.key,
      symptom.intensity,
    );
  }
}

export async function deleteDayLog(
  db: SQLiteDatabase,
  userId: number,
  date: string,
) {
  await db.runAsync(
    'DELETE FROM day_logs WHERE user_id = ? AND date = ?',
    userId,
    date,
  );
}

/** An empty day log carries no information and would still paint a dot. */
export async function deleteEmptyDayLog(
  db: SQLiteDatabase,
  userId: number,
  date: string,
) {
  await db.runAsync(
    `DELETE FROM day_logs
      WHERE user_id = ? AND date = ?
        AND flow IS NULL AND mood IS NULL AND (notes IS NULL OR notes = '')
        AND NOT EXISTS (
          SELECT 1 FROM day_symptoms WHERE day_symptoms.day_log_id = day_logs.id
        )`,
    userId,
    date,
  );
}
