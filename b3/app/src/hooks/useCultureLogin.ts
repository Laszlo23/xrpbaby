import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";

import { BRAVE_WALLET_CONNECT_OPTIONS } from "@bc/culture-auth";
import {
  detectAuthSurfaceEnv,
  type AuthSurfaceEnv,
} from "@/lib/auth-surface-env";
import {
  loginMethodsForSurface,
  primaryLoginLabel,
  type CultureLoginPreference,
} from "@/lib/culture-login";

const DEFAULT_SURFACE: AuthSurfaceEnv = { kind: "browser", label: "Browser" };

/** Shared Privy login helpers — email-first in browser, Farcaster-first in Mini App. */
export function useCultureLogin() {
  const { ready, authenticated, login, connectWallet } = usePrivy();
  const [authSurface, setAuthSurface] = useState<AuthSurfaceEnv>(DEFAULT_SURFACE);
  const [surfaceReady, setSurfaceReady] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void detectAuthSurfaceEnv()
      .then((env) => {
        if (!cancelled) setAuthSurface(env);
      })
      .catch(() => {
        if (!cancelled) setAuthSurface(DEFAULT_SURFACE);
      })
      .finally(() => {
        if (!cancelled) setSurfaceReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openLogin = useCallback(
    (preference: CultureLoginPreference = "default") => {
      if (preference === "default") {
        login();
        return;
      }
      login({
        loginMethods: loginMethodsForSurface(authSurface.kind, preference),
      });
    },
    [login, authSurface.kind],
  );

  const openEmailLogin = useCallback(() => openLogin("email"), [openLogin]);
  const openFarcasterLogin = useCallback(() => openLogin("farcaster"), [openLogin]);
  const openWalletLogin = useCallback(() => connectWallet(), [connectWallet]);
  const openBraveWalletLogin = useCallback(
    () => connectWallet(BRAVE_WALLET_CONNECT_OPTIONS),
    [connectWallet],
  );
  const openPreferredLogin = useCallback(() => openLogin("default"), [openLogin]);

  return {
    ready,
    authenticated,
    authSurface,
    surfaceReady,
    primaryLoginLabel: primaryLoginLabel(authSurface.kind),
    openLogin,
    openEmailLogin,
    openFarcasterLogin,
    openWalletLogin,
    openBraveWalletLogin,
    openPreferredLogin,
    connectWallet,
  };
}
