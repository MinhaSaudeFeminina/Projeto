import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getProfile, type UserProfile } from '../services/profileService';
import { useAuthContext } from './AuthContext';

type AppContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setError(null);
      return;
    }

    let active = true;

    setLoading(true);

    getProfile().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setProfile(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [session, reloadToken]);

  const refreshProfile = useCallback(
    () => setReloadToken((token) => token + 1),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({ error, loading, profile, refreshProfile }),
    [error, loading, profile, refreshProfile],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
}
