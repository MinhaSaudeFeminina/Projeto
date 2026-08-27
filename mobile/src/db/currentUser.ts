import type { MobileAccessState } from '../api/authApi';

/**
 * Who the local rows belong to. Services are plain async functions, not hooks,
 * so they cannot read React context; this mirrors `src/api/authToken.ts`, which
 * solves the same problem for the bearer token.
 */
type CurrentUser = {
  id: number;
  accessState: MobileAccessState;
};

let currentUser: CurrentUser | null = null;

export function setCurrentUser(user: CurrentUser | null) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;
}
