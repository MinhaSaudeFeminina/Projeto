import { ok, type ApiResult } from '../api/types';
import {
  healthTips,
  mockPeriods,
  mockSymptoms,
  mockUser,
  type PeriodRange,
  type SymptomEntry,
  type UserProfile,
} from '../data/mockData';
import {
  getCalendarDayStatus,
  getCycleDay,
  getCyclePhase,
  getDaysUntilNextPeriod,
  getFertileWindowDates,
  getOvulationDate,
  getPredictedPeriodDates,
  type CalendarDayStatus,
  type CyclePhase,
} from '../utils/cycle';
import { formatLongDate, toIsoDate } from '../utils/date';

export type CycleSummary = {
  user: UserProfile;
  cycleDay: number;
  phase: CyclePhase;
  daysUntilNextPeriod: number;
  nextPeriodDates: string[];
  fertileWindowDates: string[];
  ovulationDate: string | null;
  healthTip: string;
};

export type CalendarDay = {
  date: string;
  label: string;
  status: CalendarDayStatus;
  symptoms: SymptomEntry[];
};

export function getCycleSummary(referenceDate = new Date()): ApiResult<CycleSummary> {
  const cycleDay = getCycleDay(mockUser, referenceDate);
  const ovulationDate = getOvulationDate(mockUser);
  const tipIndex = referenceDate.getDate() % healthTips.length;

  return ok({
    user: mockUser,
    cycleDay,
    phase: getCyclePhase(cycleDay),
    daysUntilNextPeriod: getDaysUntilNextPeriod(mockUser, referenceDate),
    nextPeriodDates: getPredictedPeriodDates(mockUser),
    fertileWindowDates: getFertileWindowDates(mockUser),
    ovulationDate: ovulationDate ? toIsoDate(ovulationDate) : null,
    healthTip: healthTips[tipIndex],
  });
}

export function getPeriods(): ApiResult<PeriodRange[]> {
  return ok(mockPeriods);
}

export function getMonthCalendarDays(
  monthDate = new Date(),
): ApiResult<CalendarDay[]> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = toIsoDate(new Date(year, month, index + 1));
    const symptoms = mockSymptoms.filter((symptom) => symptom.date === date);

    return {
      date,
      label: formatLongDate(date),
      status: getCalendarDayStatus({
        date,
        periods: mockPeriods,
        symptoms: mockSymptoms,
        user: mockUser,
      }),
      symptoms,
    };
  });

  return ok(days);
}
