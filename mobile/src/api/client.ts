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

      return fail(
        `HTTP_${response.status}`,
        errorMessage(response.status, errorPayload),
        response.status < 500,
      );
    }

    return ok(payload as T);
  } catch {
    return fail(
      'NETWORK_ERROR',
      'Não foi possível conectar ao servidor. Verifique a internet e tente novamente.',
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

const genericError = 'Não foi possível concluir a solicitação. Tente novamente em instantes.';
const serverError = 'Ocorreu um erro inesperado no servidor. Tente novamente em instantes.';

// Text that reads like an exception or a framework default must never reach
// the screen; the user gets a generic sentence instead.
const technicalText =
  /SQLSTATE|Exception|\\|::|\.php|Unauthenticated\.|This action is unauthorized|The route|No query results|Too Many Attempts|Server Error|field is required|field must/i;

function errorMessage(status: number, payload: LaravelErrorPayload | null) {
  if (status >= 500) {
    return serverError;
  }

  const firstFieldError = Object.values(payload?.errors ?? {}).flat()[0];

  for (const candidate of [firstFieldError, payload?.message]) {
    if (typeof candidate === 'string' && candidate.trim() !== '' && !technicalText.test(candidate)) {
      return candidate;
    }
  }

  return genericError;
}

function isObject(value: unknown): value is LaravelErrorPayload {
  return typeof value === 'object' && value !== null;
}
