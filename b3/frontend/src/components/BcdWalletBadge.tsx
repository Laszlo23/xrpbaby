import { Coins } from "lucide-react";
import { useBcdBalance } from "@/hooks/useBcdBalance";
import { useBcdEconomy } from "@/contexts/BcdEconomyContext";

export function BcdWalletBadge() {
  const bcd = useBcdBalance();
  const { openGetBcd } = useBcdEconomy();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={openGetBcd}
        className="group inline-flex max-w-[10rem] items-center gap-1.5 overflow-hidden rounded-full border border-amber-500/25 bg-amber-500/10 py-1.5 pl-2.5 pr-2 font-mono text-[10px] text-amber-100/95 shadow-[0_0_20px_-8px_rgb(245_158_11/0.4)] transition hover:border-amber-400/40 hover:bg-amber-500/15 md:max-w-[12rem] md:text-[11px]"
        title="Building Culture Dollar — click to preview exchange"
      >
        <Coins className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
        <span className="min-w-0 truncate tracking-[0.06em]">{bcd.label}</span>
      </button>
      {bcd.isDemo ? (
        <span className="hidden font-mono text-[9px] uppercase tracking-widest text-zinc-600 sm:inline">
          demo
        </span>
      ) : null}
    </div>
  );
}
