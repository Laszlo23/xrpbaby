import { usePrivy } from "@privy-io/react-auth";
import { CultureBaseWalletButtons } from "@bc/culture-auth/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Connector } from "wagmi";
import { BcdWalletBadge } from "@/components/BcdWalletBadge";
import { WorldWalletSiweButton } from "@/components/WorldWalletSiweButton";
import { privyEnabled } from "@/lib/privy-env";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { detectAuthSurfaceEnv, type AuthSurfaceEnv } from "@/lib/auth-surface-env";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function connectorLabel(c: Connector): string {
  switch (c.id) {
    case "baseAccount":
      return "Base Account";
    case "metaMask":
      return "MetaMask";
    case "coinbaseWallet":
      return "Coinbase";
    case "walletConnect":
      return "WalletConnect";
    case "injected":
      return "Browser";
    case "worldApp":
      return "World App";
    default:
      return c.name ?? c.id;
  }
}

function PrivyWalletControls({ className = "" }: { className?: string }) {
  const { ready, authenticated, login, logout, connectWallet } = usePrivy();
  const address = usePrivyWalletAddress();
  const [authSurface, setAuthSurface] = useState<AuthSurfaceEnv>({
    kind: "browser",
    label: "Browser",
  });
  const [authPending, setAuthPending] = useState<null | "farcaster" | "email" | "wallet">(null);
  const [authHint, setAuthHint] = useState<string | null>(null);

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
    if (authenticated) {
      setAuthPending(null);
      setAuthHint(null);
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authPending) return;
    const timeout = window.setTimeout(() => {
      setAuthHint(
        "Login is taking longer than expected. Try Farcaster or wallet sign-in for a smoother flow.",
      );
    }, 12_000);
    return () => window.clearTimeout(timeout);
  }, [authPending]);

  const loginButtonLabel = useMemo(
    () => (authSurface.kind === "farcaster" ? "Continue with Farcaster" : "Sign in"),
    [authSurface.kind],
  );

  function openFarcasterLogin() {
    setAuthPending("farcaster");
    setAuthHint(null);
    login({ loginMethods: ["farcaster", "wallet", "email", "google", "apple"] });
  }

  function openEmailLogin() {
    setAuthPending("email");
    setAuthHint(null);
    login({ loginMethods: ["email", "google", "apple", "farcaster", "wallet"] });
  }

  function openWalletModal() {
    setAuthPending("wallet");
    setAuthHint(null);
    connectWallet();
  }

  function onBaseWalletPending() {
    setAuthPending("wallet");
    setAuthHint(null);
  }

  if (!ready) {
    return <p className={`font-mono text-[10px] text-zinc-500 ${className}`}>Loading wallet…</p>;
  }

  if (!authenticated) {
    return (
      <div className={`flex max-w-md flex-wrap items-center justify-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={authSurface.kind === "farcaster" ? openFarcasterLogin : openEmailLogin}
          className="rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/15 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C5FF41] transition hover:bg-[#C5FF41]/25 sm:text-[11px]"
        >
          {authPending === "farcaster" || authPending === "email" ? "Opening…" : loginButtonLabel}
        </button>
        <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-zinc-300">
          {authSurface.label}
        </span>
        {authSurface.kind === "farcaster" ? (
          <button
            type="button"
            onClick={openEmailLogin}
            className="rounded-full border border-white/15 bg-black/30 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-100 transition hover:border-[var(--base-blue)]/40 sm:text-[11px]"
          >
            {authPending === "email" ? "Opening…" : "Use email instead"}
          </button>
        ) : (
          <button
            type="button"
            onClick={openFarcasterLogin}
            className="rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-100 transition hover:bg-violet-500/20 sm:text-[11px]"
          >
            {authPending === "farcaster" ? "Opening…" : "Farcaster login"}
          </button>
        )}
        <CultureBaseWalletButtons
          busy={authPending === "wallet"}
          compactInBaseApp={authSurface.kind === "baseapp"}
          onConnectStart={onBaseWalletPending}
          className="w-full"
        />
        <button
          type="button"
          onClick={openWalletModal}
          className="rounded-full border border-white/10 bg-black/20 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200 sm:text-[11px]"
        >
          {authPending === "wallet" ? "Opening…" : "More wallets"}
        </button>
        {authHint ? (
          <p className="w-full text-center text-[11px] text-zinc-400">{authHint}</p>
        ) : null}
      </div>
    );
  }

  if (!address) {
    return <p className={`font-mono text-[10px] text-zinc-500 ${className}`}>Setting up wallet…</p>;
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <BcdWalletBadge />
      <Link
        to="/wallet"
        className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-zinc-200 backdrop-blur-md transition hover:border-[#C5FF41]/30"
      >
        {shortAddr(address)}
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
      >
        Out
      </button>
    </div>
  );
}

function LegacyWalletControls({ className = "" }: { className?: string }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending, variables } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) {
    const busy = isPending || isConnecting;
    const pendingConnector = variables?.connector;
    const pendingId =
      pendingConnector &&
      typeof pendingConnector === "object" &&
      "id" in pendingConnector &&
      typeof (pendingConnector as Connector).id === "string"
        ? (pendingConnector as Connector).id
        : undefined;

    return (
      <div className={`flex max-w-md flex-wrap items-center justify-center gap-2 ${className}`}>
        <CultureBaseWalletButtons mode="wagmi" busy={busy} />
        {connectors
          .filter((c) => c.id !== "baseAccount" && c.id !== "coinbaseWallet")
          .map((connector) => (
          <button
            key={connector.uid}
            type="button"
            disabled={busy}
            onClick={() => connect({ connector })}
            className="rounded-full border border-white/15 bg-black/30 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-100 shadow-[0_0_20px_-8px_rgb(0_82_255/50%)] backdrop-blur-md transition hover:border-[var(--base-blue)]/40 hover:bg-[var(--base-blue)]/15 active:scale-[0.98] disabled:opacity-50 sm:px-4 sm:text-[11px]"
          >
            {busy && pendingId === connector.id ? "Connecting…" : connectorLabel(connector)}
          </button>
        ))}
        <WorldWalletSiweButton />
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <BcdWalletBadge />
      <Link
        to="/wallet"
        className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-zinc-200 backdrop-blur-md transition hover:border-[#C5FF41]/30"
      >
        {shortAddr(address)}
      </Link>
      <button
        type="button"
        onClick={() => disconnect()}
        className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
      >
        Out
      </button>
    </div>
  );
}

export function WalletControls({ className = "" }: { className?: string }) {
  if (privyEnabled) {
    return <PrivyWalletControls className={className} />;
  }
  return <LegacyWalletControls className={className} />;
}
