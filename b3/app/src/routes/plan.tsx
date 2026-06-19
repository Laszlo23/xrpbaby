import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";
import {
  PLAN_DEMAND_SERIES,
  PLAN_HERO_STATS,
  PLAN_LTV_CAC_SERIES,
  PLAN_OPEX_MIX,
  PLAN_PERSONAS,
  PLAN_REVENUE_MIX,
  PLAN_REVENUE_YEARS,
  PLAN_SECTIONS,
  type PlanBlock,
  type PlanSectionId,
} from "@/content/business-plan-content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/plan")({
  head: () =>
    pageHead({
      title: "Business plan — Building Culture",
      description:
        "Investor-facing business plan: market thesis, 12-product ecosystem, unit economics, and competitive moat — native content, illustrative projections only.",
      path: "/plan",
      keywords: [
        "business plan",
        "Building Culture",
        "BUILDCHAIN",
        "seed round",
        "RWA",
        "community ownership",
        "Base",
      ],
    }),
  component: PlanPage,
});

function RevenueBarChart() {
  const max = Math.max(...PLAN_REVENUE_YEARS.map((y) => y.value));
  return (
    <div className="flex items-end justify-center gap-6 sm:gap-10">
      {PLAN_REVENUE_YEARS.map((row) => (
        <div key={row.year} className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-stone-200">{row.label}</span>
          <div
            className="w-14 rounded-t-lg bg-gradient-to-t from-[rgb(180_83_9)] via-[rgb(217_119_6)] to-[rgb(251_191_36)] shadow-[0_0_32px_-8px_rgb(217_119_6/60%)] sm:w-20"
            style={{ height: `${Math.max(24, (row.value / max) * 160)}px` }}
            role="img"
            aria-label={`${row.year} projected revenue ${row.label}`}
          />
          <span className="text-xs text-zinc-500">{row.year}</span>
        </div>
      ))}
    </div>
  );
}

