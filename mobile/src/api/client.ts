import { Platform } from 'react-native';

import { getAuthToken } from './authToken';
import { fail, ok, type ApiResult } from './types';

const defaultApiBaseUrl = Platform.select({
  android: 'http://10.0.2.2:8000/api/v1/mobile',
  ios: 'http://localhost:8000/api/v1/mobile',
  default: 'http://localhost:8000/api/v1/mobile',
});

export const mobileApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? defaultApiBaseUrl;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  query?: Record<string, string | number | undefined>;
  /** Defaults to the signed-in user's token; pass `null` to send none. */
  token?: string | null;
};

type LaravelErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const token = 'token' in options ? options.token : getAuthToken();
  const url = `${mobileApiBaseUrl}${path.startsWith('/') ? path : `/${path}`}${buildQueryString(options.query)}`;

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = (await response.json().catch(() => null)) as
      | LaravelErrorPayload
      | T
      | null;

    if (!response.ok) {
      const errorPayload = isObject(payload) ? payload : null;
      const validationMessage =
        errorPayload &&
        'errors' in errorPayload &&
        errorPayload.errors &&
        Object.values(errorPayload.errors)[0]?.[0];
      const message =
        validationMessage ||
        (errorPayload && 'message' in errorPayload && errorPayload.message) ||
        'Nao foi possivel concluir a solicitacao.';

      return fail(`HTTP_${response.status}`, message, response.status < 500);
    }

    return ok(payload as T);
  } catch {
    return fail(
      'NETWORK_ERROR',
      'Nao foi possivel conectar ao servidor. Verifique a internet e tente novamente.',
    );
  }
}

function buildQueryString(query: RequestOptions['query']) {
  if (!query) {
    return '';
  }

  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== '',
  );

  if (entries.length === 0) {
    return '';
  }

  const search = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `?${search}`;
}

function isObject(value: unknown): value is LaravelErrorPayload {
  return typeof value === 'object' && value !== null;
}
