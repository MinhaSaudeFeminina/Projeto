import type { PeriodRange, SymptomEntry, UserProfile } from '../data/mockData';

import { addDays, daysBetween, parseIsoDate, toIsoDate } from './date';

export type CyclePhase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea';

export type CalendarDayStatus =
  | 'period'
  | 'predictedPeriod'
  | 'fertile'
  | 'ovulation'
  | 'symptom'
  | 'none';

export function getCycleDay(user: UserProfile, referenceDate = new Date()) {
  const lastPeriodDate = parseIsoDate(user.lastPeriodDate);

  if (!lastPeriodDate || user.cycleAverageDays <= 0) {
    return 1;
  }

  const elapsedDays = daysBetween(lastPeriodDate, referenceDate);
  const cycleOffset = ((elapsedDays % user.cycleAverageDays) + user.cycleAverageDays) %
    user.cycleAverageDays;

  return cycleOffset + 1;
}

export function getDaysUntilNextPeriod(
  user: UserProfile,
  referenceDate = new Date(),
) {
  const cycleDay = getCycleDay(user, referenceDate);
  return user.cycleAverageDays - cycleDay + 1;
}

export function getCyclePhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) {
    return 'menstrual';
  }

  if (cycleDay <= 13) {
    return 'folicular';
  }

  if (cycleDay <= 16) {
    return 'ovulatoria';
  }

  return 'lutea';
}

export function isDateInPeriod(date: string, period: PeriodRange) {
  const currentDate = parseIsoDate(date);
  const startDate = parseIsoDate(period.startDate);
  const endDate = parseIsoDate(period.endDate);

  if (!currentDate || !startDate || !endDate) {
    return false;
  }

  return currentDate >= startDate && currentDate <= endDate;
}

export function getPredictedPeriodDates(user: UserProfile) {
  const dates: string[] = [];
  const firstDate = addDays(user.lastPeriodDate, user.cycleAverageDays);

  if (!firstDate) {
    return dates;
  }

  for (let index = 0; index < user.periodAverageDays; index += 1) {
    const date = addDays(firstDate, index);

    if (date) {
      dates.push(toIsoDate(date));
    }
  }

  return dates;
}

export function getFertileWindowDates(user: UserProfile) {
  const dates: string[] = [];
  const ovulationDate = getOvulationDate(user);

  if (!ovulationDate) {
    return dates;
  }

  for (let offset = -5; offset <= 1; offset += 1) {
    const date = addDays(ovulationDate, offset);

    if (date) {
      dates.push(toIsoDate(date));
    }
  }

  return dates;
}

export function getOvulationDate(user: UserProfile) {
  return addDays(user.lastPeriodDate, user.cycleAverageDays - 14);
}

export function getCalendarDayStatus(params: {
  date: string;
  periods: PeriodRange[];
  symptoms: SymptomEntry[];
  user: UserProfile;
}): CalendarDayStatus {
  const { date, periods, symptoms, user } = params;

  if (periods.some((period) => isDateInPeriod(date, period))) {
    return 'period';
  }

  const ovulationDate = getOvulationDate(user);

  if (ovulationDate && date === toIsoDate(ovulationDate)) {
    return 'ovulation';
  }

  if (getFertileWindowDates(user).includes(date)) {
    return 'fertile';
  }

  if (getPredictedPeriodDates(user).includes(date)) {
    return 'predictedPeriod';
  }

  if (symptoms.some((symptom) => symptom.date === date)) {
    return 'symptom';
  }

  return 'none';
}
