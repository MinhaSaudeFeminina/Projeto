/**
 * @jest-environment node
 */
import { symptomCatalogSeed } from '../../data/symptomCatalogSeed';
import {
  deleteEmptyDayLog,
  findDayLog,
  listDaySymptoms,
  listSymptomDatesInRange,
  replaceDaySymptoms,
  upsertDayLog,
} from '../dayLogsRepository';
import { migrate } from '../migrations';
import {
  clearFlowInRange,
  deletePeriod,
  insertPeriod,
  listPeriods,
  updatePeriodRange,
} from '../periodsRepository';
import {
  insertMissingRemoteSymptoms,
  insertUserSymptom,
  listCatalog,
} from '../symptomCatalogRepository';
import { createTestDatabase } from './sqliteAdapter';

type TestDatabase = ReturnType<typeof createTestDatabase>;

// The repositories are typed against expo-sqlite's `SQLiteDatabase`; the
// adapter implements the subset they actually call.
const asDatabase = (db: TestDatabase) => db as never;

async function setup() {
  const db = createTestDatabase();

  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrate(asDatabase(db));

  return db;
}

describe('migrations', () => {
  it('creates the schema and stamps the version', async () => {
    const db = await setup();
    const version = await db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );

    expect(version?.user_version).toBe(1);
  });

  it('is a no-op on a database already at the latest version', async () => {
    const db = await setup();

    await migrate(asDatabase(db));

    expect((await listCatalog(asDatabase(db))).length).toBe(
      symptomCatalogSeed.length,
    );
  });

  it('seeds the whole catalog with its guidance text', async () => {
    const db = await setup();
    const rows = await listCatalog(asDatabase(db));
    const colica = rows.find((row) => row.key === 'colica');
    const pelvica = rows.find((row) => row.key === 'dor-pelvica');

    expect(rows).toHaveLength(12);
    expect(colica?.name).toBe('Cólica');
    expect(colica?.is_alert_candidate).toBe(0);
    expect(pelvica?.is_alert_candidate).toBe(1);
    expect(pelvica?.severity_alert_text).toContain('atendimento profissional');
    // Ordered by sort_order, so the catalog reads the way it was authored.
    expect(rows[0].key).toBe('colica');
  });
});

describe('periods', () => {
  it('stores and reads a period scoped to its user', async () => {
    const db = await setup();

    await insertPeriod(asDatabase(db), 1, {
      endDate: '2026-08-05',
      startDate: '2026-08-01',
    });
    await insertPeriod(asDatabase(db), 2, {
      endDate: null,
      startDate: '2026-08-03',
    });

    const mine = await listPeriods(asDatabase(db), 1);

    expect(mine).toHaveLength(1);
    expect(mine[0].start_date).toBe('2026-08-01');
    expect(await listPeriods(asDatabase(db), 2)).toHaveLength(1);
  });

  it('refuses two periods starting on the same day for one user', async () => {
    const db = await setup();

    await insertPeriod(asDatabase(db), 1, {
      endDate: null,
      startDate: '2026-08-01',
    });

    await expect(
      insertPeriod(asDatabase(db), 1, {
        endDate: null,
        startDate: '2026-08-01',
      }),
    ).rejects.toThrow();
  });

  it('clears the flow of days that a period no longer covers', async () => {
    const db = await setup();

    const id = await insertPeriod(asDatabase(db), 1, {
      endDate: '2026-08-05',
      startDate: '2026-08-01',
    });

    for (const date of ['2026-08-01', '2026-08-04']) {
      await upsertDayLog(asDatabase(db), 1, {
        date,
        flow: 'moderado',
        mood: null,
        notes: null,
      });
    }

    await clearFlowInRange(asDatabase(db), 1, '2026-08-01', '2026-08-05');
    await updatePeriodRange(asDatabase(db), 1, id, {
      endDate: '2026-08-02',
      startDate: '2026-08-01',
    });

    const log = await findDayLog(asDatabase(db), 1, '2026-08-04');

    expect(log?.flow).toBeNull();
  });

  it('deletes only the period, leaving the day logs in place', async () => {
    const db = await setup();
    const id = await insertPeriod(asDatabase(db), 1, {
      endDate: '2026-08-05',
      startDate: '2026-08-01',
    });

    await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-02',
      flow: null,
      mood: 'triste',
      notes: null,
    });
    await deletePeriod(asDatabase(db), 1, id);

    expect(await listPeriods(asDatabase(db), 1)).toHaveLength(0);
    expect((await findDayLog(asDatabase(db), 1, '2026-08-02'))?.mood).toBe(
      'triste',
    );
  });
});

