import { motion } from "framer-motion";
import { MintTicketButton } from "@/modules/art/components/web3/MintTicketButton";
import { useEdition } from "@/modules/art/hooks/useEdition";
import { formatEur } from "@/modules/art/lib/format";
import type { ArtworkSlug } from "@/modules/art/lib/contracts";

type Props = {
  slug: ArtworkSlug;
  fallbackPriceEur: number;
  fallbackValueEur: number;
  fallbackSold: number;
  fallbackSupply: number;
  marketingSupply?: number;
};

export function ArtworkOnchainStats({
  slug,
  fallbackPriceEur,
  fallbackValueEur,
  fallbackSold,
  fallbackSupply,
  marketingSupply,
}: Props) {
  const edition = useEdition(slug);
  const displaySupply = marketingSupply ?? fallbackSupply;
  const onChainSupply = edition.maxSupply;
  const soldForLabel = edition.isConfigured ? (edition.sold ?? 0) : fallbackSold;
  const supplyForBar =
    edition.isConfigured && onChainSupply != null ? onChainSupply : displaySupply;
  const pct =
    displaySupply > 0 ? Math.min(100, Math.round((soldForLabel / displaySupply) * 100)) : 0;
  const supplyMismatch =
    edition.isConfigured && onChainSupply != null && onChainSupply !== displaySupply;

  const soldOut =
    edition.drawn ||
    (edition.isConfigured && onChainSupply != null && soldForLabel >= onChainSupply);

  const barPct =
    supplyForBar > 0 ? Math.min(100, Math.round((soldForLabel / supplyForBar) * 100)) : 0;

  return (
    <>
      <p className="text-sm border-y hairline py-6 text-muted-foreground">
        Raffle entry:{" "}
        <span className="text-foreground font-display text-xl">{formatEur(fallbackPriceEur)}</span>
        <span className="block text-[10px] uppercase tracking-[0.2em] mt-2 text-muted-foreground/80">
          One ticket wins the physical painting when the edition sells out
        </span>
        {" · "}
        Est. value <span className="text-foreground">{formatEur(fallbackValueEur)}</span>
        {" · "}
        Base
      </p>

      <div>
        <div className="flex justify-between text-xs uppercase tracking-[0.2em] mb-2">
          <span className="text-muted-foreground">
            {soldForLabel} of {displaySupply.toLocaleString("de-DE")} tickets
            {edition.isConfigured ? " · public on Base" : ""}
          </span>
          <span className="text-primary">{pct}%</span>
        </div>
        <motion.div className="h-[3px] bg-border/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${barPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r from-primary to-accent ${pct > 0 && !soldOut ? "progress-shimmer" : ""}`}
          />
        </motion.div>
        {supplyMismatch && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mt-3">
            Edition capacity onchain may differ during rollout.
          </p>
        )}
        {soldOut && !edition.drawn && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary mt-3">
            Edition complete — draw pending
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <MintTicketButton slug={slug} fallbackPriceEur={fallbackPriceEur} />
      </div>

      {edition.drawn && edition.winner && (
        <p className="text-xs uppercase tracking-[0.2em] text-primary border-l border-primary/40 pl-4 mt-4">
          Winner · {edition.winner.slice(0, 6)}…{edition.winner.slice(-4)}
        </p>
      )}
    </>
  );
}
