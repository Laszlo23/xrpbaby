"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { Zap, Flame, Droplets, Sprout } from "lucide-react";
import type { CulturePowerDimension } from "@/lib/identity/culture-power";

export const culturePowerEnabled =
  typeof import.meta !== "undefined" && import.meta.env.VITE_CULTURE_POWER_ENABLED === "1";

type PowerPayload = {
  ok: boolean;
  enabled: boolean;
  power: {
    score: number;
    multiplierLabel: string;
    maintenanceDueAt: string | null;
    streakDays: number;
    daysIdle: number;
    dimensions: CulturePowerDimension[];
  } | null;
};

function maintenanceHint(dueAt: string | null, daysIdle: number): string {
  if (daysIdle > 0) {
    return "Reactor cooling — check in or spin the Well to heat it back up.";
  }
  if (!dueAt) return "Complete a daily ritual to keep your hashrate maxed.";
  const ms = new Date(dueAt).getTime() - Date.now();
  if (ms <= 0) return "Maintenance window open — activate now.";
  const hours = Math.ceil(ms / (60 * 60 * 1000));
  return `Reactor stable · next cooldown in ~${hours}h`;
}

export function CulturePowerReactor({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ["culture-power", address],
    queryFn: async () => {
      const res = await fetch(`/api/member/culture-power?address=${address}`);
      return (await res.json()) as PowerPayload;
    },
    enabled: Boolean(address && isConnected && culturePowerEnabled),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  if (!culturePowerEnabled) return null;

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-sm text-zinc-400">Connect wallet to see your Culture Power reactor.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="culture-power-reactor"
        className="rounded-2xl border border-[#00E5FF]/20 bg-black/30 p-8 text-center text-sm text-zinc-500"
      >
        Calibrating reactor…
      </div>
    );
  }

  if (!data?.power) {
    return (
      <div
        data-testid="culture-power-reactor"
        className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-zinc-500"
      >
        Complete onboarding, then run a daily ritual to ignite your hashrate.
      </div>
    );
  }

  const { power } = data;
  const pulseDuration = Math.max(0.8, 3 - (power.score / 1000) * 2);

  return (
    <section
      data-testid="culture-power-reactor"
      className={`rounded-2xl border border-[#00E5FF]/25 bg-gradient-to-br from-[#00E5FF]/10 to-transparent ${
        compact ? "p-5" : "p-6"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label !text-[#00E5FF]">CULTURE POWER</p>
          <p className="mt-1 text-xs text-zinc-500">
            Your BCC farming hashrate — maintain it daily
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold tabular-nums text-white">{power.score}</p>
          <p className="font-mono text-xs text-[#C5FF41]">{power.multiplierLabel} weekly BCC</p>
        </div>
      </div>

      <div className="relative mx-auto my-6 flex h-32 w-32 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/40"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border border-[#C5FF41]/50 bg-[#C5FF41]/10"
          animate={{ rotate: 360 }}
          transition={{ duration: pulseDuration * 4, repeat: Infinity, ease: "linear" }}
        />
        <Zap className="relative h-10 w-10 text-[#00E5FF]" />
      </div>

      <p className="text-center text-xs text-zinc-400" data-testid="culture-power-maintenance-hint">
        {maintenanceHint(power.maintenanceDueAt, power.daysIdle)}
      </p>

      {power.streakDays > 0 ? (
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-amber-300/90">
          {power.streakDays}d maintenance streak
        </p>
      ) : null}

      <ul className="mt-5 space-y-2">
        {power.dimensions.map((dim) => (
          <li key={dim.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-300">{dim.label}</span>
              <span className="font-mono text-zinc-500">{dim.detail ?? `${dim.percent}%`}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#C5FF41]"
                style={{ width: `${dim.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/roots"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 hover:border-[#C5FF41]/40"
        >
          <Sprout className="h-3 w-3" /> Stake
        </Link>
        <Link
          to="/liquidity"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 hover:border-[#C5FF41]/40"
        >
          <Droplets className="h-3 w-3" /> LP
        </Link>
        <Link
          to="/forest/quests"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 hover:border-[#C5FF41]/40"
        >
          <Flame className="h-3 w-3" /> Quests
        </Link>
      </div>
    </section>
  );
}
