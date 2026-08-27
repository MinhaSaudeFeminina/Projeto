import {
  loginMobileUser,
  registerMobileUser,
  type AuthResponse,
  type LoginCredentials,
  type MobileAccessState,
  type MobileUser,
  type RegisterPayload,
} from '../api/authApi';
import { setAuthToken } from '../api/authToken';
import { fail, ok, type ApiResult } from '../api/types';
import { setCurrentUser } from '../db/currentUser';
import { secureStorage } from './secureStorage';

const tokenStorageKey = 'mobile.auth.token';
const userStorageKey = 'mobile.auth.user';
const accessStateStorageKey = 'mobile.auth.accessState';

export type AuthSession = {
  token: string;
  accessState: MobileAccessState;
  user: MobileUser;
};

export async function login(
  credentials: LoginCredentials,
): Promise<ApiResult<AuthSession>> {
  const result = await loginMobileUser(credentials);

  if (!result.ok) {
    return result;
  }

  return persistAuthResponse(result.data);
}

export async function register(
  payload: RegisterPayload,
): Promise<ApiResult<AuthSession>> {
  const result = await registerMobileUser(payload);

  if (!result.ok) {
    return result;
  }

  return persistAuthResponse(result.data);
}

export async function restoreSession(): Promise<ApiResult<AuthSession | null>> {
  try {
    const [token, userJson, accessState] = await Promise.all([
      secureStorage.getItem(tokenStorageKey),
      secureStorage.getItem(userStorageKey),
      secureStorage.getItem(accessStateStorageKey),
    ]);

    if (!token || !userJson || !accessState) {
      return ok(null);
    }

    const user = JSON.parse(userJson) as MobileUser;

    setAuthToken(token);
    setCurrentUser({ accessState: accessState as MobileAccessState, id: user.id });

    return ok({
      accessState: accessState as MobileAccessState,
      token,
      user,
    });
  } catch {
    await clearSession();

    return fail(
      'SESSION_RESTORE_FAILED',
      'Nao foi possivel recuperar sua sessao. Entre novamente.',
    );
  }
}

export async function clearSession(): Promise<void> {
  setAuthToken(null);
  // The local cycle data stays: it is scoped by user id, so logging back in
  // restores it and another account on the same phone sees an empty calendar.
  setCurrentUser(null);

  await Promise.all([
    secureStorage.removeItem(tokenStorageKey),
    secureStorage.removeItem(userStorageKey),
    secureStorage.removeItem(accessStateStorageKey),
  ]);
}

async function persistAuthResponse(
  response: AuthResponse,
): Promise<ApiResult<AuthSession>> {
  try {
    await Promise.all([
      secureStorage.setItem(tokenStorageKey, response.token),
      secureStorage.setItem(userStorageKey, JSON.stringify(response.user)),
      secureStorage.setItem(accessStateStorageKey, response.access_state),
    ]);

    // Set before returning so the very next request already carries it, even
    // if React has not re-rendered with the new session yet.
    setAuthToken(response.token);
    setCurrentUser({
      accessState: response.access_state,
      id: response.user.id,
    });

    return ok({
      accessState: response.access_state,
      token: response.token,
      user: response.user,
    });
  } catch {
    return fail(
      'SESSION_STORAGE_FAILED',
      'Nao foi possivel salvar sua sessao neste dispositivo.',
    );
  }
}
