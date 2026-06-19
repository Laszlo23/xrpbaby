import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

type Insight = {
  title: string;
  body: string;
  href?: string;
};

export function CultureSignalsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intelligence/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const recs =
          (data?.recommendations as { title?: string; summary?: string }[] | undefined) ?? [];
        setInsights(
          recs.slice(0, 3).map((r) => ({
            title: r.title ?? "Culture signal",
            body: r.summary ?? "Growth intelligence insight for builders.",
            href: "/intelligence",
          })),
        );
      })
      .catch(() =>
        setInsights([
          {
            title: "Research Agent",
            body: "Ask for ecosystem signals via the agent inbox — proof over promise.",
            href: "/agents/inbox",
          },
        ]),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#839788]/10 to-transparent p-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[#C5FF41]" />
        <h2 className="font-display text-lg font-semibold text-white">Culture Signals</h2>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Insights & community signals — not investment advice.
      </p>
      {loading ? (
        <p className="mt-4 animate-pulse text-sm text-zinc-500">Loading signals…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {insights.map((item) => (
            <li key={item.title} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs text-zinc-400">{item.body}</p>
              {item.href ? (
                <Link
                  to={item.href}
                  className="mt-2 inline-block text-xs text-[#00E5FF] hover:underline"
                >
                  Open →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
