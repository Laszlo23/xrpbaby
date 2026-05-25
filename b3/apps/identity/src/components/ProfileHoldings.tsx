import { motion } from "framer-motion";
import type { NftHolding } from "@/lib/social/types";

export function ProfileHoldings({ holdings }: { holdings: NftHolding[] }) {
  if (holdings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mt-10"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          on Base
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <motion.div className="flex gap-3 overflow-x-auto pb-2">
        {holdings.map((h) => (
          <div
            key={`${h.contractAddress}-${h.tokenId}`}
            className={`glass flex min-w-[7rem] shrink-0 flex-col overflow-hidden rounded-2xl ${
              h.isCultureLayer ? "ring-1 ring-primary/40" : ""
            }`}
          >
            <div className="aspect-square w-28 bg-surface-elevated">
              {h.imageUrl ? (
                <img
                  src={h.imageUrl}
                  alt={h.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center font-mono text-[10px] text-muted-foreground">
                  NFT
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate font-display text-xs font-medium">{h.name}</p>
              {h.isCultureLayer && (
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                  identity
                </p>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
