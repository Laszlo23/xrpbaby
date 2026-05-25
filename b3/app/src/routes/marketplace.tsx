import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Store, ExternalLink } from "lucide-react";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { getMarketplaceContractAddress } from "@/lib/marketplace-config";
import { getMarketplaceChain } from "@/lib/chains";
import { explorerAddressUrl } from "@/lib/explorer";
import { MarketplaceTicketsStrip } from "@/components/MarketplaceTicketsStrip";

export const Route = createFileRoute("/marketplace")({
  component: MarketplaceLayout,
});

function NavPill({
  to,
  hash,
  label,
  active,
}: {
  to: string;
  hash?: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      {...(hash ? ({ hash } as { hash: string }) : {})}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--base-blue)]/25 text-white ring-1 ring-[var(--base-blue)]/50"
          : "border border-white/[0.1] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
      }`}
    >
      {label}
    </Link>
  );
}

function MarketplaceLayout() {
  const { pathname, hash: locationHash } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, hash: s.location.hash }),
  });
  const marketplaceChain = getMarketplaceChain();
  const marketplaceAddress = getMarketplaceContractAddress();
  const explorer = marketplaceAddress
    ? explorerAddressUrl(marketplaceChain.id, marketplaceAddress)
    : null;

  const sellActive = pathname.startsWith("/marketplace/sell");
  const h = locationHash ?? "";
  const ticketsHashActive = h === "marketplace-tickets" || h === "#marketplace-tickets";
  const exploreActive =
    !sellActive &&
    !ticketsHashActive &&
    (pathname === "/marketplace" ||
      pathname === "/marketplace/" ||
      /^\/marketplace\/\d+$/.test(pathname));

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[rgb(8_8_10)] to-black pb-nav-safe">
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(212_175_55/0.25)] bg-black/50 text-[var(--vault-gold)]">
                <Store className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {BRAND_DISPLAY_NAME}
                </p>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Marketplace
                </h1>
                <p className="mt-1 max-w-xl text-sm text-zinc-400">
                  Buy and sell ERC-721 listings on {marketplaceChain.name}. Raffle tickets use the
                  strip below — different contracts, same ecosystem.
                </p>
              </div>
            </div>
            {explorer ? (
              <a
                href={explorer}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/[0.12] bg-black/50 px-4 py-2 font-mono text-[11px] text-zinc-300 transition hover:border-[rgb(212_175_55/0.3)] hover:text-white md:self-auto"
              >
                Contract
                <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </a>
            ) : null}
          </div>

          <nav className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-6">
            <NavPill to="/marketplace" label="Explore" active={exploreActive} />
            <NavPill
              to="/marketplace"
              hash="marketplace-tickets"
              label="Raffle tickets"
              active={ticketsHashActive && !sellActive}
            />
            <NavPill to="/marketplace/sell" label="Sell an NFT" active={sellActive} />
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8 md:px-8 md:pt-10">
        <MarketplaceTicketsStrip />
        <Outlet />
        <footer className="border-t border-white/[0.06] pb-8 pt-6 text-center md:text-left">
          <p className="text-[11px] text-zinc-600">
            Secondary sales may involve fees set by the marketplace contract.{" "}
            <Link to="/faq" className="text-zinc-400 underline-offset-2 hover:text-white">
              FAQ
            </Link>
            {" · "}
            <Link to="/legal/terms" className="text-zinc-400 underline-offset-2 hover:text-white">
              Terms
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
