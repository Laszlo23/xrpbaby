import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Connector } from "wagmi";
import { BcdWalletBadge } from "@/components/BcdWalletBadge";

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
    default:
      return c.name ?? c.id;
  }
}

export function WalletControls({ className = "" }: { className?: string }) {
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
        {connectors.map((connector) => (
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
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <BcdWalletBadge />
      <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-zinc-200 backdrop-blur-md">
        {shortAddr(address)}
      </span>
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
