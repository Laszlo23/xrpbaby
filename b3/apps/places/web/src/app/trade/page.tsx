"use client";

import { Suspense } from "react";
import { TradePageInner } from "./TradePageInner";

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-20 text-center text-muted">Loading…</div>
      }
    >
      <TradePageInner />
    </Suspense>
  );
}
