const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(date: string) {
  if (!ISO_DATE_PATTERN.test(date)) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatShortDate(date: string | Date) {
  const parsedDate = typeof date === 'string' ? parseIsoDate(date) : date;

  if (!parsedDate) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(parsedDate);
}

export function formatLongDate(date: string | Date) {
  const parsedDate = typeof date === 'string' ? parseIsoDate(date) : date;

  if (!parsedDate) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}

export function daysBetween(startDate: string | Date, endDate: string | Date) {
  const start = typeof startDate === 'string' ? parseIsoDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseIsoDate(endDate) : endDate;

  if (!start || !end) {
    return 0;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay);
}

export function addDays(date: string | Date, days: number) {
  const parsedDate = typeof date === 'string' ? parseIsoDate(date) : date;

  if (!parsedDate) {
    return null;
  }

  const nextDate = new Date(parsedDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function isSameIsoDate(leftDate: string | Date, rightDate: string | Date) {
  const left = typeof leftDate === 'string' ? leftDate : toIsoDate(leftDate);
  const right = typeof rightDate === 'string' ? rightDate : toIsoDate(rightDate);

  return left === right;
}
