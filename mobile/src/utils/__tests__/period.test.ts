import type { CycleRecord } from '../cycle';
import { planPeriodSync, validatePeriod } from '../period';

const today = '2026-08-26';

function period(id: number, start: string, end: string | null): CycleRecord {
  return { end_date: end, id, start_date: start };
}

describe('validatePeriod', () => {
  const existing = [period(1, '2026-07-01', '2026-07-05')];

  it('accepts a well-formed past period', () => {
    expect(
      validatePeriod(
        { endDate: '2026-08-05', id: null, startDate: '2026-08-01' },
        existing,
        today,
      ),
    ).toBeNull();
  });

  it('rejects an end before the start', () => {
    expect(
      validatePeriod(
        { endDate: '2026-07-31', id: null, startDate: '2026-08-01' },
        existing,
        today,
      )?.code,
    ).toBe('END_BEFORE_START');
  });

  it('rejects a start in the future', () => {
    expect(
      validatePeriod(
        { endDate: null, id: null, startDate: '2026-09-01' },
        existing,
        today,
      )?.code,
    ).toBe('FUTURE_START');
  });

  it('rejects a period older than the supported history', () => {
    expect(
      validatePeriod(
        { endDate: '2020-01-05', id: null, startDate: '2020-01-01' },
        existing,
        today,
      )?.code,
    ).toBe('TOO_OLD');
  });

  it('rejects a range overlapping a recorded period', () => {
    expect(
      validatePeriod(
        { endDate: '2026-07-06', id: null, startDate: '2026-07-03' },
        existing,
        today,
      )?.code,
    ).toBe('OVERLAP');
  });

  it('rejects a second period a few days after another', () => {
    expect(
      validatePeriod(
        { endDate: '2026-07-10', id: null, startDate: '2026-07-08' },
        existing,
        today,
      )?.code,
    ).toBe('TOO_CLOSE');
  });

  it('allows only the most recent period to stay open', () => {
    expect(
      validatePeriod(
        { endDate: null, id: null, startDate: '2026-06-01' },
        existing,
        today,
      )?.code,
    ).toBe('ONGOING_NOT_LAST');
  });

  it('lets a period be edited without clashing with itself', () => {
    expect(
      validatePeriod(
        { endDate: '2026-07-06', id: 1, startDate: '2026-07-01' },
        existing,
        today,
      ),
    ).toBeNull();
  });
});

describe('planPeriodSync', () => {
  const periods = [period(1, '2026-08-10', '2026-08-14')];

  it('does nothing for a bleeding day already inside a period', () => {
    expect(
      planPeriodSync({ date: '2026-08-12', flow: 'moderado', periods, today }).type,
    ).toBe('none');
  });

  it('extends a period when the day follows its end', () => {
    const action = planPeriodSync({
      date: '2026-08-15',
      flow: 'leve',
      periods,
      today,
    });

    expect(action).toEqual({
      endDate: '2026-08-15',
      id: 1,
      startDate: '2026-08-10',
      type: 'range',
    });
  });

  it('creates a period for an isolated bleeding day', () => {
    const action = planPeriodSync({
      date: '2026-08-20',
      flow: 'intenso',
      periods,
      today,
    });

    expect(action).toEqual({
      endDate: '2026-08-20',
      startDate: '2026-08-20',
      type: 'create',
    });
  });

  it('treats escape as not menstruating', () => {
    expect(
      planPeriodSync({ date: '2026-08-20', flow: 'escape', periods, today }).type,
    ).toBe('none');
  });

  it('merges two rows when a day bridges them', () => {
    const split = [
      period(1, '2026-08-10', '2026-08-12'),
      period(2, '2026-08-14', '2026-08-16'),
    ];
    const action = planPeriodSync({
      date: '2026-08-13',
      flow: 'leve',
      periods: split,
      today,
    });

    expect(action).toEqual({
      endDate: '2026-08-16',
      keepId: 1,
      removeId: 2,
      startDate: '2026-08-10',
      type: 'merge',
    });
  });

  it('shrinks a period when its last day stops bleeding', () => {
    const action = planPeriodSync({
      date: '2026-08-14',
      flow: null,
      periods,
      today,
    });

    expect(action).toEqual({
      endDate: '2026-08-13',
      id: 1,
      startDate: '2026-08-10',
      type: 'range',
    });
  });

  it('leaves a light day in the middle alone', () => {
    expect(
      planPeriodSync({ date: '2026-08-12', flow: null, periods, today }).type,
    ).toBe('none');
  });

  it('deletes a one-day period when its flow is cleared', () => {
    const action = planPeriodSync({
      date: '2026-08-20',
      flow: null,
      periods: [period(9, '2026-08-20', '2026-08-20')],
      today,
    });

    expect(action).toEqual({ id: 9, type: 'delete' });
  });
});
