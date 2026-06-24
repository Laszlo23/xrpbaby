import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Layers, User } from "lucide-react";

import { WalletAccountMenu } from "@/components/wallet/WalletAccountMenu";
import { LayerRail } from "@/components/layout/LayerRail";
import { LANDING_MEDIA } from "@/lib/landing-media";
import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";

type LoggedInShellProps = {
  showLayerRail?: boolean;
};

export function LoggedInShell({ showLayerRail = true }: LoggedInShellProps) {
  const { primaryName } = useWalletCultureIdentity();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link to="/forest" className="flex shrink-0 items-center gap-2">
          <img src={LANDING_MEDIA.logo} alt="" className="h-7 w-auto" width={28} height={28} />
          <span className="hidden font-display text-sm font-bold sm:inline">Hub</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            to="/forest"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <Link
            to="/ecosystem"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
          >
            <Layers className="h-3.5 w-3.5" />
            Ecosystem
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
          >
            <User className="h-3.5 w-3.5" />
            {primaryName ? primaryName.split(".")[0] : "You"}
          </Link>
        </nav>

        <div className="min-w-0 shrink">
          <WalletAccountMenu showIdentityBar />
        </div>
      </div>
      {showLayerRail ? (
        <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6">
          <LayerRail />
        </div>
      ) : null}
    </header>
  );
}
