"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { completeMission } from "@/lib/api/builder.functions";
import { useBuilder } from "@/hooks/use-builder";
import { useClaimReward } from "@/hooks/use-claim-reward";
import { getExplorerUrl } from "@/lib/solana/config";

export const Route = createFileRoute("/app/missions")({
  component: MissionsPage,
});

function MissionsPage() {
  const { builder, walletAddress, refetch } = useBuilder();
  const claimMutation = useClaimReward(walletAddress);

  const completeMutation = useMutation({
    mutationFn: async (missionSlug: string) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      return completeMission({ data: { walletAddress, missionSlug } });
    },
    onSuccess: () => refetch(),
    onError: (err: Error) => toast.error(err.message),
  });

  if (!builder) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Missions</p>
      <h1 className="mt-4 font-display text-5xl font-bold">Ship. Claim. Repeat.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Complete missions to earn XP and on-chain BCC rewards. Missions with NFT badges require a
        wallet signature to claim.
      </p>

      <div className="mt-12 space-y-px border border-border bg-border">
        {builder.missions.map((mission) => (
          <div
            key={mission.slug}
            className="flex flex-col gap-4 bg-background p-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-bold">{mission.title}</h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {mission.status}
                </span>
                {mission.pathSlug && (
                  <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-signal">
                    {mission.pathSlug}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{mission.description}</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                +{mission.xpReward} XP · +{mission.bccReward} BCC
                {mission.nftAchievementKey ? " · NFT" : ""}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {mission.status === "available" && (
                <button
                  type="button"
                  disabled={completeMutation.isPending}
                  onClick={() => completeMutation.mutate(mission.slug)}
                  className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-surface"
                >
                  Mark complete
                </button>
              )}
              {mission.status === "claimable" && (
                <button
                  type="button"
                  disabled={claimMutation.isPending}
                  onClick={async () => {
                    try {
                      const result = await claimMutation.mutateAsync(mission.slug);
                      toast.success(`Claimed +${result.bccEarned} BCC, +${result.xpEarned} XP`);
                      if (result.txSignatures[0]) {
                        toast.info("View transaction", {
                          action: {
                            label: "Explorer",
                            onClick: () =>
                              window.open(getExplorerUrl(result.txSignatures[0]), "_blank"),
                          },
                        });
                      }
                      await refetch();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Claim failed");
                    }
                  }}
                  className="bg-signal px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground"
                >
                  {claimMutation.isPending ? "Claiming..." : "Claim on-chain"}
                </button>
              )}
              {mission.status === "claimed" && (
                <span className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-signal">
                  Claimed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
