const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type ApiClientOptions = {
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=UTF-8");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  }).catch(() => {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(errorMessage(response.status, payload));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const GENERIC_ERROR = "Não foi possível concluir a solicitação. Tente novamente em instantes.";
const SERVER_ERROR = "Ocorreu um erro inesperado no servidor. Tente novamente em instantes.";

// Text that reads like an exception, a stack trace or a framework default must
// never reach the screen; the user gets a generic sentence instead.
const TECHNICAL_TEXT = /SQLSTATE|Exception|\\|::|\.php|Unauthenticated\.|This action is unauthorized|The route|No query results|Too Many Attempts|Server Error|field is required|field must/i;

type ErrorPayload = {
  message?: unknown;
  errors?: Record<string, unknown>;
};

function errorMessage(status: number, payload: ErrorPayload | null): string {
  if (status >= 500) {
    return SERVER_ERROR;
  }

  const firstFieldError = Object.values(payload?.errors ?? {})
    .flat()
    .find((value): value is string => typeof value === "string");

  for (const candidate of [firstFieldError, payload?.message]) {
    if (typeof candidate === "string" && candidate.trim() !== "" && !TECHNICAL_TEXT.test(candidate)) {
      return candidate;
    }
  }

  return GENERIC_ERROR;
}
