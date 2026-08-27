export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function includesNormalized(value: string, query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizeText(value).includes(normalizedQuery);
}

export function matchesAnyNormalized(values: string[], query: string) {
  return values.some((value) => includesNormalized(value, query));
}

export function isBlank(value: string) {
  return value.trim().length === 0;
}

/** Stable identifier for a symptom name, accent- and case-insensitive. */
export function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
