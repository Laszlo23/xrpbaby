import { usePrivy } from "@privy-io/react-auth";
import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, Sparkles, Wallet } from "lucide-react";
import { useState } from "react";
import { useDisconnect, useConnect } from "wagmi";

import { WalletIdentityBar } from "@/components/identity/WalletIdentityBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCultureLogin } from "@/hooks/useCultureLogin";
import { useSwitchToSmartWallet } from "@/hooks/useSwitchToSmartWallet";
import { useWalletSession } from "@/hooks/useWalletSession";
import { performWalletLogout } from "@/lib/wallet-logout";
import { privyEnabled } from "@/lib/privy-env";
import { shortWalletAddress } from "@/lib/wallet-session-utils";
import { pickInjectedConnector } from "@/lib/wallet-connectors";

type Props = {
  className?: string;
  showIdentityBar?: boolean;
};

function WalletKindBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
      {label}
    </span>
  );
}

function PrivyWalletAccountMenu({ className = "", showIdentityBar = false }: Props) {
  const session = useWalletSession();
  const { logout, getAccessToken } = usePrivy();
  const { openPreferredLogin } = useCultureLogin();
  const switchToSmartWallet = useSwitchToSmartWallet();
  const [switching, setSwitching] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!session.ready) {
    return <span className={`font-mono text-[10px] text-zinc-500 ${className}`}>Loading…</span>;
  }

  if (!session.authenticated) {
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

  if (session.isSyncing && !session.address) {
    return <span className={`font-mono text-[10px] text-zinc-500 ${className}`}>Setting up…</span>;
  }

  async function onSignOut() {
    setSigningOut(true);
    try {
      await performWalletLogout({
        authenticated: session.authenticated,
        logout,
        getAccessToken,
      });
    } finally {
      setSigningOut(false);
    }
  }

  async function onSwitchToSmartWallet() {
    setSwitching(true);
    try {
      await switchToSmartWallet();
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
      {showIdentityBar ? <WalletIdentityBar /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-2 font-mono text-[11px] text-zinc-100 backdrop-blur-md transition hover:border-[#C5FF41]/40"
            aria-label="Wallet account menu"
          >
            <Wallet size={14} strokeWidth={2} aria-hidden />
            <span className="truncate">{session.displayLabel}</span>
            <ChevronDown size={14} className="shrink-0 opacity-70" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[14rem] border-white/10 bg-zinc-950/95 text-zinc-100 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="space-y-2 font-normal">
            <p className="truncate font-mono text-xs text-white">{session.displayLabel}</p>
            {session.address ? (
              <p className="font-mono text-[10px] text-zinc-500">{shortWalletAddress(session.address)}</p>
            ) : null}
            <WalletKindBadge label={session.walletKindLabel} />
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
            <Link to="/wallet" className="flex items-center gap-2">
              <Settings size={14} aria-hidden />
              Wallet &amp; settings
            </Link>
          </DropdownMenuItem>
          {session.canSwitchToSmartWallet ? (
            <DropdownMenuItem
              className="cursor-pointer focus:bg-white/10 focus:text-white"
              disabled={switching}
              onSelect={(event) => {
                event.preventDefault();
                void onSwitchToSmartWallet();
              }}
            >
              <Sparkles size={14} aria-hidden />
              {switching ? "Switching…" : "Switch to smart wallet"}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="cursor-pointer text-red-300 focus:bg-red-500/10 focus:text-red-200"
            disabled={signingOut}
            onSelect={(event) => {
              event.preventDefault();
              void onSignOut();
            }}
          >
            <LogOut size={14} aria-hidden />
            {signingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LegacyWalletAccountMenu({ className = "", showIdentityBar = false }: Props) {
  const session = useWalletSession();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();
  const [signingOut, setSigningOut] = useState(false);

  if (!session.ready && !session.authenticated) {
    const busy = isPending;
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

  if (!session.authenticated || !session.address) {
    const busy = isPending || session.isSyncing;
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

  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
      {showIdentityBar ? <WalletIdentityBar /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-2 font-mono text-[11px] text-zinc-100 backdrop-blur-md transition hover:border-[#C5FF41]/40"
            aria-label="Wallet account menu"
          >
            <Wallet size={14} strokeWidth={2} aria-hidden />
            <span className="truncate">{session.displayLabel}</span>
            <ChevronDown size={14} className="shrink-0 opacity-70" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[14rem] border-white/10 bg-zinc-950/95 text-zinc-100 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="space-y-2 font-normal">
            <p className="truncate font-mono text-xs text-white">{session.displayLabel}</p>
            <p className="font-mono text-[10px] text-zinc-500">{shortWalletAddress(session.address)}</p>
            <WalletKindBadge label={session.walletKindLabel} />
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
            <Link to="/wallet" className="flex items-center gap-2">
              <Settings size={14} aria-hidden />
              Wallet &amp; settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="cursor-pointer text-red-300 focus:bg-red-500/10 focus:text-red-200"
            disabled={signingOut}
            onSelect={(event) => {
              event.preventDefault();
              setSigningOut(true);
              try {
                disconnect();
              } finally {
                setSigningOut(false);
              }
            }}
          >
            <LogOut size={14} aria-hidden />
            {signingOut ? "Disconnecting…" : "Disconnect"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function WalletAccountMenu(props: Props) {
  if (privyEnabled) {
    return <PrivyWalletAccountMenu {...props} />;
  }
  return <LegacyWalletAccountMenu {...props} />;
}
