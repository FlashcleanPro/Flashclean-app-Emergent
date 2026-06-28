import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { api, getToken, setToken, User } from "@/src/lib/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogleSession: (sessionId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const tok = await getToken();
    if (!tok) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      await setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = async (email: string, password: string) => {
    const resp = await api.login(email, password);
    await setToken(resp.access_token);
    setUser(resp.user);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const resp = await api.register(email, password, fullName);
    await setToken(resp.access_token);
    setUser(resp.user);
  };

  const signInWithGoogleSession = async (sessionId: string) => {
    const resp = await api.googleSession(sessionId);
    await setToken(resp.access_token);
    setUser(resp.user);
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {}
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogleSession,
        signOut,
        refresh: bootstrap,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
