"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Hexagon, ShieldCheck } from "lucide-react";

import { getAchievements } from "@/lib/api/builder.functions";
import { useBuilder } from "@/hooks/use-builder";
import { getExplorerUrl } from "@/lib/solana/config";

export const Route = createFileRoute("/app/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const { walletAddress } = useBuilder();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      return getAchievements({ data: { walletAddress } });
    },
    enabled: !!walletAddress,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Proof of progress</p>
      <h1 className="mt-4 font-display text-5xl font-bold">Achievements</h1>
      <p className="mt-4 text-muted-foreground">
        On-chain NFTs and badges you own forever — portable proof of what you built.
      </p>

      {isLoading ? (
        <p className="mt-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Loading...
        </p>
      ) : achievements.length === 0 ? (
        <div className="mt-12 border border-dashed border-border p-12 text-center">
          <Hexagon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No achievements yet. Complete and claim missions to mint your first badge.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <div key={a.id} className="bg-background p-6">
              {a.type === "nft" ? (
                <Hexagon className="h-8 w-8 text-signal" strokeWidth={1.5} />
              ) : (
                <ShieldCheck className="h-8 w-8 text-signal" strokeWidth={1.5} />
              )}
              <h2 className="mt-4 font-display text-xl font-bold">{a.title}</h2>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {a.type}
                {a.missionSlug ? ` · ${a.missionSlug}` : ""}
              </p>
              {a.mintAddress && (
                <a
                  href={getExplorerUrl(a.mintAddress, "address")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block font-mono text-xs text-signal hover:underline"
                >
                  View on Explorer →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
