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
