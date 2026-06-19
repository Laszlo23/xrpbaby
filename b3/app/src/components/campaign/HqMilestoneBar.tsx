import { useQuery } from "@tanstack/react-query";
import { HQ_MILESTONES } from "@/content/hq-fundraise";
import { formatPackUsd } from "@/lib/packs";

type Progress = {
  ok: true;
  raisedUsd: number;
  goalUsd: number;
  percent: number;
  purchaseCount: number;
};

export function HqMilestoneBar() {
  const { data, isLoading } = useQuery({
    queryKey: ["hqFundraiseProgress"],
    queryFn: async (): Promise<Progress> => {
      const res = await fetch("/api/campaign/hq-progress");
      if (!res.ok) throw new Error("progress_unavailable");
      return (await res.json()) as Progress;
    },
    staleTime: 30_000,
    retry: 1,
  });

  const percent = data?.percent ?? 0;
  const raised = data?.raisedUsd ?? 0;
  const goal = data?.goalUsd ?? 77_777;

  return (
    <section className="rounded-3xl border border-[var(--vault-gold)]/20 bg-black/50 p-6 ring-1 ring-white/[0.06]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--vault-gold)]">
            HQ 77777 milestone
          </p>
          <p className="mt-2 font-heading text-2xl font-semibold text-white">
            {isLoading ? "—" : formatPackUsd(raised)}{" "}
            <span className="text-base font-normal text-zinc-500">of {formatPackUsd(goal)}</span>
          </p>
        </div>
        <p className="font-mono text-3xl font-semibold text-[#C5FF41]">
          {isLoading ? "…" : `${percent}%`}
        </p>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--vault-gold)] to-[#C5FF41] transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {HQ_MILESTONES.map((m) => {
          const reached = percent >= m.percent;
          return (
            <li
              key={m.id}
              className={`rounded-2xl border px-4 py-3 ${
                reached ? "border-[#C5FF41]/30 bg-[#C5FF41]/5" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {m.percent}% · {m.label}
              </p>
              <p className="mt-1 text-sm text-zinc-300">{m.description}</p>
            </li>
          );
        })}
      </ol>

      {data?.purchaseCount ? (
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {data.purchaseCount} pledge{data.purchaseCount === 1 ? "" : "s"} on record
        </p>
      ) : null}
    </section>
  );
}
