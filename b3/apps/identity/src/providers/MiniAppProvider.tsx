"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { isMiniAppContext } from "@/lib/mini/host";

export type MiniAppUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

type MiniAppContextValue = {
  isMiniApp: boolean;
  isReady: boolean;
  user: MiniAppUser | null;
  quickAuthFetch: typeof fetch;
};

const MiniAppContext = createContext<MiniAppContextValue>({
  isMiniApp: false,
  isReady: true,
  user: null,
  quickAuthFetch: fetch,
});

export function useMiniApp() {
  return useContext(MiniAppContext);
}

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const isMiniApp = isMiniAppContext();
  const [isReady, setIsReady] = useState(!isMiniApp);
  const [user, setUser] = useState<MiniAppUser | null>(null);

  const bootstrap = useCallback(async () => {
    if (!isMiniApp) return;

    try {
      const inMiniApp = await sdk.isInMiniApp();
      if (!inMiniApp) {
        setIsReady(true);
        return;
      }

      const ctx = await sdk.context;
      if (ctx?.user?.fid) {
        setUser({
          fid: ctx.user.fid,
          username: ctx.user.username,
          displayName: ctx.user.displayName,
          pfpUrl: ctx.user.pfpUrl,
        });
      }

      await sdk.actions.ready();
    } catch (err) {
      console.warn("Mini app bootstrap:", err);
    } finally {
      setIsReady(true);
    }
  }, [isMiniApp]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const quickAuthFetch = useMemo(() => {
    if (!isMiniApp) return fetch;
    return (input: RequestInfo | URL, init?: RequestInit) =>
      sdk.quickAuth.fetch(input, init);
  }, [isMiniApp]);

  const value = useMemo(
    () => ({
      isMiniApp,
      isReady,
      user,
      quickAuthFetch,
    }),
    [isMiniApp, isReady, user, quickAuthFetch],
  );

  if (isMiniApp && !isReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-primary/30" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Culture Layer
          </p>
        </div>
      </div>
    );
  }

  return (
    <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>
  );
}
