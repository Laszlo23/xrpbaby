import { useQuery } from "@tanstack/react-query";
import { TRIPLE_333_BUCKETS, TRIPLE_333_COPY } from "@/content/triple-333-campaign";
import { formatPackUsd } from "@/lib/packs";

type Progress = {
  ok: true;
  ticketsSold: number;
  ticketGoal: number;
  percent: number;
};

export function Triple333SplitBar() {
  const { data, isLoading } = useQuery({
    queryKey: ["triple333Progress"],
    queryFn: async (): Promise<Progress> => {
      const res = await fetch("/api/campaign/triple-333-progress");
      if (!res.ok) throw new Error("progress_unavailable");
      return (await res.json()) as Progress;
    },
    staleTime: 30_000,
    retry: 1,
  });

  const ticketsSold = data?.ticketsSold ?? 0;
  const ticketGoal = data?.ticketGoal ?? TRIPLE_333_COPY.ticketGoal;
  const percent = data?.percent ?? 0;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C5FF41]">
              Round progress
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-white">
              {isLoading ? "—" : `${ticketsSold} / ${ticketGoal}`}{" "}
              <span className="text-base font-normal text-zinc-500">tickets</span>
            </p>
          </div>
          <p className="font-mono text-sm text-zinc-400">
            {formatPackUsd(TRIPLE_333_COPY.roundTotalUsd)} per round
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--b3-purple)] transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TRIPLE_333_BUCKETS.map((bucket) => (
          <article
            key={bucket.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              {bucket.walletLabel}
            </p>
            <p className="mt-2 font-heading text-xl font-semibold text-white">{bucket.label}</p>
            <p className="mt-1 font-mono text-2xl text-[var(--vault-gold)]">
              {formatPackUsd(bucket.usd)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{bucket.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
