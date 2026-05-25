import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  buildNftImageDataUrl,
  toNftVisualInput,
  type NftVisualInput,
} from "@/lib/nft/identityNftVisual";
import { openSeaAssetUrl } from "@/lib/nft/marketplace";
import type { OnchainIdentity } from "@/lib/chain/identityContract";

type IdentityNftCardProps = {
  identity: OnchainIdentity | NftVisualInput;
  showMarketplace?: boolean;
  compact?: boolean;
  className?: string;
};

export function IdentityNftCard({
  identity,
  showMarketplace = true,
  compact = false,
  className = "",
}: IdentityNftCardProps) {
  const visual =
    "chainLabel" in identity ? toNftVisualInput(identity) : identity;

  const imageUrl = buildNftImageDataUrl(visual);
  const accent = visual.isFounding ? "gold" : "primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${className}`}
    >
      <motion.div
        className={`absolute -inset-1 rounded-3xl opacity-60 blur-2xl transition group-hover:opacity-90 ${
          accent === "gold" ? "bg-gold/25" : "bg-primary/25"
        }`}
      />
      <div className="glass-strong relative overflow-hidden rounded-3xl border border-border-strong">
        <div className="grid-overlay absolute inset-0 opacity-40" />
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={`${visual.fullName} identity NFT`}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <motion.div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-border-strong bg-background/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              ERC-721
            </span>
            {visual.isFounding && (
              <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gold backdrop-blur">
                founding
              </span>
            )}
          </motion.div>
          <motion.div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              minted identity
            </p>
            <p
              className={`mt-2 font-display font-medium leading-none tracking-tight ${
                compact ? "text-3xl" : "text-4xl sm:text-5xl"
              }`}
            >
              <span className="text-gradient">{visual.handle}</span>
              <span
                className={`font-serif italic ${accent === "gold" ? "text-gradient-gold" : "text-primary"}`}
              >
                .{visual.tld}
              </span>
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              token #{visual.tokenId.toString()}
            </p>
          </motion.div>
        </div>

        {showMarketplace && (
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
            <p className="max-w-[14rem] text-xs text-muted-foreground">
              Trade this name on secondary markets. The NFT artwork shows your identity.
            </p>
            <a
              href={openSeaAssetUrl(visual.tokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-foreground px-4 py-2 font-display text-xs font-semibold text-background transition hover:scale-[1.02]"
            >
              View on OpenSea →
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function IdentityNftMintedBanner({
  fullName,
  tokenId,
}: {
  fullName: string;
  tokenId: bigint;
}) {
  const [handle, tld] = fullName.split(".");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong mx-auto max-w-lg rounded-2xl border border-primary/30 p-4 text-center"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
        minted onchain
      </p>
      <p className="mt-2 font-display text-2xl font-medium tracking-tight">
        <span className="text-gradient">{handle}</span>
        <span className="font-serif italic text-primary">.{tld}</span>
      </p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        token #{tokenId.toString()} · view your NFT card below
      </p>
      <Link
        to="/id/$name"
        params={{ name: fullName }}
        className="mt-3 inline-block text-sm text-primary underline"
      >
        Open profile →
      </Link>
    </motion.div>
  );
}
