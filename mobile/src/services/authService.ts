import * as SecureStore from 'expo-secure-store';

import {
  loginMobileUser,
  type LoginCredentials,
  type LoginResponse,
  type MobileAccessState,
  type MobileUser,
} from '../api/authApi';
import { fail, ok, type ApiResult } from '../api/types';

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

  return persistLoginResponse(result.data);
}

export async function restoreSession(): Promise<ApiResult<AuthSession | null>> {
  try {
    const [token, userJson, accessState] = await Promise.all([
      SecureStore.getItemAsync(tokenStorageKey),
      SecureStore.getItemAsync(userStorageKey),
      SecureStore.getItemAsync(accessStateStorageKey),
    ]);

    if (!token || !userJson || !accessState) {
      return ok(null);
    }

    return ok({
      accessState: accessState as MobileAccessState,
      token,
      user: JSON.parse(userJson) as MobileUser,
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
  await Promise.all([
    SecureStore.deleteItemAsync(tokenStorageKey),
    SecureStore.deleteItemAsync(userStorageKey),
    SecureStore.deleteItemAsync(accessStateStorageKey),
  ]);
}

async function persistLoginResponse(
  response: LoginResponse,
): Promise<ApiResult<AuthSession>> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(tokenStorageKey, response.token),
      SecureStore.setItemAsync(userStorageKey, JSON.stringify(response.user)),
      SecureStore.setItemAsync(accessStateStorageKey, response.access_state),
    ]);

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
