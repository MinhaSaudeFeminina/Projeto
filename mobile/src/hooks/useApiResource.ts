import { useCallback, useEffect, useState } from 'react';

import type { ApiResult } from '../api/types';

export type ApiResourceState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

/**
 * Runs an async `ApiResult` producer and exposes its loading/error/data state.
 * `deps` follows the useEffect convention: change them to refetch.
 */
export function useApiResource<T>(
  load: () => Promise<ApiResult<T>>,
  deps: unknown[] = [],
): ApiResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  // The caller passes a fresh closure on every render, so the effect keys off
  // `deps` instead of the function identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runLoad = useCallback(load, deps);

  useEffect(() => {
    let active = true;

    setLoading(true);

    runLoad().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [runLoad, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, error, loading, reload };
}
