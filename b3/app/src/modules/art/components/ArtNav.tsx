import { Link } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { ChainBanner } from "@/modules/art/components/web3/ChainBanner";
import { privyEnabled } from "@/lib/privy-env";

export function ArtNav() {
  const { login, ready, authenticated } = usePrivy();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass pt-[max(0.75rem,env(safe-area-inset-top))] md:px-12 md:py-5">
        <div className="flex items-center gap-4">
          <Link
            to="/forest"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            ← Forest
          </Link>
          <span className="font-display text-xl tracking-wide">
            Building<span className="text-gold-gradient italic"> Culture</span>
          </span>
        </div>
        <div className="hidden items-center gap-10 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#artworks" className="transition hover:text-foreground">
            Artworks
          </a>
          <a href="#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="#story" className="transition hover:text-foreground">
            Story
          </a>
          <a href="#community" className="transition hover:text-foreground">
            Community
          </a>
        </div>
        {privyEnabled ? (
          <button
            type="button"
            onClick={() => void login()}
            disabled={!ready}
            className="rounded-full bg-primary px-5 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50"
          >
            {authenticated ? "Wallet connected" : "Connect wallet"}
          </button>
        ) : null}
      </nav>
      <ChainBanner />
    </>
  );
}
