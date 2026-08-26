export type ApiError = {
  code: string;
  message: string;
  recoverable: boolean;
};

export type ApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ApiError;
    };

export function ok<T>(data: T): ApiResult<T> {
  return {
    ok: true,
    data,
  };
}

export function fail(
  code: string,
  message: string,
  recoverable = true,
): ApiResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      recoverable,
    },
  };
}

export const fullAccessRequiredMessage =
  'Aceite os termos de uso e a politica de privacidade para registrar ciclos e sintomas.';

/**
 * Cycles and symptom records need a `mobile:full` token; the backend answers a
 * restricted one with a bare "Invalid ability provided.", which means nothing
 * to the user.
 */
export function withFullAccessMessage<T>(result: ApiResult<T>): ApiResult<T> {
  if (!result.ok && result.error.code === 'HTTP_403') {
    return fail(result.error.code, fullAccessRequiredMessage);
  }

  return result;
}
