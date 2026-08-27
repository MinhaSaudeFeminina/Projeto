export type DatabaseFailureReason =
  | 'unavailable'
  /** Web only: the page is not cross-origin isolated. */
  | 'notIsolated'
  /** Web only: another tab already holds the database file. */
  | 'lockedByAnotherTab';

/**
 * Lives apart from `database.ts` so the service layer can narrow on it without
 * pulling in `expo-sqlite`, which is a native module.
 */
export class DatabaseUnavailableError extends Error {
  constructor(readonly reason: DatabaseFailureReason, cause?: unknown) {
    super(`Database unavailable: ${reason}`);
    this.name = 'DatabaseUnavailableError';
    this.cause = cause;
  }
}

/** True for failures that only a page reload can clear. */
export function needsReload(reason: DatabaseFailureReason) {
  return reason === 'lockedByAnotherTab' || reason === 'notIsolated';
}
