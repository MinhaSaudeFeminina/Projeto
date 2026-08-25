import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { UserProfile } from '../data/mockData';
import {
  getProfile,
  updatePreferences,
} from '../services/profileService';

type AppContextValue = {
  profile: UserProfile | null;
  error: string | null;
  setNotificationsEnabled: (value: boolean) => void;
  setDataSharingEnabled: (value: boolean) => void;
  refreshProfile: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const initialProfile = getProfile();
  const [profile, setProfile] = useState<UserProfile | null>(
    initialProfile.ok ? initialProfile.data : null,
  );
  const [error, setError] = useState<string | null>(
    initialProfile.ok ? null : initialProfile.error.message,
  );

  const refreshProfile = () => {
    const result = getProfile();

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setProfile(result.data);
    setError(null);
  };

  const updatePreference = (
    updates: Parameters<typeof updatePreferences>[0],
  ) => {
    const result = updatePreferences(updates);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setProfile(result.data);
    setError(null);
  };

  const value = useMemo<AppContextValue>(
    () => ({
      error,
      profile,
      refreshProfile,
      setDataSharingEnabled: (valueToSet) =>
        updatePreference({ dataSharingEnabled: valueToSet }),
      setNotificationsEnabled: (valueToSet) =>
        updatePreference({ notificationsEnabled: valueToSet }),
    }),
    [error, profile],
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
