import { Link } from "@tanstack/react-router";
import { Ticket, Layers, Sparkles, ArrowRight } from "lucide-react";

/** Clarifies raffle ticket NFTs vs thirdweb NFT listings — links to existing ticket surfaces. */
export function MarketplaceTicketsStrip() {
  return (
    <section
      id="marketplace-tickets"
      className="scroll-mt-28 rounded-2xl border border-[rgb(212_175_55/0.15)] bg-gradient-to-br from-[rgb(212_175_55/0.06)] via-black/40 to-black/60 p-5 md:p-6"
      aria-labelledby="marketplace-tickets-heading"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <p
            id="marketplace-tickets-heading"
            className="font-heading text-lg font-semibold text-white md:text-xl"
          >
            Raffle tickets (on-chain draws)
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            These are separate from NFT listings below: ticket NFTs come from the deployed raffle
            campaign. New draw pools are launched by operators — you mint tickets and manage them
            under Collections.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Link
            to="/collections"
            search={{ minted: undefined }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/40 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-[rgb(212_175_55/0.35)] hover:text-white"
          >
            <Ticket className="h-4 w-4 text-[var(--vault-gold)]" aria-hidden />
            My tickets
            <ArrowRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </Link>
          <Link
            to="/play"
            hash="drops"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/40 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-white/25 hover:text-white"
          >
            <Layers className="h-4 w-4 text-emerald-400/90" aria-hidden />
            Live drops
          </Link>
          <Link
            to="/campaign"
            search={{ ref: undefined }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/15"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Campaign mint
          </Link>
        </div>
      </div>
    </section>
  );
}
