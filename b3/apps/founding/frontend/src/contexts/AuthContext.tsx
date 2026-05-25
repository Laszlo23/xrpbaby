import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiUser, clearToken, getToken, setToken } from "@/src/api/client";

type AuthState = {
  isLoading: boolean;
  user: ApiUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (b: { username: string; email: string; password: string; referral_code?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  linkFarcaster: (b: { fid: number; signer_uuid: string }) => Promise<void>;
  unlinkFarcaster: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: ApiUser | null) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<ApiUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
      await clearToken();
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { access_token } = await api.login({ email, password });
    await setToken(access_token);
    const me = await api.me();
    setUser(me);
    // fire and forget daily login
    api.claimDailyLogin().then((res) => res.awarded && setUser(res.user)).catch(() => {});
  }, []);

  const signUp = useCallback(async (b: { username: string; email: string; password: string; referral_code?: string }) => {
    const { access_token } = await api.register(b);
    await setToken(access_token);
    const me = await api.me();
    setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const linkFarcaster = useCallback(async (b: { fid: number; signer_uuid: string }) => {
    const updated = await api.linkFarcaster(b);
    setUser(updated);
  }, []);

  const unlinkFarcaster = useCallback(async () => {
    const updated = await api.unlinkFarcaster();
    setUser(updated);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ isLoading, user, signIn, signUp, signOut, linkFarcaster, unlinkFarcaster, refresh, setUser }),
    [isLoading, user, signIn, signUp, signOut, linkFarcaster, unlinkFarcaster, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
