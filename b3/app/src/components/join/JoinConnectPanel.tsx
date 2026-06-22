import { CultureBaseWalletButtons } from "@bc/culture-auth/react";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import type { Connector } from "wagmi";

import { useCultureLogin } from "@/hooks/useCultureLogin";
import { privyEnabled } from "@/lib/privy-env";
import { findBraveConnector } from "@/lib/wallet-connectors";
import { plainLabels } from "@/lib/plain-labels";

const primaryButtonClass =
  "w-full rounded-full border border-[#C5FF41]/40 bg-[#C5FF41] px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-50";

const secondaryButtonClass =
  "w-full rounded-full border border-white/15 bg-black/30 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/25 disabled:opacity-50";

function connectorLabel(c: Connector): string {
  switch (c.id) {
    case "metaMask":
      return "MetaMask";
    case "walletConnect":
      return "WalletConnect";
    case "injected":
      return "Browser wallet";
    case "worldApp":
      return "World App";
    default:
      return c.name ?? c.id;
  }
}

export function JoinConnectPanel() {
  const {
    authSurface,
    primaryLoginLabel,
    openEmailLogin,
    openFarcasterLogin,
    openWalletLogin,
    openBraveWalletLogin,
    openPreferredLogin,
  } = useCultureLogin();
  const { connect, connectors, isPending, variables } = useConnect();
  const { isConnecting } = useAccount();
  const [authPending, setAuthPending] = useState<null | "farcaster" | "email" | "wallet">(null);

  useEffect(() => {
    if (authPending && !isPending && !isConnecting) {
      setAuthPending(null);
    }
  }, [authPending, isPending, isConnecting]);

  if (privyEnabled) {
    const inFarcaster = authSurface.kind === "farcaster";

    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-left shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C5FF41]/15 text-[#C5FF41]">
            <Wallet size={20} strokeWidth={2.25} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{plainLabels.join.connectTitle}</p>
            <p className="text-xs text-zinc-400">{plainLabels.join.connectSubtitle}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthPending(inFarcaster ? "farcaster" : "email");
              openPreferredLogin();
            }}
            className={primaryButtonClass}
          >
            {authPending === "farcaster" || authPending === "email"
              ? plainLabels.join.openingWallet
              : primaryLoginLabel}
          </button>

          <CultureBaseWalletButtons
            compactInBaseApp={authSurface.kind === "baseapp"}
            onConnectStart={() => {
              setAuthPending("wallet");
              openWalletLogin();
            }}
            className="w-full"
            buttonClassName={(label) =>
              [
                secondaryButtonClass,
                label === "Base Account"
                  ? "border-[var(--base-blue,#0052FF)]/50 bg-[var(--base-blue,#0052FF)]/15 text-white hover:bg-[var(--base-blue,#0052FF)]/25"
                  : "",
              ].join(" ")
            }
          />

          <button
            type="button"
            onClick={() => {
              setAuthPending("wallet");
              openWalletLogin();
            }}
            className="w-full rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            {authPending === "wallet"
              ? plainLabels.join.openingWallet
              : plainLabels.join.moreWallets}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthPending("wallet");
              openBraveWalletLogin();
            }}
            className="w-full rounded-full border border-[#FB542B]/40 bg-[#FB542B]/10 px-4 py-2.5 text-xs font-semibold text-orange-100 transition hover:bg-[#FB542B]/20"
          >
            Brave Wallet
          </button>

          {inFarcaster ? (
            <button
              type="button"
              onClick={() => {
                setAuthPending("email");
                openEmailLogin();
              }}
              className="w-full text-center text-xs text-zinc-500 transition hover:text-zinc-300"
            >
              Use email instead
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthPending("farcaster");
                openFarcasterLogin();
              }}
              className="w-full text-center text-xs text-zinc-500 transition hover:text-zinc-300"
            >
              Sign in with Farcaster
            </button>
          )}
        </div>
      </div>
    );
  }

  const braveConnector = findBraveConnector(connectors);
  const busy = isPending || isConnecting;
  const pendingId =
    variables?.connector &&
    typeof variables.connector === "object" &&
    "id" in variables.connector
      ? (variables.connector as Connector).id
      : undefined;

  const otherConnectors = connectors.filter(
    (c) => c.id !== "baseAccount" && c.id !== "coinbaseWallet" && c.uid !== braveConnector?.uid,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-left shadow-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C5FF41]/15 text-[#C5FF41]">
          <Wallet size={20} strokeWidth={2.25} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{plainLabels.join.connectTitle}</p>
          <p className="text-xs text-zinc-400">{plainLabels.join.connectSubtitle}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <CultureBaseWalletButtons
          mode="wagmi"
          busy={busy}
          className="w-full"
          buttonClassName={(label) =>
            [
              secondaryButtonClass,
              label === "Base Account"
                ? "border-[var(--base-blue,#0052FF)]/50 bg-[var(--base-blue,#0052FF)]/15 text-white hover:bg-[var(--base-blue,#0052FF)]/25"
                : "",
            ].join(" ")
          }
        />

        {braveConnector ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => connect({ connector: braveConnector })}
            className="w-full rounded-full border border-[#FB542B]/40 bg-[#FB542B]/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:bg-[#FB542B]/20 disabled:opacity-50"
          >
            {busy && pendingId === braveConnector.id ? "Connecting…" : "Brave Wallet"}
          </button>
        ) : null}

        {otherConnectors.map((connector) => (
          <button
            key={connector.uid}
            type="button"
            disabled={busy}
            onClick={() => connect({ connector })}
            className={secondaryButtonClass}
          >
            {busy && pendingId === connector.id ? "Connecting…" : connectorLabel(connector)}
          </button>
        ))}
      </div>
    </div>
  );
}
