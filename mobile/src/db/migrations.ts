import type { SQLiteDatabase } from 'expo-sqlite';

import { symptomCatalogSeed } from '../data/symptomCatalogSeed';

const latestVersion = 1;

/**
 * Periods are stored as intervals rather than as a flag on each day. The
 * alternative - deriving ranges from consecutive bleeding days - makes
 * overlaps and inverted ranges impossible, but this app has to let a woman
 * backfill "menstruei de 3 a 8 de marco" in one go and has to represent a
 * menstruation that started and has not ended yet. Both are natural as an
 * interval and awkward as derived state, so the validation in
 * `src/utils/period.ts` is the price paid for them.
 */
const version1 = `
CREATE TABLE periods (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date   TEXT,
  UNIQUE (user_id, start_date)
);

CREATE TABLE day_logs (
  id      INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date    TEXT NOT NULL,
  flow    TEXT CHECK (flow IS NULL OR flow IN ('escape', 'leve', 'moderado', 'intenso')),
  mood    TEXT CHECK (mood IS NULL OR mood IN ('otima', 'bem', 'neutra', 'triste', 'irritada', 'ansiosa')),
  notes   TEXT,
  UNIQUE (user_id, date)
);

CREATE TABLE day_symptoms (
  day_log_id  INTEGER NOT NULL REFERENCES day_logs (id) ON DELETE CASCADE,
  symptom_key TEXT NOT NULL,
  intensity   TEXT CHECK (intensity IS NULL OR intensity IN ('leve', 'moderado', 'intenso')),
  PRIMARY KEY (day_log_id, symptom_key)
);

CREATE TABLE symptom_catalog (
  key                 TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  category            TEXT,
  short_description   TEXT,
  is_alert_candidate  INTEGER NOT NULL DEFAULT 0,
  ask_intensity       INTEGER NOT NULL DEFAULT 1,
  orientation_text    TEXT,
  severity_alert_text TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  source              TEXT NOT NULL DEFAULT 'seed' CHECK (source IN ('seed', 'remote', 'user'))
);
`;

export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  let version = row?.user_version ?? 0;

  if (version >= latestVersion) {
    return;
  }

  if (version === 0) {
    await db.execAsync(version1);
    await seedCatalog(db);
    version = 1;
  }

  // PRAGMA does not accept bound parameters. The value is a module constant,
  // never user input, so interpolating it is safe here.
  await db.execAsync(`PRAGMA user_version = ${latestVersion}`);
}

async function seedCatalog(db: SQLiteDatabase) {
  const statement = await db.prepareAsync(`
    INSERT INTO symptom_catalog (
      key, name, category, short_description, is_alert_candidate,
      ask_intensity, orientation_text, severity_alert_text, sort_order, source
    ) VALUES (
      $key, $name, $category, $shortDescription, $isAlertCandidate,
      $askIntensity, $orientationText, $severityAlertText, $sortOrder, 'seed'
    )
  `);

  try {
    for (const symptom of symptomCatalogSeed) {
      await statement.executeAsync({
        $askIntensity: symptom.askIntensity ? 1 : 0,
        $category: symptom.category,
        $isAlertCandidate: symptom.isAlertCandidate ? 1 : 0,
        $key: symptom.key,
        $name: symptom.name,
        $orientationText: symptom.orientationText,
        $severityAlertText: symptom.severityAlertText,
        $shortDescription: symptom.shortDescription,
        $sortOrder: symptom.sortOrder,
      });
    }
  } finally {
    await statement.finalizeAsync();
  }
}
