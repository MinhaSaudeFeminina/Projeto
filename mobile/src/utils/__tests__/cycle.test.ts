import {
  buildCycleForecast,
  getCyclePhase,
  getCyclePosition,
  isDateInCycle,
  summarizeCycles,
  type CycleRecord,
} from '../cycle';

function period(id: number, start: string, end: string | null): CycleRecord {
  return { end_date: end, id, start_date: start };
}

describe('summarizeCycles', () => {
  it('reports no average from a single period', () => {
    const stats = summarizeCycles([period(1, '2026-08-01', '2026-08-05')]);

    expect(stats.averageCycleDays).toBeNull();
    expect(stats.averagePeriodDays).toBe(5);
    expect(stats.regularity).toBe('Sem dados');
  });

  it('averages the gap between consecutive starts', () => {
    const stats = summarizeCycles([
      period(1, '2026-06-01', '2026-06-05'),
      period(2, '2026-06-29', '2026-07-03'),
    ]);

    expect(stats.averageCycleDays).toBe(28);
    expect(stats.lastPeriodStart).toBe('2026-06-29');
  });

  it('ignores a gap left by untracked months', () => {
    // Backfilling one old period is exactly how a huge gap appears, and
    // folding it into the mean would wreck every prediction.
    const stats = summarizeCycles([
      period(1, '2026-01-05', '2026-01-09'),
      period(2, '2026-07-01', '2026-07-05'),
      period(3, '2026-07-29', '2026-08-02'),
    ]);

    expect(stats.averageCycleDays).toBe(28);
  });

  it('marks the newest period as ongoing when it has no end', () => {
    const stats = summarizeCycles([period(1, '2026-08-20', null)]);

    expect(stats.ongoing).toBe(true);
  });
});

describe('getCyclePosition', () => {
  const cycles = [
    period(1, '2026-06-01', '2026-06-05'),
    period(2, '2026-06-29', '2026-07-03'),
  ];
  const stats = summarizeCycles(cycles);

  it('counts the cycle day from the last period', () => {
    const position = getCyclePosition(stats, cycles, '2026-07-05');

    expect(position?.cycleDay).toBe(7);
    expect(position?.daysUntilNextPeriod).toBe(22);
    expect(position?.isLate).toBe(false);
  });

  it('reports a late period instead of wrapping around', () => {
    // Last start 2026-06-29 with a 28-day average puts the next period on
    // 2026-07-27, so 2026-08-03 is seven days late.
    const position = getCyclePosition(stats, cycles, '2026-08-03');

    expect(position?.isLate).toBe(true);
    expect(position?.lateDays).toBe(7);
  });

  it('is not late on the day the period is due', () => {
    const position = getCyclePosition(stats, cycles, '2026-07-27');

    expect(position?.daysUntilNextPeriod).toBe(0);
    expect(position?.isLate).toBe(false);
    expect(position?.lateDays).toBe(0);
  });

  it('turns late the day after it was due', () => {
    const position = getCyclePosition(stats, cycles, '2026-07-28');

    expect(position?.isLate).toBe(true);
    expect(position?.lateDays).toBe(1);
  });

  it('gives the day of the menstruation while it is happening', () => {
    const position = getCyclePosition(stats, cycles, '2026-07-01');

    expect(position?.periodDay).toBe(3);
  });

  it('predicts from a textbook cycle when there is only one period', () => {
    const single = [period(1, '2026-08-01', '2026-08-05')];
    const position = getCyclePosition(summarizeCycles(single), single, '2026-08-11');

    expect(position?.cycleDay).toBe(11);
    expect(position?.estimated).toBe(true);
  });

  it('gives up on a start date in the future', () => {
    const future = [period(1, '2027-01-01', null)];

    expect(getCyclePosition(summarizeCycles(future), future, '2026-08-26')).toBeNull();
  });
});

describe('getCyclePhase', () => {
  it('keeps the ovulation window aligned with a long cycle', () => {
    const stats = { ...summarizeCycles([]), averageCycleDays: 35, averagePeriodDays: 5 };

    expect(getCyclePhase(21, stats)).toBe('ovulatoria');
    expect(getCyclePhase(30, stats)).toBe('lutea');
  });
});

describe('isDateInCycle', () => {
  it('covers an ongoing period up to today', () => {
    const ongoing = period(1, '2026-08-24', null);

    expect(isDateInCycle('2026-08-25', ongoing, '2026-08-26')).toBe(true);
    expect(isDateInCycle('2026-08-27', ongoing, '2026-08-26')).toBe(false);
  });
});

describe('buildCycleForecast', () => {
  it('projects past the first predicted cycle', () => {
    const cycles = [
      period(1, '2026-06-01', '2026-06-05'),
      period(2, '2026-06-29', '2026-07-03'),
    ];
    const forecast = buildCycleForecast(
      summarizeCycles(cycles),
      '2026-09-01',
      '2026-09-30',
    );

    expect(forecast.periodDates).toContain('2026-09-21');
  });
});
