import { useState } from "react";
import { BCC_ADDRESS, BCC_DISCOUNT_LABEL, BCC_SYMBOL, BCC_UNISWAP_URL } from "@bc/bcc-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Floating "Buy BCC" button + modal. Button-only trigger (no auto-popup).
 * Mounted app-wide in __root.tsx alongside GetBcdModal.
 */
export function BuyBccButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] px-4 py-2 text-xs font-bold text-black shadow-lg transition hover:opacity-90 sm:bottom-6"
        aria-label={`Buy ${BCC_SYMBOL}`}
      >
        Buy {BCC_SYMBOL}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-[#C5FF41]/35 sm:max-w-md sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Get {BCC_SYMBOL}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              {BCC_SYMBOL} is our market token on Base, currently in fair launch. Pay with{" "}
              {BCC_SYMBOL} to get{" "}
              <span className="font-semibold text-[#C5FF41]">{BCC_DISCOUNT_LABEL}</span> on identity
              mints, art tickets, and Places.
            </DialogDescription>
          </DialogHeader>

          <a
            href={BCC_UNISWAP_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 block rounded-full bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] px-5 py-3 text-center text-sm font-bold text-black transition hover:opacity-90"
          >
            Buy {BCC_SYMBOL} on Uniswap →
          </a>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>Base · {BCC_SYMBOL}</span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(BCC_ADDRESS).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:text-white"
            >
              {copied ? "Copied!" : shortAddress(BCC_ADDRESS)}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
