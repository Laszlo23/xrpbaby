"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useConnect } from "wagmi";
import type { Connector } from "wagmi";
import {
  BASE_ACCOUNT_CONNECT_OPTIONS,
  COINBASE_WALLET_CONNECT_OPTIONS,
} from "./privy-wallet-integration.js";

type ButtonClassName = string | ((label: string) => string);

export type CultureBaseWalletButtonsProps = {
  busy?: boolean;
  className?: string;
  /** Privy modal (default) or direct wagmi connector buttons. */
  mode?: "privy" | "wagmi";
  buttonClassName?: ButtonClassName;
  /** In Base App / Coinbase in-app browser, emphasize a single Base entry point. */
  compactInBaseApp?: boolean;
  onConnectStart?: () => void;
};

function defaultButtonClass(label: string): string {
  const isBase = label === "Base Account";
  return [
    "rounded-full border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md transition active:scale-[0.98] disabled:opacity-50 sm:px-4 sm:text-[11px]",
    isBase
      ? "border-[var(--base-blue,#0052FF)]/50 bg-[var(--base-blue,#0052FF)]/15 text-white shadow-[0_0_20px_-8px_rgb(0_82_255/50%)] hover:bg-[var(--base-blue,#0052FF)]/25"
      : "border-white/15 bg-black/30 text-zinc-100 hover:border-[var(--base-blue,#0052FF)]/40 hover:bg-[var(--base-blue,#0052FF)]/10",
  ].join(" ");
}

function resolveClass(label: string, className?: ButtonClassName): string {
  if (!className) return defaultButtonClass(label);
  return typeof className === "function" ? className(label) : className;
}

function WagmiWalletButtons({
  busy,
  className,
  buttonClassName,
  compactInBaseApp,
  onConnectStart,
}: CultureBaseWalletButtonsProps) {
  const { connect, connectors, isPending, variables } = useConnect();
  const pendingId =
    variables?.connector &&
    typeof variables.connector === "object" &&
    "id" in variables.connector
      ? (variables.connector as Connector).id
      : undefined;
  const isBusy = busy || isPending;

  const baseConnector = connectors.find((c) => c.id === "baseAccount");
  const coinbaseConnector = connectors.find((c) => c.id === "coinbaseWallet");

  if (compactInBaseApp && baseConnector) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            onConnectStart?.();
            connect({ connector: baseConnector });
          }}
          className={resolveClass("Base Account", buttonClassName)}
        >
          {isBusy && pendingId === baseConnector.id ? "Connecting…" : "Continue with Base"}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ""}`}>
      {baseConnector ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            onConnectStart?.();
            connect({ connector: baseConnector });
          }}
          className={resolveClass("Base Account", buttonClassName)}
        >
          {isBusy && pendingId === baseConnector.id ? "Connecting…" : "Base Account"}
        </button>
      ) : null}
      {coinbaseConnector ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            onConnectStart?.();
            connect({ connector: coinbaseConnector });
          }}
          className={resolveClass("Coinbase Wallet", buttonClassName)}
        >
          {isBusy && pendingId === coinbaseConnector.id ? "Connecting…" : "Coinbase Wallet"}
        </button>
      ) : null}
    </div>
  );
}

function PrivyWalletButtons({
  busy,
  className,
  buttonClassName,
  compactInBaseApp,
  onConnectStart,
}: CultureBaseWalletButtonsProps) {
  const { connectWallet } = usePrivy();
  const disabled = Boolean(busy);

  if (compactInBaseApp) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onConnectStart?.();
            connectWallet(BASE_ACCOUNT_CONNECT_OPTIONS);
          }}
          className={resolveClass("Base Account", buttonClassName)}
        >
          {disabled ? "Opening…" : "Continue with Base"}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onConnectStart?.();
          connectWallet(BASE_ACCOUNT_CONNECT_OPTIONS);
        }}
        className={resolveClass("Base Account", buttonClassName)}
      >
        {disabled ? "Opening…" : "Base Account"}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onConnectStart?.();
          connectWallet(COINBASE_WALLET_CONNECT_OPTIONS);
        }}
        className={resolveClass("Coinbase Wallet", buttonClassName)}
      >
        {disabled ? "Opening…" : "Coinbase Wallet"}
      </button>
    </div>
  );
}

/** First-class Base Account + Coinbase Wallet entry points (Privy modal or wagmi connectors). */
export function CultureBaseWalletButtons(props: CultureBaseWalletButtonsProps) {
  if (props.mode === "wagmi") {
    return <WagmiWalletButtons {...props} />;
  }
  return <PrivyWalletButtons {...props} />;
}
