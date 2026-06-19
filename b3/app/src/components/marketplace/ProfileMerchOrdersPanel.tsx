"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

type MerchOrderRow = {
  id: string;
  dropSlug: string;
  dropTitle: string;
  imageUrl: string;
  unitNumber: number;
  editionCap: number;
  size: string;
  status: string;
  priceUsd: number;
  paymentRail: string | null;
  x402TxHash: string | null;
  claimPath: string;
  claimedAt: string | null;
};

type ProfileMerchOrdersPanelProps = {
  walletAddress: string;
};

function baseScanTxUrl(hash: string): string {
  return `https://basescan.org/tx/${hash}`;
}

export function ProfileMerchOrdersPanel({ walletAddress }: ProfileMerchOrdersPanelProps) {
  const [orders, setOrders] = useState<MerchOrderRow[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const params = new URLSearchParams({ wallet: walletAddress });
      const res = await fetch(`/api/marketplace/merch/orders?${params}`);
      const data = (await res.json()) as { ok?: boolean; orders?: MerchOrderRow[] };
      if (!res.ok || !data.orders) {
        setLoadState("error");
        return;
      }
      setOrders(data.orders.filter((o) => o.status === "paid" || o.status === "claimed"));
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [walletAddress]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h2 className="font-heading text-lg font-semibold text-white">Merch editions</h2>
        <p className="mt-2 text-sm text-zinc-500">Loading your orders…</p>
      </section>
    );
  }

  if (loadState === "error" || orders.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-white">Merch editions</h2>
        <Link to="/marketplace/merch" className="text-sm text-[#C5FF41] hover:text-white">
          Shop merch →
        </Link>
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex flex-wrap items-start gap-4 rounded-xl border border-zinc-800/80 bg-black/40 p-4"
          >
            <img
              src={order.imageUrl}
              alt={order.dropTitle}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{order.dropTitle}</p>
              <p className="text-sm text-zinc-400">
                #{order.unitNumber} of {order.editionCap} · Size {order.size}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {order.status === "claimed" ? "Claimed" : "Paid — claim your credential"}
                {order.paymentRail === "x402" && order.x402TxHash ? (
                  <>
                    {" · "}
                    <a
                      href={baseScanTxUrl(order.x402TxHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C5FF41] hover:text-white"
                    >
                      Paid {order.priceUsd} USDC on Base via x402
                    </a>
                  </>
                ) : null}
              </p>
              {order.status === "paid" ? (
                <a
                  href={order.claimPath}
                  className="mt-2 inline-flex text-sm font-medium text-[#C5FF41] hover:text-white"
                >
                  Claim credential →
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
