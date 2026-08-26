import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ApiResult } from '../api/types';

export type ApiResourceState<T> = {
  data: T | null;
  error: string | null;
  /** True only while there is nothing to show yet. */
  loading: boolean;
  /** True while a reload runs with data already on screen. */
  refreshing: boolean;
  reload: () => void;
};

/**
 * Runs an async `ApiResult` producer and exposes its loading/error/data state.
 * `deps` follows the useEffect convention: change them to refetch.
 *
 * Refetches whenever the screen regains focus. React Navigation keeps screens
 * mounted, so a plain mount effect would leave a screen showing data captured
 * before the user changed it somewhere else.
 */
export function useApiResource<T>(
  load: () => Promise<ApiResult<T>>,
  deps: unknown[] = [],
): ApiResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const hasData = useRef(false);

  // The caller passes a fresh closure on every render, so the effect keys off
  // `deps` instead of the function identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runLoad = useCallback(load, deps);

  useEffect(() => {
    let active = true;

    // A refetch keeps the current data visible instead of flashing a spinner.
    if (hasData.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    runLoad().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        hasData.current = true;
        setData(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }

      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      active = false;
    };
  }, [runLoad, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const skipFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // The mount effect above already covers the first focus.
      if (skipFirstFocus.current) {
        skipFirstFocus.current = false;
        return;
      }

      reload();
    }, [reload]),
  );

  return { data, error, loading, refreshing, reload };
}
