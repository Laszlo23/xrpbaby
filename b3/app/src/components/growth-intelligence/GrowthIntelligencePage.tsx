import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  Filter,
  Lightbulb,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";

import { ClickHeatmap } from "./ClickHeatmap";
import { FunnelChart } from "./FunnelChart";

type AppOption = { slug: string; name: string; tier: string };

type Overview = {
  activeUsers: number;
  returningUsers: number;
  sessions: number;
  events: number;
  rageClicks: number;
  conversionRate: number | null;
  topPages: { pathname: string; views: number }[];
};

type Insight = {
  id: string;
  title: string;
  body: string;
  severity: string;
  dayId: string;
  createdAt: string;
};

type Recommendation = {
  id: string;
  problem: string;
  rootCause: string;
  solution: string;
  impactEstimate: string | null;
  effort: string;
  priority: string;
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-200",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  info: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
};

const PRIORITY_CLASS: Record<string, string> = {
  critical: "text-red-300",
  high: "text-amber-300",
  medium: "text-cyan-200",
  low: "text-zinc-400",
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

const FUNNEL_HEATMAP_PATHS = [
  "/",
  "/join",
  "/forest",
  "/play",
  "/profile",
  "/pass",
  "/credentials",
  "/ecosystem",
] as const;

export function GrowthIntelligencePage() {
  const [apps, setApps] = useState<AppOption[]>([]);
  const [app, setApp] = useState("bc-id");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [funnel, setFunnel] = useState<{
    funnelName: string;
    totalSessions: number;
    steps: {
      id: string;
      label: string;
      sessions: number;
      conversionFromPrevious: number | null;
      dropoffPct: number | null;
    }[];
    biggestLeak: { stepId: string; label: string; dropoffPct: number } | null;
  } | null>(null);
  const [heatmapPath, setHeatmapPath] = useState("/");
  const [heatmap, setHeatmap] = useState<{
    cells: { gx: number; gy: number; count: number; intensity: number }[];
    gridSize: number;
    totalClicks: number;
    pathname: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (slug: string, pathForHeatmap: string) => {
    setLoading(true);
    try {
      const [ov, ins, rec, fun, hm] = await Promise.all([
        fetch(`/api/intelligence/overview?app=${slug}`).then((r) => r.json()),
        fetch(`/api/intelligence/insights?app=${slug}`).then((r) => r.json()),
        fetch(`/api/intelligence/recommendations?app=${slug}`).then((r) => r.json()),
        fetch(`/api/intelligence/funnels?app=${slug}`).then((r) => r.json()),
        fetch(
          `/api/intelligence/heatmap?app=${slug}&pathname=${encodeURIComponent(pathForHeatmap)}`,
        ).then((r) => r.json()),
      ]);
      if (ov.ok) setOverview(ov.overview);
      if (ins.ok) setInsights(ins.insights);
      if (rec.ok) setRecommendations(rec.recommendations);
      if (fun.ok) setFunnel(fun.funnel);
      if (hm.ok) setHeatmap(hm.heatmap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch("/api/intelligence/apps")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setApps(data.apps);
      });
  }, []);

  useEffect(() => {
    void load(app, heatmapPath);
  }, [app, heatmapPath, load]);

  return (
    <div className="min-h-screen bg-[#0a0f14] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400/80">
            Growth Intelligence
          </p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Product intelligence for Building Culture
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Observe behavior, identify friction, and prioritize improvements across the ecosystem.
            The AI watches. The AI learns. The AI recommends.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-400">Application</label>
          <select
            value={app}
            onChange={(e) => setApp(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            {apps.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
            {apps.length === 0 && <option value="bc-id">Building Culture ID</option>}
          </select>
          {loading && <span className="text-sm text-zinc-500">Loading…</span>}
        </div>

        {overview && (
          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active users" value={overview.activeUsers} icon={Users} />
            <StatCard label="Sessions" value={overview.sessions} icon={Activity} />
            <StatCard
              label="Conversion"
              value={overview.conversionRate != null ? `${overview.conversionRate}%` : "—"}
              icon={TrendingUp}
            />
            <StatCard label="Rage clicks" value={overview.rageClicks} icon={MousePointerClick} />
          </section>
        )}

        <div className="mb-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Filter className="h-5 w-5 text-violet-400" />
              Funnel intelligence
            </h2>
            {funnel ? (
              <FunnelChart
                funnelName={funnel.funnelName}
                totalSessions={funnel.totalSessions}
                steps={funnel.steps}
                biggestLeak={funnel.biggestLeak}
              />
            ) : (
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                Loading funnel…
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <MousePointerClick className="h-5 w-5 text-rose-400" />
              Click heatmap
            </h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {FUNNEL_HEATMAP_PATHS.map((path) => (
                <button
                  key={`funnel-${path}`}
                  type="button"
                  onClick={() => setHeatmapPath(path)}
                  className={`rounded-md px-2 py-1 font-mono text-xs ${
                    heatmapPath === path
                      ? "bg-violet-500/20 text-violet-200"
                      : "bg-white/5 text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {path}
                </button>
              ))}
              {(overview?.topPages ?? [{ pathname: "/" }]).slice(0, 5).map((p) => (
                <button
                  key={p.pathname}
                  type="button"
                  onClick={() => setHeatmapPath(p.pathname)}
                  className={`rounded-md px-2 py-1 font-mono text-xs ${
                    heatmapPath === p.pathname
                      ? "bg-cyan-500/20 text-cyan-200"
                      : "bg-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p.pathname}
                </button>
              ))}
            </div>
            {heatmap && (
              <ClickHeatmap
                cells={heatmap.cells}
                gridSize={heatmap.gridSize}
                totalClicks={heatmap.totalClicks}
                pathname={heatmap.pathname}
              />
            )}
          </section>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Brain className="h-5 w-5 text-cyan-400" />
              AI Insights
            </h2>
            <div className="space-y-3">
              {insights.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                  No insights yet. Run nightly analysis after SDK data flows in.
                </p>
              )}
              {insights.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-xl border p-4 ${SEVERITY_CLASS[item.severity] ?? SEVERITY_CLASS.info}`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-xs opacity-70">{item.dayId}</span>
                  </div>
                  <p className="text-sm opacity-90">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                  Recommendations appear after the first analysis run.
                </p>
              )}
              {recommendations.map((rec) => (
                <article key={rec.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase ${PRIORITY_CLASS[rec.priority] ?? ""}`}
                    >
                      {rec.priority} · {rec.effort} effort
                    </span>
                    {rec.impactEstimate && (
                      <span className="text-xs text-emerald-400">{rec.impactEstimate}</span>
                    )}
                  </div>
                  <h3 className="mb-1 font-medium text-white">{rec.problem}</h3>
                  <p className="mb-2 text-sm text-zinc-400">
                    <strong className="text-zinc-300">Root cause:</strong> {rec.rootCause}
                  </p>
                  <p className="text-sm text-cyan-100/90">
                    <strong className="text-cyan-200">Solution:</strong> {rec.solution}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {overview && overview.topPages.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Top pages
            </h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topPages.map((p) => (
                    <tr key={p.pathname} className="border-t border-white/5">
                      <td className="px-4 py-3 font-mono text-cyan-100/90">{p.pathname}</td>
                      <td className="px-4 py-3 text-right">{p.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer className="mt-12 text-xs text-zinc-600">
          Phase 2 — funnel leaks + click heatmaps across all ecosystem apps. Session replay via
          PostHog in Phase 3.
        </footer>
      </div>
    </div>
  );
}
