import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/legacy/analytics")({
  component: LegacyAnalyticsPage,
  head: () =>
    pageHead({
      title: "Legacy analytics",
      description: "Member-scoped growth intelligence and quest completion view.",
      path: "/legacy/analytics",
    }),
});

function LegacyAnalyticsPage() {
  const { address, isConnected } = useAccount();
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/intelligence/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setOverview)
      .catch(() => setOverview(null));
  }, []);

  if (!isConnected) {
    return (
      <p className="px-5 py-16 text-center text-zinc-400">
        <Link to="/join" className="underline text-[#C5FF41]">
          Connect
        </Link>{" "}
        for analytics.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/legacy" className="text-sm text-zinc-500 hover:text-white">
        ← Legacy dashboard
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Your analytics</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Funnel position and growth signals for {address?.slice(0, 6)}…{address?.slice(-4)}.
      </p>
      <pre className="mt-8 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-400">
        {overview ? JSON.stringify(overview, null, 2) : "Loading overview…"}
      </pre>
      <p className="mt-4 text-xs text-zinc-600">
        Export a Culture Report for grants from{" "}
        <Link to="/grant-proof" className="text-[#00E5FF] underline">
          Grant proof
        </Link>
        .
      </p>
    </div>
  );
}
