"use client";

import { useReadContract } from "wagmi";
import { predictionAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

export default function MarketsPage() {
  const { predictionMarket: m } = useProtocolAddresses();

  const { data: nextId } = useReadContract({
    address: m,
    abi: predictionAbi,
    functionName: "nextMarketId",
    query: { enabled: m !== "0x0000000000000000000000000000000000000000" },
  });

  const last = nextId && nextId > 1n ? nextId - 1n : 0n;
  const { data: market } = useReadContract({
    address: m,
    abi: predictionAbi,
    functionName: "markets",
    args: [last],
    query: { enabled: m !== "0x0000000000000000000000000000000000000000" && last > 0n },
  });

  const unset = m === "0x0000000000000000000000000000000000000000";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Prediction markets</h1>
      <p className="text-sm text-zinc-500">
        Binary YES/NO markets with admin resolution on this deployment. Stake ERC-20; claim after resolve.
      </p>
      {unset ? (
        <p className="text-amber-400">Set NEXT_PUBLIC_PREDICTION_MARKET in .env.local</p>
      ) : (
        <>
          <p className="text-zinc-400">
            Next market id: <span className="font-mono text-zinc-100">{nextId?.toString() ?? "…"}</span>
          </p>
          {market && last > 0n && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm">
              <p className="font-medium text-zinc-200">{market[0]}</p>
              <p className="mt-2 text-zinc-500">
                End: {new Date(Number(market[1]) * 1000).toISOString()} · Resolved:{" "}
                {market[5] ? (market[6] ? "YES" : "NO") : "no"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
