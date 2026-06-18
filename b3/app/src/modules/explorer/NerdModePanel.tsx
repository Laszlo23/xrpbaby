import { useState } from "react";
import { ChevronDown, ExternalLink, Terminal } from "lucide-react";

import { explorerTxUrl } from "@/lib/explorer";
import { blockscoutTxUrl } from "@/modules/explorer/external";
import type { TxFacts } from "@/modules/explorer/lib";

/** Collapsible raw-data panel for people who want to verify everything themselves. */
export function NerdModePanel({ facts }: { facts: TxFacts }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-black/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
          <Terminal className="h-4 w-4" aria-hidden /> Nerd mode — raw data
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-white/[0.06] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <a
              href={explorerTxUrl(facts.chainId, facts.hash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/50 px-3.5 py-1.5 font-mono text-[11px] text-zinc-300 transition hover:border-white/30 hover:text-white"
            >
              Basescan <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
            </a>
            <a
              href={blockscoutTxUrl(facts.hash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/50 px-3.5 py-1.5 font-mono text-[11px] text-zinc-300 transition hover:border-white/30 hover:text-white"
            >
              Blockscout <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
            </a>
          </div>
          <p className="text-xs text-zinc-500">
            Everything shown on this page is derived from this verified data — check it yourself on
            any independent explorer above. Trust, but verify.
          </p>
          <pre className="max-h-[420px] overflow-auto rounded-lg border border-white/[0.06] bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-zinc-400">
            {JSON.stringify(facts, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
