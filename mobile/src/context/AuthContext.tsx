import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LoginCredentials, RegisterPayload } from '../api/authApi';
import {
  clearSession,
  login as loginWithBackend,
  register as registerWithBackend,
  restoreSession,
  type AuthSession,
} from '../services/authService';

type AuthContextValue = {
  session: AuthSession | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    restoreSession().then((result) => {
      if (!mounted) {
        return;
      }

      if (result.ok) {
        setSession(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }

      setInitializing(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    const result = await loginWithBackend(credentials);

    setLoading(false);

    if (!result.ok) {
      setError(result.error.message);
      return false;
    }

    setSession(result.data);
    return true;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);

    const result = await registerWithBackend(payload);

    setLoading(false);

    if (!result.ok) {
      setError(result.error.message);
      return false;
    }

    setSession(result.data);
    return true;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await clearSession();
    setSession(null);
    setError(null);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      clearError: () => setError(null),
      error,
      initializing,
      loading,
      login,
      logout,
      register,
      session,
    }),
    [error, initializing, loading, login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }

  return context;
}
