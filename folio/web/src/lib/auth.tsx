import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, getToken, setToken } from "./api";
import type { User } from "./types";
import { applyAppearance } from "./theme";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePrefs: (prefs: Partial<Pick<User, "locale" | "theme" | "palette">>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const adopt = useCallback((u: User) => {
    setUser(u);
    applyAppearance({ theme: u.theme, palette: u.palette });
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>("/auth/me")
      .then((r) => adopt(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [adopt]);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      setToken(r.token);
      adopt(r.user);
    },
    [adopt]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const r = await api.post<{ token: string; user: User }>("/auth/signup", { name, email, password });
      setToken(r.token);
      adopt(r.user);
    },
    [adopt]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  }, []);

  const updatePrefs = useCallback(
    async (prefs: Partial<Pick<User, "locale" | "theme" | "palette">>) => {
      // Optimistic appearance update, then persist.
      setUser((u) => (u ? { ...u, ...prefs } : u));
      applyAppearance(prefs);
      const r = await api.patch<{ user: User }>("/auth/me/prefs", prefs);
      setUser(r.user);
    },
    []
  );

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, updatePrefs }),
    [user, loading, login, signup, logout, updatePrefs]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
