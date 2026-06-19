import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { ConnectIdentityGraph } from "@/components/connect/ConnectIdentityGraph";
import { CultureSignalsPanel } from "@/components/agents/CultureSignalsPanel";
import { MemoryTimeline } from "@/components/legacy/MemoryTimeline";
import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";

type LegacyStats = {
  culturePoints?: number;
  questCount?: number;
  tenureDays?: number;
};

export function LegacyDashboard() {
  const { address, isConnected } = useAccount();
  const { primaryName } = useWalletCultureIdentity();
  const [stats, setStats] = useState<LegacyStats>({});

  useEffect(() => {
    if (!address) return;
    fetch(`/api/member/me?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then(
        (d: {
          member?: { culturePoints?: number; completedSlugs?: string[]; createdAt?: string };
        }) => {
          const m = d.member;
          if (!m) return;
          const created = m.createdAt ? new Date(m.createdAt) : null;
          const tenureDays = created
            ? Math.max(1, Math.floor((Date.now() - created.getTime()) / 86400000))
            : undefined;
          setStats({
            culturePoints: m.culturePoints,
            questCount: m.completedSlugs?.length,
            tenureDays,
          });
        },
      )
      .catch(() => undefined);
  }, [address]);

  if (!isConnected || !address) {
    return (
      <p className="text-center text-zinc-400">
        <Link to="/join" className="text-[#C5FF41] underline">
          Connect
        </Link>{" "}
        to view your legacy dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[var(--vault-gold)]/25 bg-gradient-to-br from-[var(--vault-gold)]/10 via-transparent to-[#00E5FF]/5 p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--vault-gold)]">
          Layer 5 · Legacy
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          {primaryName ?? "Your legacy"}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Building since {stats.tenureDays ?? "—"} days · {stats.questCount ?? 0} stories ·{" "}
          {stats.culturePoints ?? 0} Culture Points
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/profile"
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-white hover:border-white/30"
          >
            Full profile
          </Link>
          <Link
            to="/legacy/analytics"
            className="rounded-full border border-[#00E5FF]/30 px-4 py-2 text-xs text-[#00E5FF]"
          >
            Analytics →
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <MemoryTimeline address={address} />
        <CultureSignalsPanel />
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-950/50 p-5">
        <h2 className="font-display text-lg font-semibold text-white">Connections</h2>
        <div className="mt-4">
          <ConnectIdentityGraph address={address} cultureName={primaryName} />
        </div>
      </section>
    </div>
  );
}
