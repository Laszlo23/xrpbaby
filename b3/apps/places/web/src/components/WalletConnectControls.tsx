"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { PrivyConnectButton } from "@/components/PrivyConnectButton";
import { PrivyExternalWalletButton } from "@/components/PrivyExternalWalletButton";
import { privyEnabled } from "@/lib/privy-env";
import { useHydrated } from "@/lib/use-hydrated";

function ConnectedBar({ address }: { address: `0x${string}` }) {
  const { disconnect } = useDisconnect();

  if (!privyEnabled) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[140px] truncate font-mono text-[11px] text-zinc-500 sm:inline">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-eco/40 hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return <ConnectedBarWithPrivy address={address} />;
}

function ConnectedBarWithPrivy({ address }: { address: `0x${string}` }) {
  const { authenticated, logout } = usePrivy();
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    try {
      if (authenticated) await logout();
    } finally {
      disconnect();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[140px] truncate font-mono text-[11px] text-zinc-500 sm:inline">
        {address.slice(0, 6)}…{address.slice(-4)}
      </span>
      <button
        type="button"
        onClick={() => void handleDisconnect()}
        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-eco/40 hover:text-white"
      >
        Disconnect
      </button>
    </div>
  );
}

export function WalletConnectControls() {
  const hydrated = useHydrated();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!hydrated) {
    return (
      <div
        className="h-9 min-w-[120px] shrink-0 rounded-full bg-white/[0.04] sm:min-w-[200px]"
        aria-hidden
      />
    );
  }

  if (isConnected && address) {
    return <ConnectedBar address={address} />;
  }

  const busy = isPending;

  return (
    <div className="relative flex flex-wrap items-center justify-end gap-2">
      {privyEnabled && (
        <>
          <PrivyConnectButton busy={busy} />
          <PrivyExternalWalletButton busy={busy} />
        </>
      )}
      {!privyEnabled && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            reset();
            const injectedConnector = connectors.find((c) => c.id === "injected");
            if (injectedConnector) connect({ connector: injectedConnector });
          }}
          className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-200 hover:border-eco/40 disabled:opacity-50"
        >
          {busy ? "…" : "Browser"}
        </button>
      )}
      {connectors.some((c) => c.id === "walletConnect") && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            reset();
            const wc = connectors.find((c) => c.id === "walletConnect");
            if (wc) connect({ connector: wc });
          }}
          className={
            privyEnabled
              ? "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-200 hover:border-eco/40 disabled:opacity-50"
              : "rounded-full bg-action px-3 py-1.5 text-xs font-semibold text-[#0A0A0A] shadow-[0_0_16px_-2px_rgba(255,122,24,0.45)] hover:bg-action-light disabled:opacity-50"
          }
        >
          {busy ? "…" : "WalletConnect"}
        </button>
      )}
      <button
        type="button"
        className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
      >
        All wallets
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
          <p className="px-2 pb-1 text-[10px] uppercase tracking-wide text-zinc-500">Connect with</p>
          {connectors.length === 0 && privyEnabled && (
            <p className="px-2 py-2 text-xs leading-snug text-zinc-400">
              Use <span className="text-zinc-300">Connect</span> or{" "}
              <span className="text-zinc-300">Wallets</span> — Privy registers extension wallets after you pick them in the modal.
            </p>
          )}
          {connectors.map((c) => (
            <button
              key={c.uid}
              type="button"
              disabled={busy}
              onClick={() => {
                reset();
                connect({ connector: c });
                setMenuOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      {error && (
        <span className="max-w-[200px] truncate text-[10px] text-red-400" title={error.message}>
          {error.message}
        </span>
      )}
    </div>
  );
}
