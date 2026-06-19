import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Route } from "@/routes/auth/login";
import { CultureBaseWalletButtons } from "@bc/culture-auth/react";
import { useCultureLogin } from "@/hooks/useCultureLogin";
import { shouldAutoOpenLoginModal } from "@/lib/culture-login";

/** Auth hub: Privy login then redirect back to satellite app. */
export function AuthLoginPage() {
  const navigate = useNavigate();
  const { returnUrl } = Route.useSearch();
  const autoOpened = useRef(false);
  const {
    ready,
    authenticated,
    authSurface,
    surfaceReady,
    primaryLoginLabel,
    openEmailLogin,
    openFarcasterLogin,
    openWalletLogin,
    openPreferredLogin,
  } = useCultureLogin();

  useEffect(() => {
    if (!ready || !surfaceReady) return;

    if (authenticated) {
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        void navigate({ to: "/wallet" });
      }
      return;
    }

    if (autoOpened.current) return;
    if (!shouldAutoOpenLoginModal(authSurface.kind)) return;

    autoOpened.current = true;
    openPreferredLogin();
  }, [
    ready,
    surfaceReady,
    authenticated,
    returnUrl,
    navigate,
    authSurface.kind,
    openPreferredLogin,
  ]);

  if (!ready || !surfaceReady) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-zinc-400">Loading sign-in…</p>
      </main>
    );
  }

  if (authenticated) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-zinc-400">Signed in — redirecting…</p>
      </main>
    );
  }

  const inFarcaster = authSurface.kind === "farcaster";

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-center shadow-xl">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5FF41]">
          Culture wallet
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {inFarcaster
            ? "Use your Farcaster account or pick another path below."
            : "Email is fastest in the browser — or connect a wallet on Base."}
        </p>
        <p className="mt-3 inline-flex rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-zinc-300">
          {authSurface.label}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {inFarcaster ? (
            <button
              type="button"
              onClick={openFarcasterLogin}
              className="w-full rounded-full border border-violet-400/35 bg-violet-500/15 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25"
            >
              Continue with Farcaster
            </button>
          ) : (
            <button
              type="button"
              onClick={openEmailLogin}
              className="w-full rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/15 px-4 py-3 text-sm font-semibold text-[#C5FF41] transition hover:bg-[#C5FF41]/25"
            >
              {primaryLoginLabel}
            </button>
          )}

          <CultureBaseWalletButtons
            compactInBaseApp={authSurface.kind === "baseapp"}
            onConnectStart={openWalletLogin}
            className="w-full"
            buttonClassName={(label) =>
              [
                "w-full rounded-full border px-4 py-3 text-sm font-semibold transition disabled:opacity-50",
                label === "Base Account"
                  ? "border-[var(--base-blue,#0052FF)]/50 bg-[var(--base-blue,#0052FF)]/15 text-white hover:bg-[var(--base-blue,#0052FF)]/25"
                  : "border-white/15 bg-black/30 text-zinc-100 hover:border-white/25",
              ].join(" ")
            }
          />

          <button
            type="button"
            onClick={openWalletLogin}
            className="w-full rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            More wallets (MetaMask, WalletConnect…)
          </button>

          {inFarcaster ? (
            <button
              type="button"
              onClick={openEmailLogin}
              className="w-full rounded-full border border-white/10 px-4 py-2.5 text-xs text-zinc-400 transition hover:text-zinc-200"
            >
              Use email or Google instead
            </button>
          ) : (
            <button
              type="button"
              onClick={openFarcasterLogin}
              className="w-full rounded-full border border-white/10 px-4 py-2.5 text-xs text-zinc-400 transition hover:text-zinc-200"
            >
              Sign in with Farcaster
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