describe('day logs', () => {
  it('upserts the same day instead of duplicating it', async () => {
    const db = await setup();

    const first = await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: 'leve',
      mood: null,
      notes: null,
    });
    const second = await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: 'intenso',
      mood: 'bem',
      notes: 'dia puxado',
    });

    expect(second).toBe(first);
    const log = await findDayLog(asDatabase(db), 1, '2026-08-10');
    expect(log?.flow).toBe('intenso');
    expect(log?.notes).toBe('dia puxado');
  });

  it('rejects a flow value outside the allowed set', async () => {
    const db = await setup();

    await expect(
      upsertDayLog(asDatabase(db), 1, {
        date: '2026-08-10',
        flow: 'torrencial' as never,
        mood: null,
        notes: null,
      }),
    ).rejects.toThrow();
  });

  it('replaces the symptom set of a day', async () => {
    const db = await setup();
    const id = await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: null,
      mood: null,
      notes: null,
    });

    await replaceDaySymptoms(asDatabase(db), id, [
      { intensity: 'leve', key: 'colica' },
      { intensity: null, key: 'inchaco' },
    ]);
    await replaceDaySymptoms(asDatabase(db), id, [
      { intensity: 'intenso', key: 'colica' },
    ]);

    const symptoms = await listDaySymptoms(asDatabase(db), id);

    expect(symptoms).toEqual([
      { intensity: 'intenso', symptom_key: 'colica' },
    ]);
  });

  it('cascades symptoms when the day log goes away', async () => {
    const db = await setup();
    const id = await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: null,
      mood: null,
      notes: null,
    });

    await replaceDaySymptoms(asDatabase(db), id, [
      { intensity: null, key: 'colica' },
    ]);
    await db.runAsync('DELETE FROM day_logs WHERE id = ?', id);

    expect(await listDaySymptoms(asDatabase(db), id)).toHaveLength(0);
  });

  it('drops a day log that ended up carrying nothing', async () => {
    const db = await setup();

    await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: null,
      mood: null,
      notes: null,
    });
    await deleteEmptyDayLog(asDatabase(db), 1, '2026-08-10');

    expect(await findDayLog(asDatabase(db), 1, '2026-08-10')).toBeNull();
  });

  it('keeps a day log that still has a symptom on it', async () => {
    const db = await setup();
    const id = await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: null,
      mood: null,
      notes: null,
    });

    await replaceDaySymptoms(asDatabase(db), id, [
      { intensity: null, key: 'colica' },
    ]);
    await deleteEmptyDayLog(asDatabase(db), 1, '2026-08-10');

    expect(await findDayLog(asDatabase(db), 1, '2026-08-10')).not.toBeNull();
  });

  it('lists the days inside a range that carry symptoms', async () => {
    const db = await setup();

    const withSymptom = await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-10',
      flow: null,
      mood: null,
      notes: null,
    });
    await replaceDaySymptoms(asDatabase(db), withSymptom, [
      { intensity: null, key: 'colica' },
    ]);
    await upsertDayLog(asDatabase(db), 1, {
      date: '2026-08-11',
      flow: null,
      mood: 'bem',
      notes: null,
    });

    const dates = await listSymptomDatesInRange(
      asDatabase(db),
      1,
      '2026-08-01',
      '2026-08-31',
    );

    expect(dates).toEqual(['2026-08-10']);
  });
});

describe('symptom catalog', () => {
  it('keeps a custom symptom the user typed', async () => {
    const db = await setup();

    await insertUserSymptom(asDatabase(db), {
      category: 'Meus sintomas',
      key: 'custom:enjoo',
      name: 'Enjoo',
    });

    const created = (await listCatalog(asDatabase(db))).find(
      (row) => row.key === 'custom:enjoo',
    );

    expect(created?.source).toBe('user');
  });

  it('adds unknown remote symptoms without touching the seeded ones', async () => {
    const db = await setup();

    await insertMissingRemoteSymptoms(
      asDatabase(db),
      [
        {
          description: 'texto do servidor',
          isAlertCandidate: true,
          key: 'colica',
          name: 'Cólica',
        },
        {
          description: 'Nova queixa.',
          isAlertCandidate: false,
          key: 'nausea',
          name: 'Náusea',
        },
      ],
      'Outros',
    );

    const rows = await listCatalog(asDatabase(db));
    const colica = rows.find((row) => row.key === 'colica');
    const nausea = rows.find((row) => row.key === 'nausea');

    // The seeded copy is richer than anything GET /symptoms can send, so a
    // refresh must never overwrite it.
    expect(colica?.category).toBe('Menstruação');
    expect(colica?.is_alert_candidate).toBe(0);
    expect(nausea?.category).toBe('Outros');
    expect(nausea?.source).toBe('remote');
  });
});
