import { useEffect, useState } from "react";

import { IdentityGraphPanel } from "@/components/identity/IdentityGraphPanel";
import type { CultureIdentityGraph } from "@/lib/identity/identity-graph-types";

type Props = {
  address: string;
  cultureName?: string | null;
};

export function ConnectIdentityGraph({ address, cultureName }: Props) {
  const [graph, setGraph] = useState<CultureIdentityGraph["graph"]>([]);
  const [label, setLabel] = useState(cultureName ?? address);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = cultureName
      ? `identity=${encodeURIComponent(cultureName)}`
      : `address=${encodeURIComponent(address)}`;
    fetch(`/api/identity/graph?${q}`)
      .then((r) => r.json())
      .then((json: { ok?: boolean; graph?: CultureIdentityGraph; identity?: string }) => {
        setGraph(json.graph?.graph ?? []);
        if (json.identity) setLabel(json.identity);
      })
      .catch(() => setGraph([]))
      .finally(() => setLoading(false));
  }, [address, cultureName]);

  if (loading) {
    return <p className="animate-pulse text-sm text-zinc-500">Loading connections…</p>;
  }

  if (graph.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No linked identities yet. Mint your .culture name to anchor your graph.
      </p>
    );
  }

  return (
    <IdentityGraphPanel
      cultureName={label}
      graph={graph}
      readOnly
      subtitle="Your linked identities across the culture layer."
    />
  );
}
