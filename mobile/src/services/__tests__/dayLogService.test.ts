import type { ApiResult } from '../../api/types';
import { createTestDatabase } from '../../db/__tests__/sqliteAdapter';
import { migrate } from '../../db/migrations';
import { listPeriods } from '../../db/periodsRepository';
import { savePeriod } from '../cycleService';
import {
  deleteDayLogForDate,
  getDayLogDetail,
  saveDayLog,
} from '../dayLogService';

type TestDatabase = ReturnType<typeof createTestDatabase>;

let mockDatabase: TestDatabase;
let mockCurrentUser: { accessState: string; id: number } | null = null;

jest.mock('../../db/database', () => ({
  getDatabase: () => Promise.resolve(mockDatabase),
}));

jest.mock('../../db/currentUser', () => ({
  getCurrentUser: () => mockCurrentUser,
  setCurrentUser: () => {},
}));

// The catalog comes from the API-aware service; the flows under test only need
// its shape, not a network call.
jest.mock('../symptomsService', () => ({
  getSymptomCatalog: () =>
    Promise.resolve({
      data: [
        {
          askIntensity: true,
          category: 'Menstruação',
          isAlertCandidate: false,
          isCustom: false,
          key: 'colica',
          name: 'Cólica',
          severityAlertText: 'Procure avaliacao profissional.',
          shortDescription: null,
        },
      ],
      ok: true,
    }),
  getSymptomGuidance: (
    symptom: { isAlertCandidate: boolean; severityAlertText: string | null },
    intensity: string | null,
  ) =>
    symptom.isAlertCandidate || intensity === 'intenso'
      ? symptom.severityAlertText
      : null,
}));

const catalog = [
  {
    askIntensity: true,
    category: 'Menstruação',
    isAlertCandidate: false,
    isCustom: false,
    key: 'colica',
    name: 'Cólica',
    severityAlertText: 'Procure avaliacao profissional.',
    shortDescription: null,
  },
];

const today = new Date();
const iso = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);

  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
};

/** Narrows `ApiResult` and fails the test with the real reason when it cannot. */
function expectOk<T>(result: ApiResult<T>) {
  if (!result.ok) {
    throw new Error(`Esperava sucesso, veio ${result.error.code}`);
  }

  return result.data;
}

function expectFail<T>(result: ApiResult<T>) {
  if (result.ok) {
    throw new Error('Esperava falha, veio sucesso');
  }

  return result.error;
}

beforeEach(async () => {
  mockDatabase = createTestDatabase();
  mockCurrentUser = { accessState: 'full', id: 7 };
  await mockDatabase.execAsync('PRAGMA foreign_keys = ON;');
  await migrate(mockDatabase as never);
});

describe('saveDayLog', () => {
  it('opens a menstruation when an isolated day gets bleeding flow', async () => {
    const result = await saveDayLog(
      {
        date: iso(-3),
        flow: 'moderado',
        mood: null,
        notes: '',
        symptoms: [],
      },
      catalog,
    );

    expect(expectOk(result).periodNote).toContain('Menstruacao registrada');

    const periods = await listPeriods(mockDatabase as never, 7);
    expect(periods).toHaveLength(1);
    expect(periods[0].start_date).toBe(iso(-3));
  });

  it('extends the menstruation when the next day also bleeds', async () => {
    await saveDayLog(
      { date: iso(-3), flow: 'moderado', mood: null, notes: '', symptoms: [] },
      catalog,
    );
    await saveDayLog(
      { date: iso(-2), flow: 'leve', mood: null, notes: '', symptoms: [] },
      catalog,
    );

    const periods = await listPeriods(mockDatabase as never, 7);

    expect(periods).toHaveLength(1);
    expect(periods[0].end_date).toBe(iso(-2));
  });

  it('leaves the menstruation alone for an escape day', async () => {
    await saveDayLog(
      { date: iso(-3), flow: 'escape', mood: null, notes: '', symptoms: [] },
      catalog,
    );

    expect(await listPeriods(mockDatabase as never, 7)).toHaveLength(0);
  });

  it('returns the symptom guidance when a symptom is intense', async () => {
    const result = await saveDayLog(
      {
        date: iso(-1),
        flow: null,
        mood: null,
        notes: '',
        symptoms: [{ intensity: 'intenso', key: 'colica' }],
      },
      catalog,
    );

    expect(expectOk(result).guidance).toContain('avaliacao profissional');
  });

  it('refuses a day that has not happened yet', async () => {
    const result = await saveDayLog(
      { date: iso(3), flow: 'leve', mood: null, notes: '', symptoms: [] },
      catalog,
    );

    expect(expectFail(result).code).toBe('FUTURE_DAY');
  });

  it('reads back what it saved', async () => {
    await saveDayLog(
      {
        date: iso(-1),
        flow: 'leve',
        mood: 'bem',
        notes: '  cansada  ',
        symptoms: [{ intensity: 'leve', key: 'colica' }],
      },
      catalog,
    );

    const detail = expectOk(await getDayLogDetail(iso(-1)));

    expect(detail.draft.mood).toBe('bem');
    expect(detail.draft.notes).toBe('cansada');
    expect(detail.draft.symptoms).toEqual([{ intensity: 'leve', key: 'colica' }]);
    expect(detail.insidePeriod).toBe(true);
  });

  it('removes a one-day menstruation when its record is deleted', async () => {
    await saveDayLog(
      { date: iso(-3), flow: 'moderado', mood: null, notes: '', symptoms: [] },
      catalog,
    );
    await deleteDayLogForDate(iso(-3));

    expect(await listPeriods(mockDatabase as never, 7)).toHaveLength(0);
  });
});

describe('savePeriod', () => {
  it('refuses to write anything when the range overlaps', async () => {
    await savePeriod({ endDate: iso(-20), id: null, startDate: iso(-25) });
    const result = await savePeriod({
      endDate: iso(-19),
      id: null,
      startDate: iso(-22),
    });

    expect(expectFail(result).code).toBe('OVERLAP');
    expect(await listPeriods(mockDatabase as never, 7)).toHaveLength(1);
  });

  it('keeps cycle data behind accepting the terms', async () => {
    mockCurrentUser = { accessState: 'restricted', id: 7 };

    const result = await savePeriod({
      endDate: null,
      id: null,
      startDate: iso(-1),
    });

    expect(expectFail(result).code).toBe('FULL_ACCESS_REQUIRED');
  });
});
