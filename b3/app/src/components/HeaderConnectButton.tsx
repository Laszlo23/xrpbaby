import { Link } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import { WalletIdentityBar } from "@/components/identity/WalletIdentityBar";
import { useCultureLogin } from "@/hooks/useCultureLogin";
import { privyEnabled } from "@/lib/privy-env";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { pickInjectedConnector } from "@/lib/wallet-connectors";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type Props = {
  className?: string;
  /** Show culture ID chips when connected (nav bar layout). */
  showIdentity?: boolean;
};

function PrivyHeaderConnect({ className = "", showIdentity = false }: Props) {
  const { authenticated, logout } = usePrivy();
  const { ready, openPreferredLogin } = useCultureLogin();
  const address = usePrivyWalletAddress();

  if (!ready) {
    return (
      <span className={`font-mono text-[10px] text-zinc-500 ${className}`}>Loading…</span>
    );
  }

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={openPreferredLogin}
        className={`inline-flex items-center gap-1.5 rounded-full bg-[#C5FF41] px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-white ${className}`}
      >
        <Wallet size={15} strokeWidth={2.25} aria-hidden />
        Connect
      </button>
    );
  }

  if (!address) {
    return (
      <span className={`font-mono text-[10px] text-zinc-500 ${className}`}>Setting up…</span>
    );
  }

  if (showIdentity) {
    return (
      <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
        <WalletIdentityBar />
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

  return (
    <Link
      to="/wallet"
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-2 font-mono text-[11px] text-zinc-100 backdrop-blur-md transition hover:border-[#C5FF41]/40 ${className}`}
    >
      <Wallet size={14} strokeWidth={2} aria-hidden />
      {shortAddr(address)}
    </Link>
  );
}

function LegacyHeaderConnect({ className = "", showIdentity = false }: Props) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  if (!isConnected || !address) {
    const busy = isPending || isConnecting;
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          const connector = pickInjectedConnector(connectors);
          if (connector) connect({ connector });
        }}
        className={`inline-flex items-center gap-1.5 rounded-full bg-[#C5FF41] px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-white disabled:opacity-60 ${className}`}
      >
        <Wallet size={15} strokeWidth={2.25} aria-hidden />
        {busy ? "Connecting…" : "Connect"}
      </button>
    );
  }

  if (showIdentity) {
    return (
      <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
        <WalletIdentityBar />
        <Link
          to="/wallet"
          className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-zinc-200 backdrop-blur-md transition hover:border-[#C5FF41]/30"
        >
          {shortAddr(address)}
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/wallet"
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-2 font-mono text-[11px] text-zinc-100 backdrop-blur-md transition hover:border-[#C5FF41]/40 ${className}`}
    >
      <Wallet size={14} strokeWidth={2} aria-hidden />
      {shortAddr(address)}
    </Link>
  );
}

export function HeaderConnectButton(props: Props) {
  if (privyEnabled) {
    return <PrivyHeaderConnect {...props} />;
  }
  return <LegacyHeaderConnect {...props} />;
}
