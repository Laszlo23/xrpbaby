import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, Flame, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, type ExplorerFeed, type FeedItem } from "@/modules/explorer/lib";

function FeedRow({ item }: { item: FeedItem }) {
  const icon =
    item.kind === "mint" ? (
      <Sparkles className="h-4 w-4 text-[var(--vault-gold)]" aria-hidden />
    ) : item.summary.includes("burned") ? (
      <Flame className="h-4 w-4 text-orange-400" aria-hidden />
    ) : (
      <Activity className="h-4 w-4 text-[var(--base-blue)]" aria-hidden />
    );

  const body = (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 transition hover:border-white/[0.16] hover:bg-black/50">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-black/50">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-zinc-200">{item.summary}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-white/[0.12] px-2 py-0 font-mono text-[10px] uppercase tracking-wider text-zinc-400"
          >
            {item.ecosystemTag}
          </Badge>
          <span className="text-[11px] text-zinc-500">{timeAgo(item.timestamp)}</span>
        </div>
      </div>
      {item.txHash ? (
        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
      ) : null}
    </div>
  );

  if (!item.txHash) return body;
  return (
    <Link to="/explorer/tx/$hash" params={{ hash: item.txHash }} className="block">
      {body}
    </Link>
  );
}

export function ActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["explorer-feed"],
    queryFn: async (): Promise<ExplorerFeed> => {
      const res = await fetch("/api/explorer/feed");
      if (!res.ok) throw new Error("feed_unavailable");
      return (await res.json()) as ExplorerFeed;
    },
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-6 text-center text-sm text-zinc-500">
        The live feed is quiet right now — try searching for a transaction above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {data.items.map((item) => (
        <FeedRow key={item.id} item={item} />
      ))}
    </div>
  );
}