function RevenueMixDonut() {
  let cursor = 0;
  const stops = PLAN_REVENUE_MIX.map((slice) => {
    const start = cursor;
    cursor += slice.pct;
    return `${slice.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full shadow-[inset_0_0_0_12px_rgb(24_24_27)]"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label="Year 1 revenue mix"
      >
        <div className="absolute inset-[28%] flex flex-col items-center justify-center rounded-full bg-zinc-950/95 text-center">
          <span className="text-lg font-semibold text-white">Y1</span>
          <span className="text-[10px] text-zinc-500">revenue</span>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {PLAN_REVENUE_MIX.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2 text-zinc-400">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-zinc-300">{slice.pct}%</span>
            <span>{slice.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OpexBarChart() {
  const max = Math.max(...PLAN_OPEX_MIX.map((r) => r.pct));
  return (
    <div className="space-y-3">
      {PLAN_OPEX_MIX.map((row) => (
        <div key={row.name} className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span className="text-zinc-300">{row.name}</span>
            <span>
              {row.amount} ({row.pct}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-900">
            <div
              className="h-full rounded-full"
              style={{ width: `${(row.pct / max) * 100}%`, backgroundColor: row.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DemandLineChart() {
  const max = 18;
  const w = 320;
  const h = 120;
  const pad = 8;
  const points = PLAN_DEMAND_SERIES.map((d, i) => {
    const x = pad + (i / (PLAN_DEMAND_SERIES.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.demand / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-xl border border-stone-700/30 bg-stone-950/50 p-4">
      <p className="mb-3 text-xs font-medium text-zinc-400">
        Growth in demand for alternative real estate solutions (2019–2023)
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-md"
        role="img"
        aria-label="Demand growth line chart"
      >
        {[0, 4.5, 9, 13.5, 18].map((tick) => {
          const y = h - pad - (tick / max) * (h - pad * 2);
          return (
            <line
              key={tick}
              x1={pad}
              y1={y}
              x2={w - pad}
              y2={y}
              stroke="rgb(63 63 70)"
              strokeWidth="0.5"
            />
          );
        })}
        <polyline fill="none" stroke="rgb(217 119 6)" strokeWidth="2.5" points={points} />
        {PLAN_DEMAND_SERIES.map((d, i) => {
          const x = pad + (i / (PLAN_DEMAND_SERIES.length - 1)) * (w - pad * 2);
          const y = h - pad - (d.demand / max) * (h - pad * 2);
          return <circle key={d.year} cx={x} cy={y} r="3" fill="rgb(217 119 6)" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
        {PLAN_DEMAND_SERIES.map((d) => (
          <span key={d.year}>{d.year}</span>
        ))}
      </div>
    </div>
  );
}

function LtvCacChart() {
  const max = 28;
  const w = 320;
  const h = 120;
  const pad = 8;
  const points = PLAN_LTV_CAC_SERIES.map((d, i) => {
    const x = pad + (i / (PLAN_LTV_CAC_SERIES.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.ratio / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-xl border border-stone-700/30 bg-stone-950/50 p-4">
      <p className="mb-3 text-xs font-medium text-zinc-400">
        LTV:CAC ratio improvement over 36 months
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-md"
        role="img"
        aria-label="LTV to CAC ratio chart"
      >
        <polyline fill="none" stroke="rgb(0 82 255)" strokeWidth="2.5" points={points} />
        {PLAN_LTV_CAC_SERIES.map((d, i) => {
          const x = pad + (i / (PLAN_LTV_CAC_SERIES.length - 1)) * (w - pad * 2);
          const y = h - pad - (d.ratio / max) * (h - pad * 2);
          return (
            <circle
              key={d.month}
              cx={x}
              cy={y}
              r={d.month === 12 ? 4 : 3}
              fill={d.month === 12 ? "rgb(0 82 255)" : "rgb(96 165 250)"}
            />
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-zinc-500">
        Month 12 ratio: <span className="text-zinc-300">12.8×</span> · Month 36:{" "}
        <span className="text-zinc-300">~27.5×</span>
      </p>
    </div>
  );
}

function PlanBlockView({ block }: { block: PlanBlock }) {
  if (block.type === "paragraph") {
    return <p className="text-zinc-400">{block.text}</p>;
  }
  if (block.type === "bullets") {
    return (
      <ul className="list-disc space-y-2 pl-5 text-zinc-400">
        {block.items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {block.items.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-stone-700/30 bg-stone-900/20 px-4 py-3"
        >
          <p className="text-lg font-semibold text-stone-100">{stat.value}</p>
          <p className="text-sm text-[rgb(217_119_6)]">{stat.label}</p>
          {stat.detail ? <p className="mt-0.5 text-xs text-zinc-500">{stat.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

function PlanPage() {
  const scrollToSection = useCallback((id: PlanSectionId) => {
    document
      .getElementById(`plan-section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <MarketingShell
      eyebrow="Building Culture Capital"
      tone="purple"
      heroSize="compact"
      articleClassName="max-w-5xl"
      title={
        <>
          Business plan —{" "}
          <span className="bg-gradient-to-r from-stone-100 via-[rgb(217_119_6)] to-[rgb(180_83_9)] bg-clip-text text-transparent">
            community capitalism on Base
          </span>
        </>
      }
      subtitle="Structured seed narrative extracted from our deck: market thesis, product ecosystem, unit economics, and moat. Illustrative projections for discussion — not an offer."
      actions={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/investors"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Investor overview
          </Link>
          <Link
            to="/grant-proof"
            className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)]"
          >
            Live verification
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-14 md:gap-16">
        <DisclaimerBanner />

        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-4 text-sm text-amber-100/90">
          <strong className="font-medium text-amber-50">Deck vs reality:</strong> Figures below are
          planning scenarios from our business plan narrative. Audited production metrics live on{" "}
          <Link to="/investors" className="underline underline-offset-4">
            /investors
          </Link>{" "}
          and{" "}
          <Link to="/grant-proof" className="underline underline-offset-4">
            /grant-proof
          </Link>
          . Hypothetical raise/GMV sliders:{" "}
          <Link to="/investors/workshop" className="underline underline-offset-4">
            /investors/workshop
          </Link>
          .
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLAN_HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-stone-700/35 bg-gradient-to-br from-stone-900/50 to-stone-950/80 p-5"
            >
              <p className="text-2xl font-semibold tracking-tight text-stone-50 md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-[rgb(217_119_6)]">{stat.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Jump to section
          </h2>
          <nav className="flex flex-wrap gap-2">
            {PLAN_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="rounded-full border border-stone-700/50 px-4 py-1.5 text-sm text-zinc-400 transition hover:border-[rgb(217_119_6/45%)] hover:text-white"
              >
                {section.label}
              </button>
            ))}
          </nav>
        </section>

        <section className="grid gap-8 rounded-2xl border border-stone-700/30 bg-stone-950/40 p-6 md:grid-cols-2 md:p-8">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
              Revenue trajectory
            </h2>
            <RevenueBarChart />
          </div>
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
              Year 1 revenue mix
            </h2>
            <RevenueMixDonut />
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <DemandLineChart />
          <LtvCacChart />
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Year 1 operating expenses
          </h2>
          <OpexBarChart />
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Who we build for
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PLAN_PERSONAS.map((persona) => (
              <div
                key={persona.name}
                className="rounded-2xl border border-stone-700/35 bg-stone-900/25 p-5"
              >
                <p className="text-lg font-semibold text-stone-100">{persona.name}</p>
                <p className="text-sm text-[rgb(217_119_6)]">{persona.role}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  {persona.age ? (
                    <>
                      <dt>Age</dt>
                      <dd className="text-zinc-300">{persona.age}</dd>
                    </>
                  ) : null}
                  <dt>Income</dt>
                  <dd className="text-zinc-300">{persona.income}</dd>
                </dl>
                <p className="mt-3 text-sm text-zinc-400">{persona.hook}</p>
              </div>
            ))}
          </div>
        </section>

        {PLAN_SECTIONS.map((chapter) => (
          <section
            key={chapter.id}
            id={`plan-section-${chapter.id}`}
            className="scroll-mt-24 space-y-8"
          >
            <div className="border-b border-stone-700/40 pb-4">
              <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
                {chapter.label}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{chapter.description}</p>
            </div>
            {chapter.subsections.map((sub) => (
              <article key={sub.id} className="space-y-4">
                <h3 className="font-heading text-lg font-semibold text-stone-100 md:text-xl">
                  {sub.title}
                </h3>
                <div className="flex flex-col gap-4">
                  {sub.blocks.map((block, i) => (
                    <PlanBlockView key={`${sub.id}-${i}`} block={block} />
                  ))}
                </div>
              </article>
            ))}
          </section>
        ))}

        <section className="rounded-2xl border border-[rgb(0_82_255/25%)] bg-[rgb(0_82_255/8%)] px-5 py-4 text-sm text-zinc-300">
          <strong className="font-medium text-white">Due diligence:</strong> pair this narrative
          with live checks on{" "}
          <Link to="/grant-proof" className="text-white underline underline-offset-4">
            /grant-proof
          </Link>
          . Contact{" "}
          <a
            href="mailto:laszlo.bihary@gmail.com"
            className="text-white underline underline-offset-4"
          >
            laszlo.bihary@gmail.com
          </a>{" "}
          for the full document or data room access.
        </section>
      </div>
    </MarketingShell>
  );
}
