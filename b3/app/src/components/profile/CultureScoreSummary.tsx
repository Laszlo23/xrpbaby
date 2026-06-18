"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Link } from "@tanstack/react-router";

import { CultureScore } from "@/components/profile/CultureScore";
import type { CultureScoreDimension, CultureScoreRank } from "@/lib/profile/founder-showcase";

type ScorePayload = {
  ok: boolean;
  score: {
    value: number;
    note: string;
    rank: CultureScoreRank;
    dimensions: CultureScoreDimension[];
  } | null;
};

type CultureScoreSummaryProps = {
  compact?: boolean;
};

export function CultureScoreSummary({ compact = false }: CultureScoreSummaryProps) {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ["culture-score", address],
    queryFn: async () => {
      const res = await fetch(`/api/member/culture-score?address=${address}`);
      return (await res.json()) as ScorePayload;
    },
    enabled: Boolean(address && isConnected),
    staleTime: 120_000,
  });

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-sm text-zinc-400">Connect wallet to see your Culture Score.</p>
        <Link
          to="/join"
          className="mt-4 inline-flex rounded-full bg-[#C5FF41] px-5 py-2 text-sm font-semibold text-black"
        >
          Create your pass
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-zinc-500">
        Calculating Culture Score…
      </div>
    );
  }

  if (!data?.score) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-zinc-500">
        Complete onboarding to start building your score.
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-2xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 p-5">
        <p className="mono-label !text-[#C5FF41]">CULTURE SCORE</p>
        <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
          {data.score.value.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-zinc-400">{data.score.rank.label}</p>
        <Link to="/profile" className="mt-4 inline-block text-xs text-[#00E5FF] hover:underline">
          View full breakdown →
        </Link>
      </div>
    );
  }

  return (
    <CultureScore
      score={data.score.value}
      note={data.score.note}
      rank={data.score.rank}
      explanation="Your portable reputation across social, onchain, quests, referrals, and builds in Building Culture."
      dimensions={data.score.dimensions}
    />
  );
}
