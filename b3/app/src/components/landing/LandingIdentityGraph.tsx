import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { IdentityGraphPanel } from "@/components/identity/IdentityGraphPanel";
import type { CultureIdentityGraph } from "@/lib/identity/identity-graph-types";

const DEFAULT_IDENTITY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LANDING_GRAPH_IDENTITY?.trim()) ||
  "laszloleonardo.eth";

type GraphDemoResponse = {
  ok?: boolean;
  identity?: string;
  graph?: CultureIdentityGraph | null;
};

export function LandingIdentityGraph() {
  const [data, setData] = useState<GraphDemoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identity = encodeURIComponent(DEFAULT_IDENTITY);
    fetch(`/api/identity/graph-demo?identity=${identity}`)
      .then((r) => r.json())
      .then((json: GraphDemoResponse) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const graph = data?.graph?.graph ?? [];
  const demoName = data?.identity ?? DEFAULT_IDENTITY;

  return (
    <div id="culture-identity-graph" className="relative mt-24 scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mono-label">IDENTITY GRAPH</p>
        <h3 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          See the graph <span className="bc-text-cyan-gradient">connect.</span>
        </h3>
        <p className="mt-4 text-sm text-zinc-400 sm:text-base">
          One wallet, many identities — ENS, Farcaster, Lens, Linea, and more unified in the
          Culture Layer.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-3xl">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="animate-pulse text-sm text-zinc-500">Loading identity graph…</p>
          </div>
        ) : graph.length > 0 ? (
          <IdentityGraphPanel
            cultureName={demoName}
            graph={graph}
            readOnly
            subtitle={`Live graph for ${demoName} — your .culture name becomes the anchor.`}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-sm text-zinc-500">
            Identity graph preview unavailable right now. The profile API is free; add{" "}
            <code className="text-zinc-300">WEB3BIO_API_KEY</code> for wallet trust signals.
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/pass"
            className="inline-flex rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
          >
            Mint your .culture name
          </Link>
          <a
            href={`https://web3.bio/?s=${encodeURIComponent(demoName)}#graph`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-zinc-400 hover:text-white"
          >
            View on Web3.bio →
          </a>
        </div>
      </div>
    </div>
  );
}
