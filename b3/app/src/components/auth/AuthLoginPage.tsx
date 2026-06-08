import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Route } from "@/routes/auth/login";
import { detectAuthSurfaceEnv, type AuthSurfaceEnv } from "@/lib/auth-surface-env";

/** Auth hub: Privy login then redirect back to satellite app. */
export function AuthLoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const navigate = useNavigate();
  const { returnUrl } = Route.useSearch();
  const started = useRef(false);
  const [authSurface, setAuthSurface] = useState<AuthSurfaceEnv>({
    kind: "browser",
    label: "Browser",
  });
  const [manualHint, setManualHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const env = await detectAuthSurfaceEnv();
      if (!cancelled) setAuthSurface(env);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (authenticated) {
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        void navigate({ to: "/wallet" });
      }
      return;
    }

    if (started.current) return;
    started.current = true;
    login({
      loginMethods:
        authSurface.kind === "farcaster"
          ? ["farcaster", "wallet", "email", "google", "apple"]
          : ["email", "google", "apple", "farcaster", "wallet"],
    });
    const timer = window.setTimeout(() => {
      setManualHint("Still loading? Try a different login path below.");
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [ready, authenticated, login, returnUrl, navigate, authSurface.kind]);

  const openFarcaster = () =>
    login({ loginMethods: ["farcaster", "wallet", "email", "google", "apple"] });
  const openEmail = () =>
    login({ loginMethods: ["email", "google", "apple", "farcaster", "wallet"] });
  const openWallet = () =>
    login({ loginMethods: ["wallet", "farcaster", "email", "google", "apple"] });

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm text-zinc-400">Signing in to your Culture wallet…</p>
      <p className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-zinc-300">
        {authSurface.label}
      </p>
      {manualHint ? <p className="text-xs text-zinc-500">{manualHint}</p> : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={openFarcaster}
          className="rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/20"
        >
          Farcaster
        </button>
        <button
          type="button"
          onClick={openEmail}
          className="rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/15 px-4 py-2 text-xs font-semibold text-[#C5FF41] transition hover:bg-[#C5FF41]/25"
        >
          Email
        </button>
        <button
          type="button"
          onClick={openWallet}
          className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-[var(--base-blue)]/40"
        >
          Wallet
        </button>
      </div>
    </main>
  );
}
