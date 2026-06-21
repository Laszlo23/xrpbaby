import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { ModuleShell } from "@/components/ModuleShell";
import { pageHead } from "@/lib/seo";
import { AGENT_SHARE_REVENUE_SPLIT } from "@/lib/grant-agent-config";
import { TREASURY_REVENUE_RULES, TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";

type MetricsResponse = {
  ok: boolean;
  updatedAt?: string;
  bridgeMode?: string;
  canonical?: {
    totalSupplyWei: string;
    lockedInVaultWei: string;
    treasuryBalanceWei: string;
    burnedWei: string;
    circulatingEstimateWei: string;
  };
  wrapped?: {
    address: string | null;
    totalSupplyWei: string;
  };
  staking?: {
    base: { totalStakedWei: string; configured: boolean };
    bsc: { totalStakedWei: string; configured: boolean };
  };
  bridge?: {
    totalLockedWei: string;
    totalUnlockedWei: string;
    lockNonce: string;
  };
};

function fmt(wei: string | undefined): string {
  if (!wei) return "—";
  try {
    const n = Number(formatUnits(BigInt(wei), 18));
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch {
    return "—";
  }
}

export const Route = createFileRoute("/bcc/dashboard")({
  head: () =>
    pageHead({
      title: "BCC Treasury Dashboard",
      description: "Canonical BCC supply, vault locks, wBCC on BNB Chain, burns, and staking TVL.",
      path: "/bcc/dashboard",
    }),
  component: BccDashboardPage,
});

function BccDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bcc-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/bcc/metrics");
      if (!res.ok) throw new Error("Failed to load metrics");
      return (await res.json()) as MetricsResponse;
    },
    refetchInterval: 60_000,
  });

  return (
    <ModuleShell
      moduleId="signal"
      title="BCC Treasury Dashboard"
      subtitle="BCC is the economic layer — supply, routing rules, and productive capital."
      hideHero
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total BCC supply (Base)"
          value={isLoading ? "…" : fmt(data?.canonical?.totalSupplyWei)}
          hint="Fixed fair-launch ERC-20"
        />
        <MetricCard
          label="Locked in bridge vault"
          value={isLoading ? "…" : fmt(data?.canonical?.lockedInVaultWei)}
          hint={`Bridge mode: ${data?.bridgeMode ?? "—"}`}
        />
        <MetricCard
          label="wBCC supply (BSC)"
          value={isLoading ? "…" : fmt(data?.wrapped?.totalSupplyWei)}
          hint={data?.wrapped?.address ? `${data.wrapped.address.slice(0, 10)}…` : "Not deployed"}
        />
        <MetricCard
          label="Burned (dead address)"
          value={isLoading ? "…" : fmt(data?.canonical?.burnedWei)}
          hint="Permanently removed from circulation"
        />
        <MetricCard
          label="Treasury holdings"
          value={isLoading ? "…" : fmt(data?.canonical?.treasuryBalanceWei)}
          hint="Gnosis Safe on Base"
        />
        <MetricCard
          label="Circulating (est.)"
          value={isLoading ? "…" : fmt(data?.canonical?.circulatingEstimateWei)}
          hint="Supply − vault − burn"
        />
        <MetricCard
          label="Roots TVL (Base)"
          value={isLoading ? "…" : fmt(data?.staking?.base.totalStakedWei)}
          hint={data?.staking?.base.configured ? "BccRootsStaking" : "Not configured"}
        />
        <MetricCard
          label="Roots TVL (BSC)"
          value={isLoading ? "…" : fmt(data?.staking?.bsc.totalStakedWei)}
          hint={data?.staking?.bsc.configured ? "WbccRootsStaking" : "Not configured"}
        />
        <MetricCard
          label="Bridge volume (locks)"
          value={isLoading ? "…" : fmt(data?.bridge?.totalLockedWei)}
          hint={`Unlocks: ${fmt(data?.bridge?.totalUnlockedWei)} · nonce ${data?.bridge?.lockNonce ?? "—"}`}
        />
      </div>

      {error ? (
        <p className="mt-6 text-sm text-red-400">
          {error instanceof Error ? error.message : "Error"}
        </p>
      ) : null}

      <section className="mt-12 rounded-2xl border border-white/10 bg-black/40 p-6">
        <p className="mono-label">REVENUE ROUTING</p>
        <p className="mt-2 text-sm text-zinc-400">
          Published policy — executed manually via Gnosis Safe until on-chain fee router ships.
          Treasury:{" "}
          <span className="font-mono text-zinc-300">{TREASURY_SAFE_ADDRESS.slice(0, 10)}…</span>
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TREASURY_REVENUE_RULES.map((bucket) => (
            <div key={bucket.id} className="rounded-xl border border-white/10 px-4 py-3">
              <p className="text-2xl font-bold text-white">{bucket.percent}%</p>
              <p className="mt-1 text-sm font-medium text-zinc-200">{bucket.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{bucket.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="mono-label !text-amber-300/90">AGENT SHARES — TARGET SPLIT</p>
        <p className="mt-2 text-sm text-zinc-400">
          Grant Agent BCC stake vault MVP — target economics for productive capital (on-chain vault
          in progress).
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="text-zinc-300">
            Stakers {AGENT_SHARE_REVENUE_SPLIT.stakersBps / 100}%
          </span>
          <span className="text-zinc-300">
            Treasury {AGENT_SHARE_REVENUE_SPLIT.treasuryBps / 100}%
          </span>
          <span className="text-zinc-300">
            Builder {AGENT_SHARE_REVENUE_SPLIT.builderBps / 100}%
          </span>
          <span className="text-zinc-300">Burn {AGENT_SHARE_REVENUE_SPLIT.burnBps / 100}%</span>
        </div>
        <Link to="/campaign" className="mt-4 inline-block text-sm text-amber-300 hover:underline">
          Agent Share NFTs →
        </Link>
      </section>

      <section className="mt-8">
        <style>{`
          #dexscreener-embed {
            position: relative;
            width: 100%;
            padding-bottom: 125%;
          }
          @media (min-width: 1400px) {
            #dexscreener-embed {
              padding-bottom: 65%;
            }
          }
          #dexscreener-embed iframe {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border: 0;
          }
        `}</style>
        <div id="dexscreener-embed">
          <iframe
            title="BCC on DexScreener"
            src="https://dexscreener.com/base/0xbb1a4e26d908a8fdddcea5d634faaa47eb8959b78384af66fea0bf45732143fb?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
          />
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/bridge/bcc" className="text-[#C5FF41] hover:underline">
          Bridge BCC ↔ wBCC
        </Link>
        <Link to="/bcc/fair-launch" className="text-[#C5FF41] hover:underline">
          Fair launch (BSC)
        </Link>
        <Link to="/pass" className="text-[#C5FF41] hover:underline">
          Culture Pass rewards
        </Link>
        <Link to="/roots" className="text-[#C5FF41] hover:underline">
          Culture Roots staking
        </Link>
      </div>

      {data?.updatedAt ? (
        <p className="mt-4 text-xs text-zinc-500">
          Updated {new Date(data.updatedAt).toLocaleString()}
        </p>
      ) : null}
    </ModuleShell>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
