import { fail, fullAccessRequiredMessage, ok } from '../api/types';
import { getCurrentUser } from '../db/currentUser';
import { DatabaseUnavailableError } from '../db/errors';

/**
 * Cycle data is local, but the reason the backend kept it behind
 * `ability:mobile:full` did not go away: it stays behind accepting the terms
 * and the privacy policy in force.
 */
export function requireUser(action: string) {
  const user = getCurrentUser();

  if (!user) {
    return fail('NOT_AUTHENTICATED', `Entre na sua conta para ${action}.`);
  }

  if (user.accessState !== 'full') {
    return fail('FULL_ACCESS_REQUIRED', fullAccessRequiredMessage);
  }

  return ok(user);
}

export function databaseFailure(error: unknown) {
  // The message the user sees is deliberately vague; the cause is not, and
  // swallowing it entirely makes a storage bug impossible to diagnose.
  if (__DEV__) {
    console.warn('[db]', error, (error as { cause?: unknown })?.cause);
  }

  if (error instanceof DatabaseUnavailableError) {
    if (error.reason === 'lockedByAnotherTab') {
      return fail(
        'DB_LOCKED',
        'Seus dados ja estao abertos em outra aba. Feche as outras abas e recarregue esta pagina.',
        false,
      );
    }

    if (error.reason === 'notIsolated') {
      return fail(
        'DB_NOT_ISOLATED',
        'O registro do ciclo funciona no aplicativo do celular. Neste navegador ele nao esta disponivel.',
        false,
      );
    }
  }

  return fail(
    'DB_UNAVAILABLE',
    'Nao foi possivel abrir seus dados neste aparelho.',
  );
}
