import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authApi } from './api';
import { clearSession, loadSession, saveSession } from './sessionStore';
import type { AuthCredentials, AuthSession, RegistrationData } from './types';

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const stored = await loadSession();
        if (!stored) {
          return;
        }

        const accessExpiresAt = Date.parse(stored.accessTokenExpiresAtUtc);
        const shouldRefresh = Number.isNaN(accessExpiresAt) || accessExpiresAt <= Date.now() + 30_000;
        const activeSession = shouldRefresh
          ? await authApi.refresh(stored.refreshToken)
          : stored;

        await saveSession(activeSession);
        if (mounted) {
          setSession(activeSession);
        }
      } catch {
        await clearSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextSession: AuthSession) => {
    await saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    await persist(await authApi.login(credentials));
  }, [persist]);

  const register = useCallback(async (data: RegistrationData) => {
    await persist(await authApi.register(data));
  }, [persist]);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    await persist(await authApi.google(idToken));
  }, [persist]);

  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    setSession(null);
    await clearSession();

    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
  }, [session?.refreshToken]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isLoading,
    login,
    register,
    signInWithGoogle,
    logout,
  }), [isLoading, login, logout, register, session, signInWithGoogle]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
