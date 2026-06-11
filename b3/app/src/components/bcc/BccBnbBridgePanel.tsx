import { useEffect, useState } from "react";
import {
  BCC_SYMBOL,
  buildJumperBnbToBccUrl,
  type BccBnbBuyRoute,
} from "@bc/bcc-kit";

type BnbRouteResponse = {
  ok?: boolean;
  estimate?: {
    bnbAmount: number;
    approxBccAfterFees?: number;
    notionalUsd?: number;
  };
  routes?: BccBnbBuyRoute[];
  recommended?: { label: string; href: string };
};

type BccBnbBridgePanelProps = {
  compact?: boolean;
};

/**
 * BNB Chain → Base BCC bridge paths (Jumper / deBridge / Rango).
 * Same canonical BCC — no new token.
 */
export function BccBnbBridgePanel({ compact = false }: BccBnbBridgePanelProps) {
  const [data, setData] = useState<BnbRouteResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/market/bcc/bnb-route?bnb=0.1")
      .then((r) => r.json())
      .then((d: BnbRouteResponse) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const jumperHref = data?.recommended?.href ?? buildJumperBnbToBccUrl("BNB");

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-xs leading-relaxed text-zinc-400">
        Connect MetaMask or Trust Wallet on BNB Chain. Aggregators deliver the same {BCC_SYMBOL} on
        Base — one token, fair-launch pool on Base.
      </p>

      {loading ? (
        <p className="text-xs text-zinc-500">Loading routes…</p>
      ) : data?.estimate?.approxBccAfterFees ? (
        <p className="rounded-lg border border-[#F0B90B]/25 bg-[#F0B90B]/5 px-3 py-2 text-xs text-zinc-300">
          ~{data.estimate.approxBccAfterFees} {BCC_SYMBOL} for {data.estimate.bnbAmount} BNB
          (estimate, fees extra)
        </p>
      ) : null}

      <a
        href={jumperHref}
        target="_blank"
        rel="noreferrer noopener"
        className="block rounded-full bg-gradient-to-r from-[#F0B90B] to-[#00E5FF] px-5 py-3 text-center text-sm font-bold text-black transition hover:opacity-90"
      >
        {data?.recommended?.label ?? "Jumper"}: BNB → {BCC_SYMBOL} on Base →
      </a>

      <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
        {(data?.routes ?? []).slice(1).map((route) => (
          <li key={route.id}>
            <a
              href={route.primaryHref}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-[#C5FF41] hover:underline"
            >
              {route.label}
            </a>
            <span className="text-zinc-500"> — {route.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
