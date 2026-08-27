import type { SQLiteDatabase } from 'expo-sqlite';

export type SymptomCatalogRow = {
  key: string;
  name: string;
  category: string | null;
  short_description: string | null;
  is_alert_candidate: number;
  ask_intensity: number;
  orientation_text: string | null;
  severity_alert_text: string | null;
  sort_order: number;
  source: 'seed' | 'remote' | 'user';
};

export function listCatalog(db: SQLiteDatabase) {
  return db.getAllAsync<SymptomCatalogRow>(
    'SELECT * FROM symptom_catalog ORDER BY sort_order, name',
  );
}

export function findSymptom(db: SQLiteDatabase, key: string) {
  return db.getFirstAsync<SymptomCatalogRow>(
    'SELECT * FROM symptom_catalog WHERE key = ?',
    key,
  );
}

/** A symptom the user typed herself. Reused as a chip on later days. */
export async function insertUserSymptom(
  db: SQLiteDatabase,
  symptom: { key: string; name: string; category: string },
) {
  await db.runAsync(
    `INSERT OR IGNORE INTO symptom_catalog
       (key, name, category, ask_intensity, sort_order, source)
     VALUES (?, ?, ?, 1, 900, 'user')`,
    symptom.key,
    symptom.name,
    symptom.category,
  );
}

/**
 * Insert-only on purpose. `GET /symptoms` returns just id, name, description
 * and is_alert_candidate - none of the category, intensity, ordering or
 * guidance fields this table exists to hold - so updating from it would
 * blank the seeded copy, and deleting from it would take the user's own
 * symptoms with it. New names land in `otherCategory` until the endpoint
 * grows the remaining fields.
 */
export async function insertMissingRemoteSymptoms(
  db: SQLiteDatabase,
  symptoms: { key: string; name: string; description: string | null; isAlertCandidate: boolean }[],
  otherCategory: string,
) {
  for (const symptom of symptoms) {
    await db.runAsync(
      `INSERT OR IGNORE INTO symptom_catalog
         (key, name, category, short_description, is_alert_candidate,
          ask_intensity, sort_order, source)
       VALUES (?, ?, ?, ?, ?, 1, 800, 'remote')`,
      symptom.key,
      symptom.name,
      otherCategory,
      symptom.description,
      symptom.isAlertCandidate ? 1 : 0,
    );
  }
}
