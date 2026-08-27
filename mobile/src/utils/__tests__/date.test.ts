import { addDaysIso, daysBetween, formatBrDate, toIsoDate, todayIso } from '../date';

describe('toIsoDate', () => {
  it('uses the local calendar day, not UTC', () => {
    // 23:30 local on the 26th. Going through `toISOString` in any timezone
    // behind UTC reported the 27th, so "registrei hoje" landed on tomorrow.
    const evening = new Date(2026, 7, 26, 23, 30);

    expect(toIsoDate(evening)).toBe('2026-08-26');
  });

  it('pads single-digit months and days', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('agrees with todayIso', () => {
    expect(todayIso()).toBe(toIsoDate(new Date()));
  });
});

describe('addDaysIso', () => {
  it('crosses a month boundary', () => {
    expect(addDaysIso('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('goes backwards', () => {
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('returns an empty string for a malformed date', () => {
    expect(addDaysIso('26/08/2026', 1)).toBe('');
  });
});

describe('daysBetween', () => {
  it('counts whole days', () => {
    expect(daysBetween('2026-08-01', '2026-08-29')).toBe(28);
  });
});

describe('formatBrDate', () => {
  it('renders an ISO date for the masked inputs', () => {
    expect(formatBrDate('2026-08-26')).toBe('26/08/2026');
  });
});
