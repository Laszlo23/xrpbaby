import { ArrowDown } from "lucide-react";

import { AddressBadge } from "@/modules/explorer/AddressBadge";
import type { AssetFlow, TxFacts } from "@/modules/explorer/lib";

function FlowRow({ flow }: { flow: AssetFlow }) {
  const amount =
    flow.asset.kind === "nft"
      ? `${flow.asset.symbol}${flow.tokenId ? ` #${flow.tokenId}` : ""}`
      : `${flow.amountFormatted} ${flow.asset.symbol}`;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
      <div className="flex flex-col items-start gap-2">
        <AddressBadge
          address={flow.from.address}
          label={flow.from.label}
          ecosystem={flow.from.ecosystem}
        />
        <div className="flex items-center gap-2 pl-3">
          <ArrowDown className="h-4 w-4 text-zinc-600" aria-hidden />
          <span className="font-heading text-base font-semibold text-white">{amount}</span>
          {flow.usdValue != null ? (
            <span className="text-xs text-zinc-500">
              ≈ ${flow.usdValue.toLocaleString("en-US")}
            </span>
          ) : null}
          {flow.asset.name ? (
            <span className="hidden text-xs text-zinc-500 sm:inline">· {flow.asset.name}</span>
          ) : null}
        </div>
        <AddressBadge
          address={flow.to.address}
          label={flow.to.label}
          ecosystem={flow.to.ecosystem}
        />
      </div>
    </div>
  );
}

/** Who sent what to whom — labels instead of raw hex wherever possible. */
export function ValueFlow({ facts }: { facts: TxFacts }) {
  const hasNative = Number(facts.nativeValueEth.replace(/,/g, "")) > 0;

  if (facts.flows.length === 0 && !hasNative) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-5 text-sm text-zinc-500">
        No money or tokens moved in this transaction — it only talked to a smart contract.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {hasNative && facts.to ? (
        <FlowRow
          flow={{
            from: facts.from,
            to: facts.to,
            asset: { kind: "native", symbol: "ETH", name: "Ether", address: null, decimals: 18 },
            amountRaw: "",
            amountFormatted: facts.nativeValueEth,
            tokenId: null,
            usdValue: facts.nativeValueUsd,
          }}
        />
      ) : null}
      {facts.flows.map((flow, i) => (
        <FlowRow key={i} flow={flow} />
      ))}
    </div>
  );
}
